import { 
  Component, 
  input, 
  output, 
  signal, 
  computed, 
  inject,
  ChangeDetectionStrategy,
  ViewEncapsulation 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  EditorExportService, 
  ExportFormat, 
  ExportConfig, 
  ExportResult,
  ExportProgress 
} from '../../services/editor-export.service';

/**
 * Export menu item interface
 */
interface ExportMenuItem {
  format: ExportFormat;
  label: string;
  icon: string;
  description: string;
  popular?: boolean;
}

/**
 * Editor Export Component
 * Provides export menu and configuration UI for the editor
 */
@Component({
  selector: 'ng-ui-editor-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-editor-export">
      <!-- Export Button -->
      <button 
        class="blg-export-button"
        [class.blg-export-button--active]="showMenu()"
        [disabled]="disabled() || isExporting()"
        (click)="toggleMenu()"
        [attr.aria-expanded]="showMenu()"
        aria-haspopup="true">
        <span class="blg-export-icon">
          @if (isExporting()) {
            <svg viewBox="0 0 24 24" class="blg-icon blg-icon--spinning">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-dashoffset="60"/>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" class="blg-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          }
        </span>
        <span class="blg-export-text">
          @if (isExporting()) {
            {{ exportProgress()?.message || 'Exporting...' }}
          } @else {
            Export
          }
        </span>
        <span class="blg-export-arrow" [class.blg-export-arrow--up]="showMenu()">
          <svg viewBox="0 0 24 24" class="blg-icon">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </span>
      </button>

      <!-- Export Progress -->
      @if (isExporting() && exportProgress()) {
        <div class="blg-export-progress">
          <div class="blg-progress-bar">
            <div 
              class="blg-progress-fill" 
              [style.width.%]="exportProgress()!.progress">
            </div>
          </div>
          <div class="blg-progress-text">
            {{ exportProgress()!.progress }}% - {{ exportProgress()!.message }}
          </div>
        </div>
      }

      <!-- Export Menu -->
      @if (showMenu()) {
        <div class="blg-export-menu" (click)="$event.stopPropagation()">
          <div class="blg-export-menu-header">
            <h3>Export Document</h3>
            <button 
              class="blg-close-button" 
              (click)="closeMenu()"
              aria-label="Close export menu">
              <svg viewBox="0 0 24 24" class="blg-icon">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Quick Export Options -->
          <div class="blg-export-section">
            <h4>Quick Export</h4>
            <div class="blg-export-grid">
              @for (item of quickExportItems(); track item.format) {
                <button 
                  class="blg-export-item"
                  (click)="quickExport(item.format)">
                  <span class="blg-export-item-icon">{{ item.icon }}</span>
                  <span class="blg-export-item-label">{{ item.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Advanced Export Options -->
          <div class="blg-export-section">
            <h4>Advanced Export</h4>
            <div class="blg-export-advanced">
              <div class="blg-form-group">
                <label for="export-format">Format:</label>
                <select 
                  id="export-format"
                  [(ngModel)]="selectedFormat"
                  class="blg-select">
                  @for (item of allExportItems(); track item.format) {
                    <option [value]="item.format">{{ item.label }}</option>
                  }
                </select>
              </div>

              <div class="blg-form-group">
                <label for="export-filename">Filename:</label>
                <input 
                  id="export-filename"
                  type="text"
                  [(ngModel)]="filename"
                  class="blg-input"
                  placeholder="Document name">
              </div>

              <!-- Format-specific options -->
              @if (selectedFormat() === ExportFormat.PDF) {
                <div class="blg-format-options">
                  <div class="blg-form-row">
                    <div class="blg-form-group">
                      <label for="page-size">Page Size:</label>
                      <select id="page-size" [(ngModel)]="pdfConfig().pageSize" class="blg-select">
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                        <option value="A3">A3</option>
                      </select>
                    </div>
                    <div class="blg-form-group">
                      <label for="orientation">Orientation:</label>
                      <select id="orientation" [(ngModel)]="pdfConfig().orientation" class="blg-select">
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="blg-form-group">
                    <label class="blg-checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="pdfConfig().headers.enabled"
                        class="blg-checkbox">
                      Include Headers
                    </label>
                  </div>
                  
                  @if (pdfConfig().headers.enabled) {
                    <div class="blg-form-group">
                      <input 
                        type="text"
                        [(ngModel)]="pdfConfig().headers.content"
                        placeholder="Header text"
                        class="blg-input">
                    </div>
                  }
                  
                  <div class="blg-form-group">
                    <label class="blg-checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="pdfConfig().footers.enabled"
                        class="blg-checkbox">
                      Include Footers & Page Numbers
                    </label>
                  </div>

                  @if (pdfConfig().footers.enabled) {
                    <div class="blg-form-group">
                      <input 
                        type="text"
                        [(ngModel)]="pdfConfig().footers.content"
                        placeholder="Footer text"
                        class="blg-input">
                    </div>
                  }
                </div>
              }

              @if (selectedFormat() === ExportFormat.DOCX) {
                <div class="blg-format-options">
                  <div class="blg-form-group">
                    <label class="blg-checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="docxConfig().preserveFormatting"
                        class="blg-checkbox">
                      Preserve All Formatting
                    </label>
                  </div>
                  
                  <div class="blg-form-group">
                    <label class="blg-checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="docxConfig().includeImages"
                        class="blg-checkbox">
                      Include Images
                    </label>
                  </div>
                  
                  <div class="blg-form-group">
                    <label class="blg-checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="docxConfig().includeComments"
                        class="blg-checkbox">
                      Include Comments
                    </label>
                  </div>
                </div>
              }

              @if (selectedFormat() === ExportFormat.HTML) {
                <div class="blg-format-options">
                  <div class="blg-form-group">
                    <label class="blg-checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="htmlConfig().preserveFormatting"
                        class="blg-checkbox">
                      Include CSS Styles
                    </label>
                  </div>
                  
                  <div class="blg-form-group">
                    <label class="blg-checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="htmlConfig().includeImages"
                        class="blg-checkbox">
                      Include Images
                    </label>
                  </div>
                </div>
              }

              <!-- Common Options -->
              <div class="blg-format-options blg-common-options">
                <div class="blg-form-group">
                  <label class="blg-checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="commonConfig().includeImages"
                      class="blg-checkbox">
                    Include Images
                  </label>
                </div>
                
                <div class="blg-form-group">
                  <label class="blg-checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="commonConfig().preserveFormatting"
                      class="blg-checkbox">
                    Preserve Formatting
                  </label>
                </div>
              </div>

              <div class="blg-export-actions">
                <button 
                  class="blg-button blg-button--secondary"
                  (click)="closeMenu()">
                  Cancel
                </button>
                <button 
                  class="blg-button blg-button--primary"
                  (click)="advancedExport()"
                  [disabled]="!filename().trim()">
                  Export {{ getFormatDisplayName(selectedFormat()) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Print Option -->
          <div class="blg-export-section blg-print-section">
            <button 
              class="blg-print-button"
              (click)="printDocument()">
              <svg viewBox="0 0 24 24" class="blg-icon">
                <polyline points="6,9 6,2 18,2 18,9"/>
                <path d="M6,18H4a2,2,0,0,1-2-2v-5a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Document
            </button>
          </div>
        </div>
      }

      <!-- Overlay -->
      @if (showMenu()) {
        <div class="blg-export-overlay" (click)="closeMenu()"></div>
      }
    </div>
  `,
  styleUrl: './editor-export.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-editor-export-container',
    '[class.blg-export-active]': 'showMenu()',
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class EditorExportComponent {
  // Inputs
  disabled = input(false);
  
  // Outputs
  exportStarted = output<ExportConfig>();
  exportCompleted = output<ExportResult>();
  exportFailed = output<string>();

  // Injected services
  private exportService = inject(EditorExportService);

  // Component state
  private _showMenu = signal(false);
  readonly showMenu = this._showMenu.asReadonly();
  
  // Export service state
  readonly isExporting = this.exportService.isExporting;
  readonly exportProgress = this.exportService.exportProgress;
  readonly lastExportResult = this.exportService.lastExportResult;

  // Form state
  selectedFormat = signal(ExportFormat.PDF);
  filename = signal(`Document ${new Date().toLocaleDateString()}`);

  // Configuration signals
  pdfConfig = signal({
    pageSize: 'A4' as const,
    orientation: 'portrait' as const,
    headers: { enabled: false, content: '' },
    footers: { enabled: true, content: '', pageNumbers: true }
  });

  docxConfig = signal({
    preserveFormatting: true,
    includeImages: true,
    includeComments: false
  });

  htmlConfig = signal({
    preserveFormatting: true,
    includeImages: true
  });

  commonConfig = signal({
    includeImages: true,
    preserveFormatting: true
  });

  // Export format enum for template
  readonly ExportFormat = ExportFormat;

  // Computed export items
  readonly quickExportItems = computed((): ExportMenuItem[] => [
    {
      format: ExportFormat.PDF,
      label: 'PDF',
      icon: '📄',
      description: 'Portable Document Format',
      popular: true
    },
    {
      format: ExportFormat.DOCX,
      label: 'Word',
      icon: '📝',
      description: 'Microsoft Word Document',
      popular: true
    },
    {
      format: ExportFormat.HTML,
      label: 'HTML',
      icon: '🌐',
      description: 'Web Page',
      popular: true
    },
    {
      format: ExportFormat.TXT,
      label: 'Text',
      icon: '📃',
      description: 'Plain Text File'
    }
  ]);

  readonly allExportItems = computed((): ExportMenuItem[] => [
    ...this.quickExportItems(),
    {
      format: ExportFormat.RTF,
      label: 'RTF',
      icon: '📄',
      description: 'Rich Text Format'
    },
    {
      format: ExportFormat.MARKDOWN,
      label: 'Markdown',
      icon: '📝',
      description: 'Markdown Format'
    },
    {
      format: ExportFormat.GOOGLE_DOCS,
      label: 'Google Docs',
      icon: '📊',
      description: 'Google Docs (requires authentication)'
    }
  ]);

  /**
   * Toggle export menu visibility
   */
  toggleMenu(): void {
    if (this.disabled() || this.isExporting()) {
      return;
    }
    this._showMenu.update(show => !show);
  }

  /**
   * Close export menu
   */
  closeMenu(): void {
    this._showMenu.set(false);
  }

  /**
   * Handle document click to close menu
   */
  onDocumentClick(event: Event): void {
    // Menu will close via overlay click or component logic
  }

  /**
   * Quick export with default settings
   */
  async quickExport(format: ExportFormat): Promise<void> {
    const config: ExportConfig = {
      format,
      filename: this.generateFilename(format),
      ...this.getDefaultConfigForFormat(format)
    };

    await this.performExport(config);
  }

  /**
   * Advanced export with user configuration
   */
  async advancedExport(): Promise<void> {
    const format = this.selectedFormat();
    const config: ExportConfig = {
      format,
      filename: this.filename(),
      ...this.getConfigForFormat(format)
    };

    await this.performExport(config);
  }

  /**
   * Print document
   */
  async printDocument(): Promise<void> {
    try {
      await this.exportService.printContent({
        includeStyles: true,
        pageSize: this.pdfConfig().pageSize,
        orientation: this.pdfConfig().orientation
      });
      this.closeMenu();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Print failed';
      this.exportFailed.emit(errorMessage);
    }
  }

  /**
   * Perform export operation
   */
  private async performExport(config: ExportConfig): Promise<void> {
    this.exportStarted.emit(config);
    this.closeMenu();

    try {
      const result = await this.exportService.exportContent(config);
      
      if (result.success) {
        this.exportCompleted.emit(result);
      } else {
        this.exportFailed.emit(result.error || 'Export failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      this.exportFailed.emit(errorMessage);
    }
  }

  /**
   * Get default configuration for format
   */
  private getDefaultConfigForFormat(format: ExportFormat): Partial<ExportConfig> {
    switch (format) {
      case ExportFormat.PDF:
        return {
          pageSize: 'A4',
          orientation: 'portrait',
          includeImages: true,
          preserveFormatting: true
        };
      case ExportFormat.DOCX:
        return {
          includeImages: true,
          preserveFormatting: true,
          includeComments: false
        };
      case ExportFormat.HTML:
        return {
          includeImages: true,
          preserveFormatting: true
        };
      default:
        return {
          includeImages: true,
          preserveFormatting: true
        };
    }
  }

  /**
   * Get user configuration for format
   */
  private getConfigForFormat(format: ExportFormat): Partial<ExportConfig> {
    const common = this.commonConfig();
    
    switch (format) {
      case ExportFormat.PDF:
        const pdf = this.pdfConfig();
        return {
          ...common,
          pageSize: pdf.pageSize,
          orientation: pdf.orientation,
          headers: pdf.headers.enabled ? { enabled: true, content: pdf.headers.content } : undefined,
          footers: pdf.footers.enabled ? { 
            enabled: true, 
            content: pdf.footers.content,
            pageNumbers: pdf.footers.pageNumbers 
          } : undefined
        };
      case ExportFormat.DOCX:
        const docx = this.docxConfig();
        return {
          ...common,
          preserveFormatting: docx.preserveFormatting,
          includeImages: docx.includeImages,
          includeComments: docx.includeComments
        };
      case ExportFormat.HTML:
        const html = this.htmlConfig();
        return {
          ...common,
          preserveFormatting: html.preserveFormatting,
          includeImages: html.includeImages
        };
      default:
        return common;
    }
  }

  /**
   * Generate filename for format
   */
  private generateFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const extensions: Record<ExportFormat, string> = {
      [ExportFormat.PDF]: '.pdf',
      [ExportFormat.DOCX]: '.docx',
      [ExportFormat.HTML]: '.html',
      [ExportFormat.TXT]: '.txt',
      [ExportFormat.RTF]: '.rtf',
      [ExportFormat.ODT]: '.odt',
      [ExportFormat.MARKDOWN]: '.md',
      [ExportFormat.GOOGLE_DOCS]: ''
    };
    
    return `Document-${timestamp}${extensions[format]}`;
  }

  /**
   * Get format display name
   */
  getFormatDisplayName(format: ExportFormat): string {
    return this.exportService.getFormatDisplayName(format);
  }

  /**
   * Cancel current export
   */
  cancelExport(): void {
    this.exportService.cancelExport();
  }
}