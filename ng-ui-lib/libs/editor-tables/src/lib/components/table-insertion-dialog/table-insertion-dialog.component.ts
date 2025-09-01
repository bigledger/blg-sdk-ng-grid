import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  output,
  input,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableConfig, TableBorderStyle, TableAlignment } from '../../interfaces/table-config.interface';
import { TableStateService } from '../../services/table-state.service';

/**
 * Dialog component for inserting tables with visual picker and advanced options
 */
@Component({
  selector: 'ng-ui-table-insertion-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-insertion-dialog" [class.open]="isOpen()">
      <div class="dialog-overlay" (click)="close()"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>Insert Table</h3>
          <button class="close-button" (click)="close()" aria-label="Close dialog">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.147a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
            </svg>
          </button>
        </div>

        <div class="dialog-body">
          <!-- Visual Table Picker -->
          <div class="table-picker-section">
            <h4>Select table size</h4>
            <div class="visual-table-picker">
              <div class="picker-grid" 
                   (mouseleave)="resetHover()">
                @for (row of pickerRows(); track row) {
                  <div class="picker-row">
                    @for (col of pickerCols(); track col) {
                      <div 
                        class="picker-cell"
                        [class.highlighted]="isCellHighlighted(row, col)"
                        [class.selected]="isCellSelected(row, col)"
                        (mouseenter)="onCellHover(row, col)"
                        (click)="onCellClick(row, col)">
                      </div>
                    }
                  </div>
                }
              </div>
              <div class="picker-info">
                {{ selectedRows() }} × {{ selectedCols() }} table
              </div>
            </div>
          </div>

          <!-- Custom Size Input -->
          <div class="custom-size-section">
            <h4>Or specify custom size</h4>
            <div class="custom-inputs">
              <div class="input-group">
                <label for="rows-input">Rows:</label>
                <input 
                  id="rows-input"
                  type="number" 
                  min="1" 
                  max="50" 
                  [(ngModel)]="customRows"
                  (ngModelChange)="updateCustomSize()"
                  class="size-input">
              </div>
              <div class="input-group">
                <label for="cols-input">Columns:</label>
                <input 
                  id="cols-input"
                  type="number" 
                  min="1" 
                  max="20" 
                  [(ngModel)]="customCols"
                  (ngModelChange)="updateCustomSize()"
                  class="size-input">
              </div>
            </div>
          </div>

          <!-- Table Options -->
          <div class="table-options-section">
            <h4>Table Options</h4>
            <div class="options-grid">
              <div class="option-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="hasHeader"
                    (ngModelChange)="updateTableConfig()">
                  Include header row
                </label>
              </div>
              
              <div class="option-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="hasRowNumbers"
                    (ngModelChange)="updateTableConfig()">
                  Show row numbers
                </label>
              </div>

              <div class="option-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="responsive"
                    (ngModelChange)="updateTableConfig()">
                  Responsive table
                </label>
              </div>
            </div>
          </div>

          <!-- Style Options -->
          <div class="style-options-section">
            <h4>Table Style</h4>
            <div class="style-grid">
              <div class="style-group">
                <label for="border-style">Border Style:</label>
                <select 
                  id="border-style"
                  [(ngModel)]="borderStyle"
                  (ngModelChange)="updateTableConfig()"
                  class="style-select">
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div class="style-group">
                <label for="alignment">Alignment:</label>
                <select 
                  id="alignment"
                  [(ngModel)]="alignment"
                  (ngModelChange)="updateTableConfig()"
                  class="style-select">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="preview-section">
            <h4>Preview</h4>
            <div class="table-preview">
              <table class="preview-table" [style.border-style]="borderStyle" [style.text-align]="alignment">
                @for (row of previewRows(); track $index) {
                  <tr>
                    @if (hasRowNumbers) {
                      <td class="row-number">{{ $index + 1 }}</td>
                    }
                    @for (col of previewCols(); track $index) {
                      <td [class.header-cell]="$index === 0 && hasHeader">
                        @if ($index === 0 && hasHeader) {
                          Header {{ col + 1 }}
                        } @else {
                          Cell
                        }
                      </td>
                    }
                  </tr>
                }
              </table>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="cancel-button" (click)="close()">
            Cancel
          </button>
          <button 
            class="create-button" 
            (click)="createTable()"
            [disabled]="!canCreateTable()">
            Create Table
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./table-insertion-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableInsertionDialogComponent implements OnInit {
  private readonly tableState = inject(TableStateService);

  // Inputs and Outputs
  readonly isOpen = input<boolean>(false);
  readonly tableCreated = output<TableConfig>();
  readonly dialogClosed = output<void>();

  // Visual picker state
  private readonly _hoveredRow = signal<number>(0);
  private readonly _hoveredCol = signal<number>(0);
  readonly selectedRows = signal<number>(3);
  readonly selectedCols = signal<number>(3);

  // Custom size inputs
  customRows = 3;
  customCols = 3;

  // Table options
  hasHeader = true;
  hasRowNumbers = false;
  responsive = true;
  borderStyle: TableBorderStyle = TableBorderStyle.SOLID;
  alignment: TableAlignment = TableAlignment.LEFT;

  // Computed values for picker grid
  readonly pickerRows = computed(() => Array.from({ length: 8 }, (_, i) => i + 1));
  readonly pickerCols = computed(() => Array.from({ length: 8 }, (_, i) => i + 1));
  
  readonly previewRows = computed(() => 
    Array.from({ length: Math.min(this.selectedRows(), 3) }, (_, i) => i + 1)
  );
  readonly previewCols = computed(() => 
    Array.from({ length: Math.min(this.selectedCols(), 4) }, (_, i) => i + 1)
  );

  readonly canCreateTable = computed(() => 
    this.selectedRows() > 0 && this.selectedCols() > 0
  );

  ngOnInit(): void {
    this.updateCustomSize();
  }

  /**
   * Handle cell hover in visual picker
   */
  onCellHover(row: number, col: number): void {
    this._hoveredRow.set(row);
    this._hoveredCol.set(col);
    this.selectedRows.set(row);
    this.selectedCols.set(col);
    this.updateCustomInputs();
  }

  /**
   * Handle cell click in visual picker
   */
  onCellClick(row: number, col: number): void {
    this.selectedRows.set(row);
    this.selectedCols.set(col);
    this.updateCustomInputs();
  }

  /**
   * Reset hover state
   */
  resetHover(): void {
    // Keep the selected values, don't reset on mouse leave
  }

  /**
   * Check if cell is highlighted (hovered)
   */
  isCellHighlighted(row: number, col: number): boolean {
    return row <= this._hoveredRow() && col <= this._hoveredCol();
  }

  /**
   * Check if cell is selected
   */
  isCellSelected(row: number, col: number): boolean {
    return row <= this.selectedRows() && col <= this.selectedCols();
  }

  /**
   * Update custom size from inputs
   */
  updateCustomSize(): void {
    this.selectedRows.set(Math.max(1, Math.min(50, this.customRows || 1)));
    this.selectedCols.set(Math.max(1, Math.min(20, this.customCols || 1)));
  }

  /**
   * Update custom inputs from selected values
   */
  private updateCustomInputs(): void {
    this.customRows = this.selectedRows();
    this.customCols = this.selectedCols();
  }

  /**
   * Update table configuration (placeholder for advanced options)
   */
  updateTableConfig(): void {
    // This could trigger preview updates or validation
  }

  /**
   * Create table with current configuration
   */
  createTable(): void {
    const config: TableConfig = {
      rows: this.selectedRows(),
      columns: this.selectedCols(),
      hasHeader: this.hasHeader,
      hasRowNumbers: this.hasRowNumbers,
      borderStyle: this.borderStyle,
      alignment: this.alignment,
      responsive: this.responsive,
      defaultCellWidth: 'auto',
      defaultCellHeight: 'auto'
    };

    this.tableState.createTable(config);
    this.tableCreated.emit(config);
    this.close();
  }

  /**
   * Close dialog
   */
  close(): void {
    this.dialogClosed.emit();
  }
}