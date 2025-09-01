import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableStateService } from '../../services/table-state.service';
import { TableSelectionService } from '../../services/table-selection.service';
import { TableOperationsService } from '../../services/table-operations.service';
import { TableImportExportService } from '../../services/table-import-export.service';
import { TableData, TableBorderStyle } from '../../interfaces/table-config.interface';
import { SortDirection } from '../../interfaces/table-operations.interface';

/**
 * Contextual toolbar for table editing with quick access controls
 */
@Component({
  selector: 'ng-ui-table-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-toolbar" [class.visible]="isVisible()">
      <!-- File operations -->
      <div class="toolbar-section">
        <div class="section-label">File</div>
        <div class="toolbar-buttons">
          <button 
            class="toolbar-button"
            title="Import CSV"
            (click)="importCSV()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
              <path d="M4.5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z"/>
            </svg>
            Import CSV
          </button>
          
          <button 
            class="toolbar-button"
            title="Export CSV"
            [disabled]="!hasTable()"
            (click)="exportCSV()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c-.314.418-.5.937-.5 1.5v6h-2a.5.5 0 0 0-.354.146L4.793 8l.353.354A.5.5 0 0 0 5.5 8.5H8v6.5a1.5 1.5 0 0 1-1.5-1.5V9H6a.5.5 0 0 1-.5-.5v-3A.5.5 0 0 1 6 5h2V1.5z"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Table structure operations -->
      <div class="toolbar-section">
        <div class="section-label">Structure</div>
        <div class="toolbar-buttons">
          <button 
            class="toolbar-button"
            title="Insert Row Above"
            [disabled]="!hasSelection()"
            (click)="insertRowAbove()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Row ↑
          </button>
          
          <button 
            class="toolbar-button"
            title="Insert Row Below"
            [disabled]="!hasSelection()"
            (click)="insertRowBelow()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Row ↓
          </button>
          
          <button 
            class="toolbar-button"
            title="Insert Column Left"
            [disabled]="!hasSelection()"
            (click)="insertColumnLeft()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Col ←
          </button>
          
          <button 
            class="toolbar-button"
            title="Insert Column Right"
            [disabled]="!hasSelection()"
            (click)="insertColumnRight()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Col →
          </button>
          
          <div class="button-divider"></div>
          
          <button 
            class="toolbar-button danger"
            title="Delete Row"
            [disabled]="!hasSelection()"
            (click)="deleteRow()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
            Del Row
          </button>
          
          <button 
            class="toolbar-button danger"
            title="Delete Column"
            [disabled]="!hasSelection()"
            (click)="deleteColumn()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
            Del Col
          </button>
        </div>
      </div>

      <!-- Cell operations -->
      <div class="toolbar-section">
        <div class="section-label">Cells</div>
        <div class="toolbar-buttons">
          <button 
            class="toolbar-button"
            title="Merge Cells"
            [disabled]="!canMergeCells()"
            (click)="mergeCells()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z"/>
            </svg>
            Merge
          </button>
          
          <button 
            class="toolbar-button"
            title="Split Cell"
            [disabled]="!canSplitCell()"
            (click)="splitCell()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M1 1h14v14H1V1zm1 1v12h12V2H2z"/>
              <path d="M8 4v8M4 8h8" stroke="currentColor" stroke-width="1" fill="none"/>
            </svg>
            Split
          </button>
          
          <div class="button-divider"></div>
          
          <button 
            class="toolbar-button"
            title="Copy"
            [disabled]="!hasSelection()"
            (click)="copy()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2H12v1H3a1 1 0 0 0-1 1V14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3.5a1 1 0 0 0-1-1H4v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            Copy
          </button>
          
          <button 
            class="toolbar-button"
            title="Paste"
            [disabled]="!canPaste()"
            (click)="paste()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c-.314.418-.5.937-.5 1.5v6h-2a.5.5 0 0 0-.354.146L4.793 8l.353.354A.5.5 0 0 0 5.5 8.5H8v6.5a1.5 1.5 0 0 1-1.5-1.5V9H6a.5.5 0 0 1-.5-.5v-3A.5.5 0 0 1 6 5h2V1.5z"/>
            </svg>
            Paste
          </button>
        </div>
      </div>

      <!-- Formatting -->
      <div class="toolbar-section">
        <div class="section-label">Format</div>
        <div class="toolbar-buttons">
          <div class="dropdown-container">
            <button 
              class="toolbar-button dropdown-toggle"
              title="Border Style"
              [disabled]="!hasTable()"
              (click)="toggleBorderDropdown()">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M0 0h16v1H0V0zm0 15h16v1H0v-1z"/>
              </svg>
              Border
              <svg class="dropdown-arrow" width="8" height="8" viewBox="0 0 8 8">
                <path d="M0 2l4 4 4-4z"/>
              </svg>
            </button>
            
            @if (showBorderDropdown()) {
              <div class="dropdown-menu">
                <button 
                  class="dropdown-item"
                  [class.active]="currentBorderStyle() === 'solid'"
                  (click)="setBorderStyle('solid')">
                  <div class="border-preview solid"></div>
                  Solid
                </button>
                <button 
                  class="dropdown-item"
                  [class.active]="currentBorderStyle() === 'dashed'"
                  (click)="setBorderStyle('dashed')">
                  <div class="border-preview dashed"></div>
                  Dashed
                </button>
                <button 
                  class="dropdown-item"
                  [class.active]="currentBorderStyle() === 'dotted'"
                  (click)="setBorderStyle('dotted')">
                  <div class="border-preview dotted"></div>
                  Dotted
                </button>
                <button 
                  class="dropdown-item"
                  [class.active]="currentBorderStyle() === 'none'"
                  (click)="setBorderStyle('none')">
                  <div class="border-preview none"></div>
                  None
                </button>
              </div>
            }
          </div>
          
          <div class="dropdown-container">
            <button 
              class="toolbar-button dropdown-toggle"
              title="Sort"
              [disabled]="!hasSelection()"
              (click)="toggleSortDropdown()">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M3 9a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 9zM3 5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 3 5zM3 1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1 3 1z"/>
              </svg>
              Sort
              <svg class="dropdown-arrow" width="8" height="8" viewBox="0 0 8 8">
                <path d="M0 2l4 4 4-4z"/>
              </svg>
            </button>
            
            @if (showSortDropdown()) {
              <div class="dropdown-menu">
                <button class="dropdown-item" (click)="sortColumn('asc')">
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M6 2L2 8h8L6 2z"/>
                  </svg>
                  Sort A → Z
                </button>
                <button class="dropdown-item" (click)="sortColumn('desc')">
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M6 10L2 4h8L6 10z"/>
                  </svg>
                  Sort Z → A
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Table actions -->
      <div class="toolbar-section">
        <div class="section-label">Table</div>
        <div class="toolbar-buttons">
          <button 
            class="toolbar-button"
            title="Table Properties"
            [disabled]="!hasTable()"
            (click)="openProperties()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm1 1h12v12H2V1z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Properties
          </button>
          
          <div class="button-divider"></div>
          
          <button 
            class="toolbar-button"
            title="Undo"
            [disabled]="!canUndo()"
            (click)="undo()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
            </svg>
            Undo
          </button>
          
          <button 
            class="toolbar-button"
            title="Redo"
            [disabled]="!canRedo()"
            (click)="redo()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Redo
          </button>
          
          <div class="button-divider"></div>
          
          <button 
            class="toolbar-button danger"
            title="Delete Table"
            [disabled]="!hasTable()"
            (click)="deleteTable()">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <!-- File input for CSV import -->
      <input 
        #fileInput 
        type="file" 
        accept=".csv,.txt" 
        style="display: none"
        (change)="onFileSelected($event)">
    </div>
  `,
  styleUrls: ['./table-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableToolbarComponent {
  private readonly tableState = inject(TableStateService);
  private readonly selectionService = inject(TableSelectionService);
  private readonly operations = inject(TableOperationsService);
  private readonly importExport = inject(TableImportExportService);

  // Inputs and outputs
  readonly visible = input<boolean>(true);
  readonly propertiesClicked = output<void>();
  readonly tableDeleted = output<void>();

  // Dropdown states
  private readonly _showBorderDropdown = signal<boolean>(false);
  private readonly _showSortDropdown = signal<boolean>(false);

  // Computed properties
  readonly isVisible = computed(() => this.visible() && this.tableState.showTableToolbar());
  readonly hasTable = this.tableState.hasTable;
  readonly hasSelection = this.selectionService.hasSelection;
  readonly canUndo = this.tableState.canUndo;
  readonly canRedo = this.tableState.canRedo;
  readonly showBorderDropdown = this._showBorderDropdown.asReadonly();
  readonly showSortDropdown = this._showSortDropdown.asReadonly();

  readonly canMergeCells = computed(() => 
    this.selectionService.selectedCellsCount() > 1
  );

  readonly canSplitCell = computed(() => {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return false;
    const cell = this.tableState.getCellAt(activeCell.row, activeCell.column);
    return !!(cell?.rowSpan && cell.rowSpan > 1) || !!(cell?.colSpan && cell.colSpan > 1);
  });

  readonly canPaste = computed(() => {
    // This would check if there's clipboard data available
    return this.hasSelection();
  });

  readonly currentBorderStyle = computed(() => {
    const table = this.tableState.tableData();
    return table?.config.borderStyle || TableBorderStyle.SOLID;
  });

  // File operations
  importCSV(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const csvData = await this.importExport.readFile(file);
      const tableData = this.importExport.importCSV(csvData, {
        hasHeader: true,
        trimWhitespace: true
      });
      
      this.tableState.updateTableData(tableData);
    } catch (error) {
      console.error('Error importing CSV:', error);
      // You might want to show a toast or error message here
    }

    // Clear the input
    input.value = '';
  }

  exportCSV(): void {
    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const csvData = this.importExport.exportCSV(tableData, {
      includeHeaders: true
    });

    this.importExport.downloadFile(
      csvData,
      `table_${new Date().getTime()}.csv`,
      'text/csv'
    );
  }

  // Structure operations
  insertRowAbove(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertRow(tableData, activeCell.row);
    this.tableState.updateTableData(updatedTable);
  }

  insertRowBelow(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertRow(tableData, activeCell.row + 1);
    this.tableState.updateTableData(updatedTable);
  }

  insertColumnLeft(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertColumn(tableData, activeCell.column);
    this.tableState.updateTableData(updatedTable);
  }

  insertColumnRight(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertColumn(tableData, activeCell.column + 1);
    this.tableState.updateTableData(updatedTable);
  }

  deleteRow(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.deleteRow(tableData, activeCell.row);
    this.tableState.updateTableData(updatedTable);
  }

  deleteColumn(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.deleteColumn(tableData, activeCell.column);
    this.tableState.updateTableData(updatedTable);
  }

  // Cell operations
  mergeCells(): void {
    const range = this.selectionService.getSelectionRange();
    if (!range) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.mergeCells(tableData, range);
    this.tableState.updateTableData(updatedTable);
  }

  splitCell(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.splitCell(tableData, activeCell.row, activeCell.column);
    this.tableState.updateTableData(updatedTable);
  }

  copy(): void {
    const range = this.selectionService.getSelectionRange();
    if (!range) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const copiedData = this.operations.copyCells(tableData, range);
    // Store in clipboard or internal storage
  }

  paste(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    // Implementation would paste from clipboard data
  }

  // Formatting operations
  toggleBorderDropdown(): void {
    this._showBorderDropdown.update(show => !show);
    this._showSortDropdown.set(false);
  }

  setBorderStyle(style: string): void {
    this.tableState.updateTableConfig({
      borderStyle: style as TableBorderStyle
    });
    this._showBorderDropdown.set(false);
  }

  toggleSortDropdown(): void {
    this._showSortDropdown.update(show => !show);
    this._showBorderDropdown.set(false);
  }

  sortColumn(direction: 'asc' | 'desc'): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const sortDirection = direction === 'asc' ? SortDirection.ASC : SortDirection.DESC;
    const updatedTable = this.operations.sortByColumn(tableData, activeCell.column, sortDirection);
    this.tableState.updateTableData(updatedTable);
    this._showSortDropdown.set(false);
  }

  // Table actions
  openProperties(): void {
    this.propertiesClicked.emit();
  }

  undo(): void {
    this.tableState.undo();
  }

  redo(): void {
    this.tableState.redo();
  }

  deleteTable(): void {
    if (confirm('Are you sure you want to delete this table?')) {
      this.tableState.clearTable();
      this.tableDeleted.emit();
    }
  }
}