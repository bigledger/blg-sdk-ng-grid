import { Component, Input, Output, EventEmitter, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { 
  ChartExportConfig, 
  ChartExportFormat, 
  ChartExportScope, 
  ChartExportResult,
  ChartExportPresets,
  ImageExportOptions,
  VectorExportOptions,
  DataExportOptions,
  PresentationExportOptions,
  BatchExportOptions,
  WatermarkConfig
} from '../interfaces/chart-export';
import { ChartExportService } from '../services/chart-export.service';

/**
 * Chart Export Component
 * Provides comprehensive export capabilities with UI controls
 */
@Component({
  selector: 'ng-ui-chart-export',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="chart-export-container" [class.expanded]="expanded()">
      <!-- Export Button/Toggle -->
      <div class="export-trigger">
        <button 
          class="export-btn"
          [class.active]="expanded()"
          (click)="toggleExportPanel()"
          [disabled]="!chartElement()"
          title="Export Chart">
          <svg class="export-icon" viewBox="0 0 24 24">
            <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
          </svg>
          <span class="export-label">Export</span>
        </button>
        
        <!-- Quick Export Buttons -->
        <div class="quick-export-buttons" *ngIf="showQuickButtons">
          <button 
            class="quick-btn"
            *ngFor="let format of quickFormats"
            (click)="quickExport(format)"
            [title]="'Export as ' + format.toUpperCase()">
            {{ format.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Export Configuration Panel -->
      <div class="export-panel" *ngIf="expanded()">
        <form [formGroup]="exportForm" (ngSubmit)="onExport()">
          
          <!-- Format Selection -->
          <div class="form-section">
            <h3>Export Format</h3>
            <div class="format-grid">
              <label 
                *ngFor="let format of availableFormats()" 
                class="format-option"
                [class.selected]="exportForm.get('format')?.value === format">
                <input 
                  type="radio" 
                  [value]="format" 
                  formControlName="format"
                  (change)="onFormatChange(format)">
                <div class="format-icon">
                  <svg [ngSwitch]="format" viewBox="0 0 24 24">
                    <path *ngSwitchCase="'png'" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    <path *ngSwitchCase="'pdf'" d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"/>
                    <path *ngSwitchDefault d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span>{{ format.toUpperCase() }}</span>
              </label>
            </div>
          </div>

          <!-- Scope Selection -->
          <div class="form-section">
            <h3>Export Scope</h3>
            <select formControlName="scope" class="form-select">
              <option value="visible">Visible Area</option>
              <option value="full">Full Chart</option>
              <option value="selection">Selection Only</option>
              <option value="data-only">Data Only</option>
              <option value="chart-only">Chart Only</option>
            </select>
          </div>

          <!-- File Settings -->
          <div class="form-section">
            <h3>File Settings</h3>
            <div class="form-row">
              <label>
                Filename:
                <input 
                  type="text" 
                  formControlName="filename" 
                  class="form-input"
                  placeholder="chart-export">
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="includeTimestamp">
                Include timestamp
              </label>
            </div>
          </div>

          <!-- Format-Specific Options -->
          <div class="form-section" [ngSwitch]="selectedFormatCategory()">
            
            <!-- Image Format Options -->
            <div *ngSwitchCase="'image'">
              <h3>Image Options</h3>
              <div class="form-grid">
                <label>
                  Quality:
                  <select formControlName="imageQuality" class="form-select">
                    <option value="0.5">Low (50%)</option>
                    <option value="0.8">Medium (80%)</option>
                    <option value="0.95">High (95%)</option>
                    <option value="1.0">Ultra (100%)</option>
                  </select>
                </label>
                <label>
                  DPI:
                  <select formControlName="imageDPI" class="form-select">
                    <option value="72">72 DPI (Web)</option>
                    <option value="150">150 DPI (Print)</option>
                    <option value="300">300 DPI (High Print)</option>
                    <option value="600">600 DPI (Ultra High)</option>
                  </select>
                </label>
                <label>
                  Scale:
                  <select formControlName="imageScale" class="form-select">
                    <option value="1">1x</option>
                    <option value="2">2x (Retina)</option>
                    <option value="3">3x</option>
                  </select>
                </label>
                <label>
                  Background:
                  <select formControlName="imageBackground" class="form-select">
                    <option value="white">White</option>
                    <option value="transparent">Transparent</option>
                    <option value="custom">Custom Color</option>
                  </select>
                </label>
              </div>
              
              <div class="form-row" *ngIf="exportForm.get('imageBackground')?.value === 'custom'">
                <label>
                  Background Color:
                  <input 
                    type="color" 
                    formControlName="customBackgroundColor"
                    class="form-color">
                </label>
              </div>
            </div>

            <!-- Vector Format Options -->
            <div *ngSwitchCase="'vector'">
              <h3>Vector Options</h3>
              <div class="form-grid">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="embedFonts">
                  Embed fonts
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="embedStyles">
                  Embed styles
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="includeInteractive">
                  Include interactive elements
                </label>
                <label class="checkbox-label" *ngIf="exportForm.get('format')?.value === 'pdf'">
                  <input 
                    type="checkbox" 
                    formControlName="multiPage">
                  Multi-page layout
                </label>
              </div>
            </div>

            <!-- Data Format Options -->
            <div *ngSwitchCase="'data'">
              <h3>Data Options</h3>
              <div class="form-grid">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="includeRawData">
                  Include raw data
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="includeAggregatedData">
                  Include aggregated data
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="includeStatistics">
                  Include statistics
                </label>
                <label>
                  Data format:
                  <select formControlName="dataFormat" class="form-select">
                    <option value="flat">Flat</option>
                    <option value="nested">Nested</option>
                    <option value="pivot">Pivot</option>
                    <option value="time-series">Time Series</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <!-- Watermark Settings -->
          <div class="form-section">
            <h3>Watermark</h3>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="enableWatermark"
                (change)="onWatermarkToggle($event)">
              Enable watermark
            </label>
            
            <div class="watermark-options" *ngIf="exportForm.get('enableWatermark')?.value">
              <div class="form-grid">
                <label>
                  Text:
                  <input 
                    type="text" 
                    formControlName="watermarkText"
                    class="form-input"
                    placeholder="© Company Name">
                </label>
                <label>
                  Position:
                  <select formControlName="watermarkPosition" class="form-select">
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Center</option>
                  </select>
                </label>
                <label>
                  Opacity:
                  <input 
                    type="range" 
                    formControlName="watermarkOpacity"
                    min="0.1" 
                    max="1" 
                    step="0.1"
                    class="form-range">
                  <span>{{ exportForm.get('watermarkOpacity')?.value | number:'1.1-1' }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Preset Selection -->
          <div class="form-section">
            <h3>Quick Presets</h3>
            <div class="preset-buttons">
              <button 
                type="button"
                *ngFor="let preset of presets | keyvalue"
                class="preset-btn"
                (click)="applyPreset(preset.key)"
                [title]="getPresetDescription(preset.key)">
                {{ getPresetLabel(preset.key) }}
              </button>
            </div>
          </div>

          <!-- Export Actions -->
          <div class="form-actions">
            <button 
              type="button" 
              class="btn-secondary"
              (click)="getPreview()"
              [disabled]="exporting() || !exportForm.valid">
              Preview
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="exporting() || !exportForm.valid">
              <span *ngIf="!exporting()">Export</span>
              <span *ngIf="exporting()">
                <div class="spinner"></div>
                Exporting... {{ exportProgress()?.percentage | number:'1.0-0' }}%
              </span>
            </button>
          </div>
        </form>

        <!-- Export Progress -->
        <div class="export-progress" *ngIf="exporting()">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              [style.width.%]="exportProgress()?.percentage || 0">
            </div>
          </div>
          <div class="progress-text">
            {{ exportProgress()?.stepDescription || 'Processing...' }}
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div class="preview-modal" *ngIf="showPreview()" (click)="closePreview()">
        <div class="preview-content" (click)="$event.stopPropagation()">
          <div class="preview-header">
            <h3>Export Preview</h3>
            <button class="close-btn" (click)="closePreview()">×</button>
          </div>
          <div class="preview-body">
            <div class="preview-image" [innerHTML]="previewContent()"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './chart-export.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartExportComponent {
  private fb = inject(FormBuilder);
  private exportService = inject(ChartExportService);

  /** Chart element to export */
  @Input() chartElement = signal<HTMLElement | null>(null);
  
  /** Chart data for export */
  @Input() chartData = signal<any>(null);
  
  /** Chart configuration */
  @Input() chartConfig = signal<any>(null);
  
  /** Show quick export buttons */
  @Input() showQuickButtons = signal(true);
  
  /** Available export formats */
  @Input() availableFormats = signal<ChartExportFormat[]>([
    'png', 'jpeg', 'svg', 'pdf', 'excel', 'powerpoint', 'csv', 'json'
  ]);
  
  /** Quick export formats */
  @Input() quickFormats = signal<ChartExportFormat[]>(['png', 'pdf', 'excel']);

  /** Export events */
  @Output() exportStart = new EventEmitter<ChartExportConfig>();
  @Output() exportProgress = new EventEmitter<any>();
  @Output() exportComplete = new EventEmitter<ChartExportResult>();
  @Output() exportError = new EventEmitter<string>();

  /** Component state */
  expanded = signal(false);
  exporting = signal(false);
  showPreview = signal(false);
  previewContent = signal('');
  exportProgress = signal<any>(null);

  /** Export form */
  exportForm: FormGroup;

  /** Export presets */
  presets: ChartExportPresets;

  /** Selected format category */
  selectedFormatCategory = computed(() => {
    const format = this.exportForm.get('format')?.value;
    if (['png', 'jpeg'].includes(format)) return 'image';
    if (['svg', 'pdf'].includes(format)) return 'vector';
    if (['csv', 'json', 'excel'].includes(format)) return 'data';
    if (['powerpoint'].includes(format)) return 'presentation';
    return 'other';
  });

  constructor() {
    this.exportForm = this.createExportForm();
    this.presets = this.createPresets();
  }

  private createExportForm(): FormGroup {
    return this.fb.group({
      // Basic settings
      format: ['png'],
      scope: ['visible'],
      filename: ['chart-export'],
      includeTimestamp: [true],
      includeMetadata: [true],
      
      // Image options
      imageQuality: [0.95],
      imageDPI: [150],
      imageScale: [1],
      imageBackground: ['white'],
      customBackgroundColor: ['#ffffff'],
      
      // Vector options
      embedFonts: [true],
      embedStyles: [true],
      includeInteractive: [false],
      multiPage: [false],
      
      // Data options
      includeRawData: [true],
      includeAggregatedData: [false],
      includeStatistics: [false],
      dataFormat: ['flat'],
      
      // Watermark options
      enableWatermark: [false],
      watermarkText: [''],
      watermarkPosition: ['bottom-right'],
      watermarkOpacity: [0.3]
    });
  }

  private createPresets(): ChartExportPresets {
    return {
      presentation: {
        format: 'png',
        scope: 'visible',
        filename: 'presentation-chart',
        includeMetadata: true,
        includeDataSource: true,
        timestamp: true,
        formatOptions: {
          quality: 1.0,
          dpi: 300,
          scaleFactor: 2,
          backgroundColor: 'white',
          includeAnimationFrames: false
        } as ImageExportOptions
      },
      web: {
        format: 'png',
        scope: 'visible',
        filename: 'web-chart',
        includeMetadata: false,
        includeDataSource: false,
        timestamp: false,
        formatOptions: {
          quality: 0.8,
          dpi: 72,
          scaleFactor: 1,
          backgroundColor: 'transparent',
          includeAnimationFrames: false
        } as ImageExportOptions
      },
      print: {
        format: 'pdf',
        scope: 'full',
        filename: 'print-chart',
        includeMetadata: true,
        includeDataSource: true,
        timestamp: true,
        formatOptions: {
          embedFonts: true,
          embedStyles: true,
          pdfOptions: {
            pageSize: 'A4',
            orientation: 'landscape',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            includeInteractiveElements: false,
            includeBookmarks: true,
            multiPage: false,
            chartsPerPage: 1
          }
        } as VectorExportOptions
      },
      dataAnalysis: {
        format: 'excel',
        scope: 'full',
        filename: 'data-analysis',
        includeMetadata: true,
        includeDataSource: true,
        timestamp: true,
        formatOptions: {
          includeRawData: true,
          includeAggregatedData: true,
          includeStatistics: true,
          dataFormat: 'nested',
          excelOptions: {
            worksheetName: 'Chart Data',
            includeChartImage: true,
            createNativeChart: true,
            multipleWorksheets: true,
            worksheetPerSeries: false,
            includePivotTables: true,
            autoSizeColumns: true,
            applyFormatting: true,
            headerStyle: {
              font: { bold: true, italic: false, color: '#000000', size: 12, family: 'Arial' },
              fill: { backgroundColor: '#f0f0f0', pattern: 'solid' },
              border: { top: true, right: true, bottom: true, left: true, color: '#000000', style: 'thin' },
              alignment: { horizontal: 'center', vertical: 'middle', wrapText: false },
              numberFormat: 'General'
            },
            dataStyle: {
              font: { bold: false, italic: false, color: '#000000', size: 11, family: 'Arial' },
              fill: { backgroundColor: '#ffffff', pattern: 'solid' },
              border: { top: false, right: true, bottom: false, left: false, color: '#cccccc', style: 'thin' },
              alignment: { horizontal: 'left', vertical: 'middle', wrapText: false },
              numberFormat: 'General'
            }
          }
        } as DataExportOptions
      },
      socialMedia: {
        format: 'png',
        scope: 'visible',
        filename: 'social-chart',
        includeMetadata: false,
        includeDataSource: false,
        timestamp: false,
        formatOptions: {
          quality: 0.9,
          dpi: 72,
          scaleFactor: 2,
          backgroundColor: 'white',
          includeAnimationFrames: false,
          dimensions: {
            width: 1200,
            height: 630,
            maintainAspectRatio: false
          }
        } as ImageExportOptions
      },
      email: {
        format: 'png',
        scope: 'visible',
        filename: 'email-chart',
        includeMetadata: false,
        includeDataSource: false,
        timestamp: false,
        formatOptions: {
          quality: 0.8,
          dpi: 96,
          scaleFactor: 1,
          backgroundColor: 'white',
          includeAnimationFrames: false,
          dimensions: {
            width: 600,
            height: 400,
            maintainAspectRatio: true
          }
        } as ImageExportOptions
      }
    };
  }

  toggleExportPanel(): void {
    this.expanded.update(current => !current);
  }

  onFormatChange(format: ChartExportFormat): void {
    // Update format-specific form controls
    const formatOptions = this.getDefaultOptionsForFormat(format);
    this.updateFormForFormat(format, formatOptions);
  }

  onWatermarkToggle(event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    if (enabled && !this.exportForm.get('watermarkText')?.value) {
      this.exportForm.patchValue({
        watermarkText: '© ' + new Date().getFullYear()
      });
    }
  }

  async quickExport(format: ChartExportFormat): Promise<void> {
    const config = this.createQuickExportConfig(format);
    await this.performExport(config);
  }

  async onExport(): Promise<void> {
    if (this.exportForm.valid) {
      const config = this.buildExportConfig();
      await this.performExport(config);
    }
  }

  async getPreview(): Promise<void> {
    const config = this.buildExportConfig();
    try {
      const previewUrl = await this.exportService.getPreview(config);
      this.previewContent.set(previewUrl);
      this.showPreview.set(true);
    } catch (error) {
      this.exportError.emit('Failed to generate preview: ' + error);
    }
  }

  closePreview(): void {
    this.showPreview.set(false);
    this.previewContent.set('');
  }

  applyPreset(presetKey: string): void {
    const preset = this.presets[presetKey as keyof ChartExportPresets];
    if (preset) {
      this.applyConfigToForm(preset);
    }
  }

  getPresetLabel(presetKey: string): string {
    const labels: { [key: string]: string } = {
      presentation: 'Presentation',
      web: 'Web',
      print: 'Print',
      dataAnalysis: 'Data Analysis',
      socialMedia: 'Social Media',
      email: 'Email'
    };
    return labels[presetKey] || presetKey;
  }

  getPresetDescription(presetKey: string): string {
    const descriptions: { [key: string]: string } = {
      presentation: 'High-quality PNG for presentations (300 DPI, 2x scale)',
      web: 'Web-optimized PNG (72 DPI, transparent background)',
      print: 'Print-ready PDF (A4 landscape with margins)',
      dataAnalysis: 'Excel with data, charts, and statistics',
      socialMedia: 'Social media optimized (1200x630)',
      email: 'Email-friendly size (600x400)'
    };
    return descriptions[presetKey] || '';
  }

  private async performExport(config: ChartExportConfig): Promise<void> {
    this.exporting.set(true);
    this.exportStart.emit(config);

    try {
      const result = await this.exportService.exportChart(config);
      this.exportComplete.emit(result);
      
      if (result.success && result.files.length > 0) {
        // Trigger download for the first file
        this.downloadFile(result.files[0]);
      }
    } catch (error) {
      this.exportError.emit(error instanceof Error ? error.message : String(error));
    } finally {
      this.exporting.set(false);
      this.exportProgress.set(null);
    }
  }

  private downloadFile(file: any): void {
    const url = file.data instanceof Blob 
      ? URL.createObjectURL(file.data)
      : file.data;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (file.data instanceof Blob) {
      URL.revokeObjectURL(url);
    }
  }

  private buildExportConfig(): ChartExportConfig {
    const formValue = this.exportForm.value;
    
    const config: ChartExportConfig = {
      format: formValue.format,
      scope: formValue.scope,
      filename: formValue.filename + (formValue.includeTimestamp ? `-${Date.now()}` : ''),
      includeMetadata: formValue.includeMetadata,
      includeDataSource: true,
      timestamp: formValue.includeTimestamp
    };

    // Add watermark if enabled
    if (formValue.enableWatermark && formValue.watermarkText) {
      config.watermark = {
        enabled: true,
        text: formValue.watermarkText,
        position: formValue.watermarkPosition,
        opacity: formValue.watermarkOpacity,
        fontSize: 12,
        color: '#666666'
      };
    }

    // Add format-specific options
    const formatCategory = this.selectedFormatCategory();
    if (formatCategory === 'image') {
      config.formatOptions = {
        quality: formValue.imageQuality,
        dpi: formValue.imageDPI,
        scaleFactor: formValue.imageScale,
        backgroundColor: formValue.imageBackground === 'custom' 
          ? formValue.customBackgroundColor 
          : formValue.imageBackground,
        includeAnimationFrames: false
      } as ImageExportOptions;
    } else if (formatCategory === 'vector') {
      config.formatOptions = {
        embedFonts: formValue.embedFonts,
        embedStyles: formValue.embedStyles,
        optimizationLevel: 'basic'
      } as VectorExportOptions;
    } else if (formatCategory === 'data') {
      config.formatOptions = {
        includeRawData: formValue.includeRawData,
        includeAggregatedData: formValue.includeAggregatedData,
        includeStatistics: formValue.includeStatistics,
        dataFormat: formValue.dataFormat
      } as DataExportOptions;
    }

    return config;
  }

  private createQuickExportConfig(format: ChartExportFormat): ChartExportConfig {
    return {
      format,
      scope: 'visible',
      filename: `chart-${format}-${Date.now()}`,
      includeMetadata: false,
      includeDataSource: false,
      timestamp: true,
      formatOptions: this.getDefaultOptionsForFormat(format)
    };
  }

  private getDefaultOptionsForFormat(format: ChartExportFormat): any {
    switch (format) {
      case 'png':
      case 'jpeg':
        return {
          quality: 0.95,
          dpi: 150,
          scaleFactor: 1,
          backgroundColor: format === 'png' ? 'transparent' : 'white',
          includeAnimationFrames: false
        } as ImageExportOptions;
      
      case 'svg':
      case 'pdf':
        return {
          embedFonts: true,
          embedStyles: true,
          optimizationLevel: 'basic'
        } as VectorExportOptions;
      
      case 'excel':
      case 'csv':
      case 'json':
        return {
          includeRawData: true,
          includeAggregatedData: false,
          includeStatistics: false,
          dataFormat: 'flat'
        } as DataExportOptions;
      
      default:
        return {};
    }
  }

  private updateFormForFormat(format: ChartExportFormat, options: any): void {
    // Update form controls based on format
    // This is called when format changes to set appropriate defaults
  }

  private applyConfigToForm(config: ChartExportConfig): void {
    this.exportForm.patchValue({
      format: config.format,
      scope: config.scope,
      filename: config.filename.replace(/-\d+$/, ''), // Remove timestamp
      includeTimestamp: config.timestamp,
      includeMetadata: config.includeMetadata
    });

    if (config.formatOptions) {
      const options = config.formatOptions;
      if ('quality' in options) {
        // Image options
        this.exportForm.patchValue({
          imageQuality: options.quality,
          imageDPI: (options as ImageExportOptions).dpi,
          imageScale: (options as ImageExportOptions).scaleFactor,
          imageBackground: (options as ImageExportOptions).backgroundColor
        });
      }
    }

    if (config.watermark) {
      this.exportForm.patchValue({
        enableWatermark: config.watermark.enabled,
        watermarkText: config.watermark.text,
        watermarkPosition: config.watermark.position,
        watermarkOpacity: config.watermark.opacity
      });
    }
  }
}