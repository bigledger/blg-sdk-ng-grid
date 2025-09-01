import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
  ElementRef,
  ViewChild,
  HostListener,
  effect,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableData, TableCell } from '../../interfaces/table-config.interface';
import { CellPosition, SelectionRect } from '../../interfaces/table-selection.interface';
import { TableStateService } from '../../services/table-state.service';
import { TableSelectionService } from '../../services/table-selection.service';
import { TableOperationsService } from '../../services/table-operations.service';

/**
 * Main table editor component with cell selection and manipulation
 */
@Component({
  selector: 'ng-ui-table-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-editor" 
         [class.has-table]="hasTable()"
         [class.editing]="isEditing()"
         tabindex="0"
         (keydown)="onKeyDown($event)"
         (contextmenu)="onContextMenu($event)">
      
      @if (hasTable()) {
        <div class="table-container" #tableContainer>
          <!-- Column headers with resize handles -->
          <div class="column-headers">
            <div class="corner-cell" 
                 (click)="selectAll()"
                 [class.selected]="isTableSelected()">
            </div>
            @for (col of tableColumns(); track $index) {
              <div class="column-header" 
                   [style.width]="getColumnWidth($index)"
                   (click)="selectColumn($index, $event.ctrlKey || $event.metaKey)"
                   [class.selected]="isColumnSelected($index)">
                <span class="column-label">{{ getColumnLabel($index) }}</span>
                <div class="resize-handle" 
                     (mousedown)="startColumnResize($index, $event)"
                     (click)="$event.stopPropagation()">
                </div>
              </div>
            }
          </div>

          <!-- Table content -->
          <div class="table-content" 
               (mousedown)="startSelection($event)"
               (mousemove)="updateSelection($event)"
               (mouseup)="endSelection($event)">
            
            <!-- Row headers and cells -->
            @for (row of tableRows(); track $index; let rowIndex = $index) {
              <div class="table-row" 
                   [class.header-row]="row.isHeader"
                   [class.selected]="isRowSelected(rowIndex)">
                
                <!-- Row number/header -->
                <div class="row-header" 
                     (click)="selectRow(rowIndex, $event.ctrlKey || $event.metaKey)"
                     [class.selected]="isRowSelected(rowIndex)">
                  {{ rowIndex + 1 }}
                </div>

                <!-- Row cells -->
                @for (cell of row.cells; track $index; let colIndex = $index) {
                  <div class="table-cell"
                       [style.width]="getColumnWidth(colIndex)"
                       [style.background-color]="cell.backgroundColor"
                       [style.color]="cell.textColor"
                       [style.text-align]="cell.alignment"
                       [style.padding]="cell.padding"
                       [class.header-cell]="cell.isHeader"
                       [class.selected]="isCellSelected(rowIndex, colIndex)"
                       [class.active]="isCellActive(rowIndex, colIndex)"
                       [class.editing]="isCellEditing(rowIndex, colIndex)"
                       [attr.data-row]="rowIndex"
                       [attr.data-col]="colIndex"
                       (click)="selectCell(rowIndex, colIndex, $event)"
                       (dblclick)="startCellEditing(rowIndex, colIndex)"
                       (mouseenter)="onCellHover(rowIndex, colIndex, $event)">
                    
                    @if (isCellEditing(rowIndex, colIndex)) {
                      <input 
                        #cellEditor
                        class="cell-editor"
                        type="text"
                        [(ngModel)]="editingContent"
                        (blur)="finishCellEditing()"
                        (keydown)="onCellEditorKeyDown($event)"
                        (focus)="onCellEditorFocus()">
                    } @else {
                      <div class="cell-content" 
                           [innerHTML]="getCellDisplayContent(cell)">
                      </div>
                      
                      @if (cell.rowSpan && cell.rowSpan > 1) {
                        <div class="span-indicator row-span">{{ cell.rowSpan }}</div>
                      }
                      @if (cell.colSpan && cell.colSpan > 1) {
                        <div class="span-indicator col-span">{{ cell.colSpan }}</div>
                      }
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Selection overlay -->
          @if (dragSelection()) {
            <div class="selection-overlay"
                 [style.top.px]="dragSelection()!.selectionRect.top"
                 [style.left.px]="dragSelection()!.selectionRect.left"
                 [style.width.px]="dragSelection()!.selectionRect.width"
                 [style.height.px]="dragSelection()!.selectionRect.height">
            </div>
          }

          <!-- Context menu -->
          @if (showContextMenu()) {
            <div class="context-menu"
                 [style.top.px]="contextMenuPosition().y"
                 [style.left.px]="contextMenuPosition().x"
                 (click)="$event.stopPropagation()">
              
              <div class="context-menu-section">
                <button class="context-menu-item" 
                        (click)="copySelection()"
                        [disabled]="!hasSelection()">
                  <span class="icon">📋</span>
                  Copy
                  <span class="shortcut">Ctrl+C</span>
                </button>
                <button class="context-menu-item" 
                        (click)="pasteSelection()"
                        [disabled]="!canPaste()">
                  <span class="icon">📄</span>
                  Paste
                  <span class="shortcut">Ctrl+V</span>
                </button>
              </div>

              <div class="context-menu-divider"></div>

              <div class="context-menu-section">
                <button class="context-menu-item" (click)="insertRowAbove()">
                  <span class="icon">➕</span>
                  Insert Row Above
                </button>
                <button class="context-menu-item" (click)="insertRowBelow()">
                  <span class="icon">➕</span>
                  Insert Row Below
                </button>
                <button class="context-menu-item" (click)="deleteSelectedRows()">
                  <span class="icon">➖</span>
                  Delete Row(s)
                </button>
              </div>

              <div class="context-menu-divider"></div>

              <div class="context-menu-section">
                <button class="context-menu-item" (click)="insertColumnLeft()">
                  <span class="icon">➕</span>
                  Insert Column Left
                </button>
                <button class="context-menu-item" (click)="insertColumnRight()">
                  <span class="icon">➕</span>
                  Insert Column Right
                </button>
                <button class="context-menu-item" (click)="deleteSelectedColumns()">
                  <span class="icon">➖</span>
                  Delete Column(s)
                </button>
              </div>

              <div class="context-menu-divider"></div>

              <div class="context-menu-section">
                <button class="context-menu-item" 
                        (click)="mergeCells()"
                        [disabled]="!canMergeCells()">
                  <span class="icon">⊞</span>
                  Merge Cells
                </button>
                <button class="context-menu-item" 
                        (click)="splitCells()"
                        [disabled]="!canSplitCells()">
                  <span class="icon">⊟</span>
                  Split Cells
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="no-table-message">
          <p>No table selected. Create a table to start editing.</p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./table-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableEditorComponent implements AfterViewInit {
  private readonly tableState = inject(TableStateService);
  private readonly selectionService = inject(TableSelectionService);
  private readonly operations = inject(TableOperationsService);

  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('cellEditor') cellEditor!: ElementRef<HTMLInputElement>;

  // Inputs and outputs
  readonly tableChanged = output<TableData>();
  readonly cellEdited = output<{ row: number; column: number; value: string }>();

  // Selection state
  private readonly _isMouseDown = signal<boolean>(false);
  private readonly _dragStartCell = signal<CellPosition | null>(null);
  private readonly _showContextMenu = signal<boolean>(false);
  private readonly _contextMenuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  // Editing state
  readonly editingContent = signal<string>('');
  private readonly _copiedData = signal<any>(null);

  // Column resizing state
  private readonly _resizingColumn = signal<number | null>(null);
  private readonly _resizeStartX = signal<number>(0);
  private readonly _resizeStartWidth = signal<number>(0);

  // Computed properties
  readonly hasTable = this.tableState.hasTable;
  readonly tableData = this.tableState.tableData;
  readonly isEditing = this.tableState.isEditing;
  readonly editingCell = this.tableState.editingCell;
  readonly hasSelection = this.selectionService.hasSelection;
  readonly dragSelection = this.selectionService.dragSelection;
  readonly showContextMenu = this._showContextMenu.asReadonly();
  readonly contextMenuPosition = this._contextMenuPosition.asReadonly();

  readonly tableRows = computed(() => this.tableData()?.rows || []);
  readonly tableColumns = computed(() => {
    const table = this.tableData();
    return table ? Array.from({ length: table.config.columns }, (_, i) => i) : [];
  });

  constructor() {
    // Auto-focus cell editor when editing starts
    effect(() => {
      if (this.isEditing()) {
        setTimeout(() => {
          this.cellEditor?.nativeElement?.focus();
          this.cellEditor?.nativeElement?.select();
        });
      }
    });

    // Close context menu on outside clicks
    effect(() => {
      if (this._showContextMenu()) {
        const handleClick = () => this.hideContextMenu();
        document.addEventListener('click', handleClick, { once: true });
      }
    });
  }

  ngAfterViewInit(): void {
    // Set up mouse event listeners for column resizing
    this.setupColumnResizing();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Prevent default browser behavior for table navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
    }

    // Handle keyboard navigation
    if (event.key.startsWith('Arrow')) {
      this.selectionService.handleKeyboardNavigation(
        event.key as any,
        event.shiftKey,
        event.ctrlKey || event.metaKey
      );
      return;
    }

    // Handle keyboard shortcuts
    this.selectionService.handleKeyboardShortcut(
      event.key,
      event.ctrlKey || event.metaKey,
      event.shiftKey
    );

    // Handle copy/paste
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'c':
        case 'C':
          event.preventDefault();
          this.copySelection();
          break;
        case 'v':
        case 'V':
          event.preventDefault();
          this.pasteSelection();
          break;
        case 'x':
        case 'X':
          event.preventDefault();
          this.cutSelection();
          break;
      }
    }

    // Handle editing shortcuts
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.clearSelectedCells();
    }

    if (event.key === 'Enter') {
      const activeCell = this.selectionService.activeCell();
      if (activeCell && !this.isEditing()) {
        this.startCellEditing(activeCell.row, activeCell.column);
      }
    }

    if (event.key === 'Escape') {
      if (this.isEditing()) {
        this.cancelCellEditing();
      } else {
        this.hideContextMenu();
      }
    }
  }

  // Selection methods
  startSelection(event: MouseEvent): void {
    const cellInfo = this.getCellFromEvent(event);
    if (!cellInfo) return;

    this._isMouseDown.set(true);
    this._dragStartCell.set({ row: cellInfo.row, column: cellInfo.column });

    this.selectionService.startDragSelection(cellInfo.row, cellInfo.column);
    this.hideContextMenu();
  }

  updateSelection(event: MouseEvent): void {
    if (!this._isMouseDown()) return;

    const cellInfo = this.getCellFromEvent(event);
    if (!cellInfo) return;

    const rect = this.calculateSelectionRect(
      this._dragStartCell()!,
      { row: cellInfo.row, column: cellInfo.column }
    );

    this.selectionService.updateDragSelection(cellInfo.row, cellInfo.column, rect);
  }

  endSelection(event: MouseEvent): void {
    if (!this._isMouseDown()) return;

    this._isMouseDown.set(false);
    this.selectionService.endDragSelection();
    this._dragStartCell.set(null);
  }

  selectCell(row: number, column: number, event: MouseEvent): void {
    event.stopPropagation();
    const extend = event.shiftKey;
    this.selectionService.selectCell(row, column, extend);
  }

  selectRow(row: number, extend: boolean): void {
    this.selectionService.selectRow(row, extend);
  }

  selectColumn(column: number, extend: boolean): void {
    this.selectionService.selectColumn(column, extend);
  }

  selectAll(): void {
    this.selectionService.selectAll();
  }

  // Cell editing methods
  startCellEditing(row: number, column: number): void {
    const cell = this.tableState.getCellAt(row, column);
    if (!cell) return;

    this.editingContent.set(cell.content || '');
    this.tableState.startEditing(row, column);
  }

  finishCellEditing(): void {
    const editingCell = this.editingCell();
    if (!editingCell) return;

    const newContent = this.editingContent();
    this.tableState.updateCell(editingCell.row, editingCell.column, {
      content: newContent
    });

    this.cellEdited.emit({
      row: editingCell.row,
      column: editingCell.column,
      value: newContent
    });

    this.tableState.stopEditing();
  }

  cancelCellEditing(): void {
    this.tableState.stopEditing();
  }

  onCellEditorKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.finishCellEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelCellEditing();
    }
  }

  onCellEditorFocus(): void {
    // Handle cell editor focus
  }

  onCellHover(row: number, column: number, event: MouseEvent): void {
    // Handle cell hover for potential drag selection updates
  }

  // Context menu methods
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    
    const cellInfo = this.getCellFromEvent(event);
    if (cellInfo) {
      this.selectionService.selectCell(cellInfo.row, cellInfo.column);
    }

    this._contextMenuPosition.set({ x: event.clientX, y: event.clientY });
    this._showContextMenu.set(true);
  }

  hideContextMenu(): void {
    this._showContextMenu.set(false);
  }

  // Table manipulation methods
  insertRowAbove(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertRow(tableData, activeCell.row);
    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
    this.hideContextMenu();
  }

  insertRowBelow(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertRow(tableData, activeCell.row + 1);
    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
    this.hideContextMenu();
  }

  insertColumnLeft(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertColumn(tableData, activeCell.column);
    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
    this.hideContextMenu();
  }

  insertColumnRight(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.insertColumn(tableData, activeCell.column + 1);
    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
    this.hideContextMenu();
  }

  deleteSelectedRows(): void {
    // Implementation for deleting selected rows
    this.hideContextMenu();
  }

  deleteSelectedColumns(): void {
    // Implementation for deleting selected columns
    this.hideContextMenu();
  }

  mergeCells(): void {
    const range = this.selectionService.getSelectionRange();
    if (!range) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.mergeCells(tableData, range);
    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
    this.hideContextMenu();
  }

  splitCells(): void {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.splitCell(tableData, activeCell.row, activeCell.column);
    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
    this.hideContextMenu();
  }

  // Copy/paste methods
  copySelection(): void {
    const range = this.selectionService.getSelectionRange();
    if (!range) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const copiedData = this.operations.copyCells(tableData, range);
    this._copiedData.set(copiedData);
    this.hideContextMenu();
  }

  pasteSelection(): void {
    const activeCell = this.selectionService.activeCell();
    const copiedData = this._copiedData();
    if (!activeCell || !copiedData) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const updatedTable = this.operations.pasteCells(
      tableData,
      activeCell.row,
      activeCell.column,
      copiedData
    );
    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
    this.hideContextMenu();
  }

  cutSelection(): void {
    this.copySelection();
    this.clearSelectedCells();
  }

  clearSelectedCells(): void {
    const selectedCells = this.selectionService.getSelectedCellData();
    if (selectedCells.length === 0) return;

    const tableData = this.tableState.tableData();
    if (!tableData) return;

    let updatedTable = tableData;
    selectedCells.forEach(({ row, column }) => {
      updatedTable = this.operations.clearCell(updatedTable, row, column);
    });

    this.tableState.updateTableData(updatedTable);
    this.tableChanged.emit(updatedTable);
  }

  // Helper methods
  private getCellFromEvent(event: MouseEvent): { row: number; column: number } | null {
    const target = event.target as HTMLElement;
    const cell = target.closest('.table-cell') as HTMLElement;
    if (!cell) return null;

    const row = parseInt(cell.getAttribute('data-row') || '0');
    const column = parseInt(cell.getAttribute('data-col') || '0');
    return { row, column };
  }

  private calculateSelectionRect(start: CellPosition, end: CellPosition): SelectionRect {
    // This would calculate the actual pixel coordinates for the selection rectangle
    // For now, return a basic implementation
    return {
      top: Math.min(start.row, end.row) * 40,
      left: Math.min(start.column, end.column) * 120,
      width: (Math.abs(end.column - start.column) + 1) * 120,
      height: (Math.abs(end.row - start.row) + 1) * 40
    };
  }

  private setupColumnResizing(): void {
    // Implementation for column resizing functionality
  }

  // State check methods
  isCellSelected(row: number, column: number): boolean {
    return this.selectionService.isCellSelected(row, column);
  }

  isCellActive(row: number, column: number): boolean {
    return this.selectionService.isCellActive(row, column);
  }

  isCellEditing(row: number, column: number): boolean {
    const editingCell = this.editingCell();
    return editingCell?.row === row && editingCell?.column === column;
  }

  isRowSelected(row: number): boolean {
    // Implementation for row selection check
    return false;
  }

  isColumnSelected(column: number): boolean {
    // Implementation for column selection check
    return false;
  }

  isTableSelected(): boolean {
    // Implementation for table selection check
    return false;
  }

  canMergeCells(): boolean {
    return this.selectionService.selectedCellsCount() > 1;
  }

  canSplitCells(): boolean {
    const activeCell = this.selectionService.activeCell();
    if (!activeCell) return false;

    const cell = this.tableState.getCellAt(activeCell.row, activeCell.column);
    return !!(cell?.rowSpan && cell.rowSpan > 1) || !!(cell?.colSpan && cell.colSpan > 1);
  }

  canPaste(): boolean {
    return !!this._copiedData();
  }

  // Display methods
  getColumnWidth(index: number): string {
    // Return column width, could be stored in table config
    return '120px';
  }

  getColumnLabel(index: number): string {
    // Convert index to Excel-like column label (A, B, C, etc.)
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  }

  getCellDisplayContent(cell: TableCell): string {
    return cell.content || '';
  }

  startColumnResize(column: number, event: MouseEvent): void {
    event.stopPropagation();
    // Implementation for column resizing
  }
}