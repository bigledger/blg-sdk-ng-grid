import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ExportOptions, 
  ExportFormat, 
  CsvExportOptions, 
  ExcelExportOptions,
  PdfExportOptions,
  GoogleSheetsOptions,
  AdvancedExportOptions
} from '@ng-ui/core';

/**
 * Export toolbar component with format selection and options
 */
@Component({
  selector: 'ng-ui-export-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-export-toolbar">
      <div class="export-controls">
        <div class="export-buttons">
          <button 
            type="button" 
            class="export-btn export-btn-primary"
            (click)="exportToCsv()"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Export CSV
          </button>
          
          <button 
            type="button" 
            class="export-btn export-btn-primary"
            (click)="exportToExcel()"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Export Excel
          </button>
          
          <button 
            type="button" 
            class="export-btn export-btn-primary"
            (click)="exportToPdf()"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Export PDF
          </button>

          <button 
            type="button" 
            class="export-btn export-btn-secondary"
            (click)="exportToGoogleSheets()"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19M19,5H5V19H19V5Z"/>
            </svg>
            Google Sheets
          </button>
        </div>
        
        <button 
          type="button" 
          class="export-btn export-btn-secondary"
          (click)="toggleOptionsPanel()"
          [class.active]="showOptions()">
          <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.65 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
          </svg>
          Options
        </button>
      </div>
      
      <!-- Export Options Panel -->
      @if (showOptions()) {
        <div class="export-options-panel">
          <div class="options-section">
            <h4>Export Settings</h4>
            
            <div class="form-group">
              <label for="filename">Filename:</label>
              <input 
                type="text" 
                id="filename"
                [(ngModel)]="filename"
                class="form-control"
                placeholder="Enter filename">
            </div>
            
            <div class="form-group">
              <label>Data Scope:</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="dataScope" 
                    value="visible" 
                    [(ngModel)]="dataScope">
                  <span>Visible Data</span>
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="dataScope" 
                    value="filtered" 
                    [(ngModel)]="dataScope">
                  <span>Filtered Data</span>
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="dataScope" 
                    value="selected" 
                    [(ngModel)]="dataScope">
                  <span>Selected Rows</span>
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="dataScope" 
                    value="all" 
                    [(ngModel)]="dataScope">
                  <span>All Data</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="includeHeaders">
                <span>Include Column Headers</span>
              </label>
            </div>
          </div>
          
          <!-- CSV Options -->
          <div class="options-section">
            <h4>CSV Options</h4>
            
            <div class="form-group">
              <label for="csvDelimiter">Delimiter:</label>
              <select id="csvDelimiter" [(ngModel)]="csvOptions.delimiter" class="form-control">
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="csvOptions.includeBom">
                <span>Include BOM for UTF-8</span>
              </label>
            </div>
          </div>
          
          <!-- Excel Options -->
          <div class="options-section">
            <h4>Excel Options</h4>
            
            <div class="form-group">
              <label for="sheetName">Sheet Name:</label>
              <input 
                type="text" 
                id="sheetName"
                [(ngModel)]="excelOptions.sheetName"
                class="form-control"
                placeholder="Sheet1">
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="excelOptions.autoSizeColumns">
                <span>Auto-size Columns</span>
              </label>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="excelOptions.applyBasicStyling">
                <span>Apply Basic Styling</span>
              </label>
            </div>
          </div>
          
          <!-- PDF Options -->
          <div class="options-section">
            <h4>PDF Options</h4>
            
            <div class="form-group">
              <label for="pdfTitle">Document Title:</label>
              <input 
                type="text" 
                id="pdfTitle"
                [(ngModel)]="pdfOptions.title"
                class="form-control"
                placeholder="Data Export">
            </div>
            
            <div class="form-group">
              <label for="pdfOrientation">Orientation:</label>
              <select id="pdfOrientation" [(ngModel)]="pdfOptions.orientation" class="form-control">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="pdfOptions.includePageNumbers">
                <span>Include Page Numbers</span>
              </label>
            </div>
          </div>
          
          <!-- Google Sheets Options -->
          <div class="options-section">
            <h4>Google Sheets Options</h4>
            
            <div class="form-group">
              <label for="gsTitle">Spreadsheet Title:</label>
              <input 
                type="text" 
                id="gsTitle"
                [(ngModel)]="googleSheetsOptions.title"
                class="form-control"
                placeholder="Grid Export">
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="googleSheetsOptions.createNew">
                <span>Create New Spreadsheet</span>
              </label>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="googleSheetsOptions.freezeHeaders">
                <span>Freeze Header Row</span>
              </label>
            </div>
          </div>
          
          <div class="options-actions">
            <button 
              type="button" 
              class="export-btn export-btn-secondary"
              (click)="resetToDefaults()">
              Reset to Defaults
            </button>
            
            <button 
              type="button" 
              class="export-btn export-btn-secondary"
              (click)="toggleOptionsPanel()">
              Close
            </button>
          </div>
        </div>
      }
      
      @if (isExporting()) {
        <div class="export-progress">
          <div class="progress-spinner"></div>
          <span>Exporting...</span>
        </div>
      }
    </div>
  `,
  styleUrl: './export-toolbar.component.scss'
})
export class ExportToolbarComponent {
  @Input() enabled = true;
  @Input() availableFormats: ExportFormat[] = ['csv', 'excel', 'pdf', 'google-sheets'];
  @Input() defaultFilename = 'grid-export';
  
  @Output() exportRequested = new EventEmitter<ExportOptions>();
  
  readonly showOptions = signal(false);
  readonly isExporting = signal(false);
  
  // Export options
  filename = '';
  includeHeaders = true;
  dataScope: 'all' | 'visible' | 'filtered' | 'selected' = 'visible';
  
  // CSV options
  csvOptions: CsvExportOptions = {
    delimiter: ',',
    qualifier: '"',
    lineEnding: '\n',
    includeBom: true
  };
  
  // Excel options
  excelOptions: ExcelExportOptions = {
    sheetName: 'Sheet1',
    autoSizeColumns: true,
    applyBasicStyling: true
  };
  
  // PDF options
  pdfOptions: PdfExportOptions = {
    orientation: 'landscape',
    pageSize: 'A4',
    title: 'Data Export',
    author: '',
    includeMetadata: true,
    fontSize: 8,
    headerFontSize: 12,
    includePageNumbers: true,
    includeExportDate: true,
    includeFiltersInfo: true,
    tableStyle: {
      headerBackgroundColor: '#2c3e50',
      headerTextColor: '#ffffff',
      alternateRowColor: '#f8f9fa',
      borderColor: '#dee2e6',
      showGridLines: true
    },
    maxRowsPerPage: 0
  };
  
  // Google Sheets options
  googleSheetsOptions: GoogleSheetsOptions = {
    title: 'Grid Export',
    sheetName: 'Sheet1',
    shareSettings: {
      shareType: 'private',
      permissions: 'edit'
    },
    createNew: true,
    enableCollaboration: true,
    freezeHeaders: true,
    addFilters: true
  };
  
  // Advanced options
  advancedOptions: AdvancedExportOptions = {
    selectedRowsOnly: false,
    preserveStyling: false,
    includeMergedCells: false,
    includeHierarchy: false,
    batchSize: 1000
  };
  
  ngOnInit(): void {
    this.filename = this.defaultFilename;
  }
  
  /**
   * Export to CSV
   */
  exportToCsv(): void {
    if (!this.enabled) return;
    
    const options: ExportOptions = {
      format: 'csv',
      filename: this.filename || this.defaultFilename,
      includeHeaders: this.includeHeaders,
      dataScope: this.dataScope,
      formatOptions: this.csvOptions
    };
    
    this.triggerExport(options);
  }
  
  /**
   * Export to Excel
   */
  exportToExcel(): void {
    if (!this.enabled) return;
    
    const options: ExportOptions = {
      format: 'excel',
      filename: this.filename || this.defaultFilename,
      includeHeaders: this.includeHeaders,
      dataScope: this.dataScope,
      formatOptions: this.excelOptions,
      advanced: this.advancedOptions
    };
    
    this.triggerExport(options);
  }
  
  /**
   * Export to PDF
   */
  exportToPdf(): void {
    if (!this.enabled) return;
    
    const options: ExportOptions = {
      format: 'pdf',
      filename: this.filename || this.defaultFilename,
      includeHeaders: this.includeHeaders,
      dataScope: this.dataScope,
      formatOptions: this.pdfOptions,
      advanced: this.advancedOptions
    };
    
    this.triggerExport(options);
  }
  
  /**
   * Export to Google Sheets
   */
  exportToGoogleSheets(): void {
    if (!this.enabled) return;
    
    const options: ExportOptions = {
      format: 'google-sheets',
      filename: this.filename || this.defaultFilename,
      includeHeaders: this.includeHeaders,
      dataScope: this.dataScope,
      formatOptions: this.googleSheetsOptions,
      advanced: this.advancedOptions
    };
    
    this.triggerExport(options);
  }
  
  /**
   * Trigger export with options
   */
  private async triggerExport(options: ExportOptions): Promise<void> {
    this.isExporting.set(true);
    
    try {
      this.exportRequested.emit(options);
      
      // Simulate export delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } finally {
      this.isExporting.set(false);
    }
  }
  
  /**
   * Toggle options panel
   */
  toggleOptionsPanel(): void {
    this.showOptions.update(show => !show);
  }
  
  /**
   * Reset options to defaults
   */
  resetToDefaults(): void {
    this.filename = this.defaultFilename;
    this.includeHeaders = true;
    this.dataScope = 'visible';
    
    this.csvOptions = {
      delimiter: ',',
      qualifier: '"',
      lineEnding: '\n',
      includeBom: true
    };
    
    this.excelOptions = {
      sheetName: 'Sheet1',
      autoSizeColumns: true,
      applyBasicStyling: true
    };
    
    this.pdfOptions = {
      orientation: 'landscape',
      pageSize: 'A4',
      title: 'Data Export',
      author: '',
      includeMetadata: true,
      fontSize: 8,
      headerFontSize: 12,
      includePageNumbers: true,
      includeExportDate: true,
      includeFiltersInfo: true,
      tableStyle: {
        headerBackgroundColor: '#2c3e50',
        headerTextColor: '#ffffff',
        alternateRowColor: '#f8f9fa',
        borderColor: '#dee2e6',
        showGridLines: true
      },
      maxRowsPerPage: 0
    };
    
    this.googleSheetsOptions = {
      title: 'Grid Export',
      sheetName: 'Sheet1',
      shareSettings: {
        shareType: 'private',
        permissions: 'edit'
      },
      createNew: true,
      enableCollaboration: true,
      freezeHeaders: true,
      addFilters: true
    };
    
    this.advancedOptions = {
      selectedRowsOnly: false,
      preserveStyling: false,
      includeMergedCells: false,
      includeHierarchy: false,
      batchSize: 1000
    };
  }
}