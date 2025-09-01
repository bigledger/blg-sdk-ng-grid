import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ExportOptions, 
  ExportFormat, 
  CsvExportOptions, 
  ExcelExportOptions,
  PdfExportOptions,
  GoogleSheetsOptions,
  ExportTemplate,
  AdvancedExportOptions
} from '@ng-ui/core';
import { ExportService } from '@ng-ui/core';

/**
 * Comprehensive Grid Export Component with advanced export capabilities
 */
@Component({
  selector: 'ng-ui-grid-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-grid-export">
      <!-- Quick Export Buttons -->
      <div class="export-quick-actions">
        <div class="export-buttons">
          <button 
            type="button" 
            class="export-btn export-btn-primary"
            (click)="quickExport('csv')"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Export CSV
          </button>
          
          <button 
            type="button" 
            class="export-btn export-btn-primary"
            (click)="quickExport('excel')"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Export Excel
          </button>

          <button 
            type="button" 
            class="export-btn export-btn-primary"
            (click)="quickExport('pdf')"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Export PDF
          </button>

          <button 
            type="button" 
            class="export-btn export-btn-secondary"
            (click)="quickExport('google-sheets')"
            [disabled]="isExporting()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19M19,5H5V19H19V5Z"/>
            </svg>
            Google Sheets
          </button>
        </div>
        
        <div class="export-controls">
          <button 
            type="button" 
            class="export-btn export-btn-outline"
            (click)="toggleAdvancedOptions()"
            [class.active]="showAdvancedOptions()">
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.65 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
            Advanced Options
          </button>

          <select 
            class="template-selector"
            [(ngModel)]="selectedTemplateId"
            (ngModelChange)="onTemplateChange($event)">
            <option value="">Select Template</option>
            @for (template of availableTemplates(); track template.id) {
              <option [value]="template.id">{{ template.name }}</option>
            }
          </select>
        </div>
      </div>
      
      <!-- Advanced Export Options Panel -->
      @if (showAdvancedOptions()) {
        <div class="export-advanced-panel">
          <div class="panel-tabs">
            <button 
              type="button"
              class="tab-button"
              [class.active]="activeTab() === 'general'"
              (click)="setActiveTab('general')">
              General
            </button>
            <button 
              type="button"
              class="tab-button"
              [class.active]="activeTab() === 'format'"
              (click)="setActiveTab('format')">
              Format Options
            </button>
            <button 
              type="button"
              class="tab-button"
              [class.active]="activeTab() === 'advanced'"
              (click)="setActiveTab('advanced')">
              Advanced
            </button>
            <button 
              type="button"
              class="tab-button"
              [class.active]="activeTab() === 'template'"
              (click)="setActiveTab('template')">
              Template
            </button>
          </div>

          <div class="panel-content">
            <!-- General Tab -->
            @if (activeTab() === 'general') {
              <div class="tab-content">
                <div class="form-section">
                  <h4>Export Settings</h4>
                  
                  <div class="form-group">
                    <label for="exportFormat">Export Format:</label>
                    <select id="exportFormat" [(ngModel)]="exportOptions.format" class="form-control">
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                      <option value="google-sheets">Google Sheets</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="filename">Filename:</label>
                    <input 
                      type="text" 
                      id="filename"
                      [(ngModel)]="exportOptions.filename"
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
                          [(ngModel)]="exportOptions.dataScope">
                        <span>Visible Data</span>
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          name="dataScope" 
                          value="filtered" 
                          [(ngModel)]="exportOptions.dataScope">
                        <span>Filtered Data</span>
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          name="dataScope" 
                          value="selected" 
                          [(ngModel)]="exportOptions.dataScope">
                        <span>Selected Rows</span>
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          name="dataScope" 
                          value="all" 
                          [(ngModel)]="exportOptions.dataScope">
                        <span>All Data</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="exportOptions.includeHeaders">
                      <span>Include Column Headers</span>
                    </label>
                  </div>
                </div>
              </div>
            }

            <!-- Format Options Tab -->
            @if (activeTab() === 'format') {
              <div class="tab-content">
                <!-- CSV Options -->
                @if (exportOptions.format === 'csv') {
                  <div class="form-section">
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
                }

                <!-- Excel Options -->
                @if (exportOptions.format === 'excel') {
                  <div class="form-section">
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

                    <div class="form-group">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          [(ngModel)]="multipleSheets">
                        <span>Create Multiple Sheets for Groups</span>
                      </label>
                    </div>
                  </div>
                }

                <!-- PDF Options -->
                @if (exportOptions.format === 'pdf') {
                  <div class="form-section">
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
                      <label for="orientation">Orientation:</label>
                      <select id="orientation" [(ngModel)]="pdfOptions.orientation" class="form-control">
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="pageSize">Page Size:</label>
                      <select id="pageSize" [(ngModel)]="pdfOptions.pageSize" class="form-control">
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="letter">Letter</option>
                        <option value="legal">Legal</option>
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

                    <div class="form-group">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          [(ngModel)]="pdfOptions.includeFiltersInfo">
                        <span>Include Applied Filters</span>
                      </label>
                    </div>
                  </div>
                }

                <!-- Google Sheets Options -->
                @if (exportOptions.format === 'google-sheets') {
                  <div class="form-section">
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
                      <label for="gsSheetName">Sheet Name:</label>
                      <input 
                        type="text" 
                        id="gsSheetName"
                        [(ngModel)]="googleSheetsOptions.sheetName"
                        class="form-control"
                        placeholder="Sheet1">
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

                    <div class="form-group">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          [(ngModel)]="googleSheetsOptions.addFilters">
                        <span>Add Data Filters</span>
                      </label>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Advanced Tab -->
            @if (activeTab() === 'advanced') {
              <div class="tab-content">
                <div class="form-section">
                  <h4>Advanced Options</h4>
                  
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="advancedOptions.preserveStyling">
                      <span>Preserve Cell Styles and Colors</span>
                    </label>
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="advancedOptions.includeHierarchy">
                      <span>Include Grouping/Hierarchy</span>
                    </label>
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="advancedOptions.includeMergedCells">
                      <span>Handle Merged Cells</span>
                    </label>
                  </div>

                  <div class="form-group">
                    <label for="batchSize">Batch Size (for large exports):</label>
                    <input 
                      type="number" 
                      id="batchSize"
                      [(ngModel)]="advancedOptions.batchSize"
                      class="form-control"
                      min="100"
                      max="10000"
                      step="100"
                      placeholder="1000">
                  </div>
                </div>
              </div>
            }

            <!-- Template Tab -->
            @if (activeTab() === 'template') {
              <div class="tab-content">
                <div class="form-section">
                  <h4>Export Templates</h4>
                  
                  <div class="template-list">
                    @for (template of availableTemplates(); track template.id) {
                      <div class="template-item" [class.selected]="selectedTemplateId === template.id">
                        <div class="template-header">
                          <label class="radio-label">
                            <input 
                              type="radio" 
                              name="template" 
                              [value]="template.id"
                              [(ngModel)]="selectedTemplateId">
                            <span class="template-name">{{ template.name }}</span>
                          </label>
                          <div class="template-formats">
                            @for (format of template.supportedFormats; track format) {
                              <span class="format-tag">{{ format.toUpperCase() }}</span>
                            }
                          </div>
                        </div>
                        <p class="template-description">{{ template.description }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="panel-actions">
            <button 
              type="button" 
              class="export-btn export-btn-secondary"
              (click)="resetToDefaults()">
              Reset to Defaults
            </button>

            <button 
              type="button" 
              class="export-btn export-btn-primary"
              (click)="exportWithOptions()"
              [disabled]="isExporting()">
              <span *ngIf="!isExporting()">Export</span>
              <span *ngIf="isExporting()">Exporting... {{ exportProgress() }}%</span>
            </button>
            
            <button 
              type="button" 
              class="export-btn export-btn-secondary"
              (click)="toggleAdvancedOptions()">
              Close
            </button>
          </div>
        </div>
      }
      
      <!-- Export Progress -->
      @if (isExporting()) {
        <div class="export-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              [style.width.%]="exportProgress()">
            </div>
          </div>
          <span>{{ exportStatus() }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './grid-export.component.scss'
})
export class GridExportComponent implements OnInit {
  private exportService = ExportService;

  @Input() enabled = true;
  @Input() availableFormats: ExportFormat[] = ['csv', 'excel', 'pdf', 'google-sheets'];
  @Input() defaultFilename = 'grid-export';
  @Input() hasSelectedRows = false;
  
  @Output() exportRequested = new EventEmitter<ExportOptions>();
  
  // UI State
  readonly showAdvancedOptions = signal(false);
  readonly isExporting = signal(false);
  readonly exportProgress = signal(0);
  readonly exportStatus = signal('');
  readonly activeTab = signal<'general' | 'format' | 'advanced' | 'template'>('general');
  
  // Templates
  readonly availableTemplates = signal<ExportTemplate[]>([]);
  selectedTemplateId = '';

  // Export Options
  exportOptions: ExportOptions = {
    format: 'csv',
    filename: '',
    includeHeaders: true,
    dataScope: 'visible'
  };

  // Format-specific options
  csvOptions: CsvExportOptions = {
    delimiter: ',',
    qualifier: '"',
    lineEnding: '\n',
    includeBom: true
  };

  excelOptions: ExcelExportOptions = {
    sheetName: 'Sheet1',
    autoSizeColumns: true,
    applyBasicStyling: true
  };

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

  advancedOptions: AdvancedExportOptions = {
    selectedRowsOnly: false,
    preserveStyling: false,
    includeMergedCells: false,
    includeHierarchy: false,
    batchSize: 1000
  };

  // Helper properties
  multipleSheets = false;

  constructor(private exportServiceInstance: ExportService) {}

  ngOnInit(): void {
    this.exportOptions.filename = this.defaultFilename;
    this.loadTemplates();
    this.setupProgressCallback();
  }

  /**
   * Load available templates
   */
  private loadTemplates(): void {
    const templates = this.exportServiceInstance.getTemplates();
    this.availableTemplates.set(templates);
  }

  /**
   * Setup progress callback for advanced options
   */
  private setupProgressCallback(): void {
    this.advancedOptions.onProgress = (progress: number) => {
      this.exportProgress.set(progress);
      
      if (progress < 25) {
        this.exportStatus.set('Preparing data...');
      } else if (progress < 50) {
        this.exportStatus.set('Processing export...');
      } else if (progress < 75) {
        this.exportStatus.set('Formatting data...');
      } else if (progress < 100) {
        this.exportStatus.set('Finalizing export...');
      } else {
        this.exportStatus.set('Export completed!');
      }
    };
  }

  /**
   * Quick export with default settings
   */
  async quickExport(format: ExportFormat): Promise<void> {
    const options: ExportOptions = {
      format,
      filename: this.exportOptions.filename || this.defaultFilename,
      includeHeaders: true,
      dataScope: 'visible',
      formatOptions: this.getFormatOptions(format)
    };
    
    await this.triggerExport(options);
  }

  /**
   * Export with all configured options
   */
  async exportWithOptions(): Promise<void> {
    const options: ExportOptions = {
      ...this.exportOptions,
      formatOptions: this.getFormatOptions(this.exportOptions.format),
      advanced: this.advancedOptions
    };

    if (this.selectedTemplateId) {
      const template = this.availableTemplates().find(t => t.id === this.selectedTemplateId);
      if (template) {
        options.template = template;
      }
    }
    
    await this.triggerExport(options);
  }

  /**
   * Get format-specific options
   */
  private getFormatOptions(format: ExportFormat): any {
    switch (format) {
      case 'csv':
        return this.csvOptions;
      case 'excel':
        const excelOpts = { ...this.excelOptions };
        if (this.multipleSheets) {
          excelOpts.multipleSheets = {
            enabled: true,
            sheetNameTemplate: '{groupValue}'
          };
        }
        return excelOpts;
      case 'pdf':
        return this.pdfOptions;
      case 'google-sheets':
        return this.googleSheetsOptions;
      default:
        return {};
    }
  }

  /**
   * Trigger export with options
   */
  private async triggerExport(options: ExportOptions): Promise<void> {
    if (!this.enabled) return;
    
    this.isExporting.set(true);
    this.exportProgress.set(0);
    
    try {
      this.exportRequested.emit(options);
      
      // Simulate minimum export time for UI feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Export failed:', error);
      this.exportStatus.set('Export failed');
    } finally {
      setTimeout(() => {
        this.isExporting.set(false);
        this.exportProgress.set(0);
        this.exportStatus.set('');
      }, 1000);
    }
  }

  /**
   * Toggle advanced options panel
   */
  toggleAdvancedOptions(): void {
    this.showAdvancedOptions.update(show => !show);
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: 'general' | 'format' | 'advanced' | 'template'): void {
    this.activeTab.set(tab);
  }

  /**
   * Handle template selection change
   */
  onTemplateChange(templateId: string): void {
    this.selectedTemplateId = templateId;
    
    if (templateId) {
      const template = this.availableTemplates().find(t => t.id === templateId);
      if (template) {
        this.applyTemplate(template);
      }
    }
  }

  /**
   * Apply template settings
   */
  private applyTemplate(template: ExportTemplate): void {
    // Apply template configuration to current settings
    if (template.config.header?.enabled) {
      this.pdfOptions.customHeader = template.config.header.content;
    }
    
    if (template.config.footer?.enabled) {
      this.pdfOptions.customFooter = template.config.footer.content;
    }

    // Apply column formatting if available
    // This would be used by the export service during processing
  }

  /**
   * Reset all options to defaults
   */
  resetToDefaults(): void {
    this.exportOptions = {
      format: 'csv',
      filename: this.defaultFilename,
      includeHeaders: true,
      dataScope: 'visible'
    };

    this.csvOptions = this.exportServiceInstance.getDefaultCsvOptions();
    this.excelOptions = this.exportServiceInstance.getDefaultExcelOptions();
    this.pdfOptions = this.exportServiceInstance.getDefaultPdfOptions();
    this.googleSheetsOptions = this.exportServiceInstance.getDefaultGoogleSheetsOptions();

    this.advancedOptions = {
      selectedRowsOnly: false,
      preserveStyling: false,
      includeMergedCells: false,
      includeHierarchy: false,
      batchSize: 1000
    };

    this.selectedTemplateId = '';
    this.multipleSheets = false;

    this.setupProgressCallback();
  }
}