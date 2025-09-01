import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy, 
  signal,
  computed,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  FilterModel,
  ColumnFilterModel,
  Filter,
  FilterPreset,
  FilterConfig,
  FilterType,
  FILTER_CONFIG
} from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';
import { EnhancedFilterService } from '../../../../../../libs/core/src/lib/services/enhanced-filter.service';
import { EnhancedTextFilterComponent } from './enhanced-text-filter.component';
import { EnhancedNumberFilterComponent } from './enhanced-number-filter.component';
import { EnhancedDateFilterComponent } from './enhanced-date-filter.component';

/**
 * Enhanced Filter Manager Component
 * 
 * Main component that orchestrates the enhanced filtering system:
 * - Manages filter presets and quick filters
 * - Provides filter toolbar with advanced controls
 * - Handles undo/redo operations
 * - Manages filter state persistence
 * - Provides filter export/import functionality
 * - Shows filter performance metrics
 */
@Component({
  selector: 'blg-enhanced-filter-manager',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    EnhancedTextFilterComponent,
    EnhancedNumberFilterComponent,
    EnhancedDateFilterComponent
  ],
  template: `
    <div class="blg-enhanced-filter-manager">
      <!-- Filter Toolbar -->
      <div class="filter-toolbar" [class.collapsed]="!showToolbar()">
        <!-- Quick Filter -->
        @if (config.enableQuickFilter) {
          <div class="quick-filter-section">
            <div class="quick-filter-input-wrapper">
              <input 
                type="text"
                class="quick-filter-input"
                placeholder="Quick filter across all columns..."
                [value]="quickFilterValue()"
                (input)="onQuickFilterChange($event)"
                (keydown)="onQuickFilterKeyDown($event)"
                aria-label="Quick filter all columns"
                #quickFilterInput>
              
              @if (quickFilterValue()) {
                <button 
                  type="button"
                  class="clear-quick-filter"
                  (click)="clearQuickFilter()"
                  aria-label="Clear quick filter"
                  title="Clear quick filter">
                  ✕
                </button>
              }
            </div>
          </div>
        }

        <!-- Filter Actions -->
        <div class="filter-actions">
          <!-- Filter Presets -->
          @if (config.enableFilterPresets && presets().length > 0) {
            <div class="preset-section">
              <select 
                class="preset-selector"
                [value]="activePreset()"
                (change)="onPresetChange($event)"
                aria-label="Filter presets">
                <option value="">Select preset...</option>
                @for (preset of presets(); track preset.id) {
                  <option [value]="preset.id">{{ preset.name }}</option>
                }
              </select>
            </div>
          }

          <!-- Undo/Redo -->
          @if (config.enableUndoRedo) {
            <div class="undo-redo-section">
              <button 
                type="button"
                class="action-button undo-button"
                [disabled]="!canUndo()"
                (click)="undo()"
                aria-label="Undo last filter change"
                title="Undo (Ctrl+Z)">
                ↶
              </button>
              <button 
                type="button"
                class="action-button redo-button"
                [disabled]="!canRedo()"
                (click)="redo()"
                aria-label="Redo filter change"
                title="Redo (Ctrl+Y)">
                ↷
              </button>
            </div>
          }

          <!-- Advanced Actions -->
          <div class="advanced-actions">
            <button 
              type="button"
              class="action-button clear-all-button"
              [disabled]="!hasActiveFilters()"
              (click)="clearAllFilters()"
              aria-label="Clear all filters"
              title="Clear all filters">
              Clear All
            </button>

            @if (config.enableFilterPresets) {
              <button 
                type="button"
                class="action-button save-preset-button"
                [disabled]="!hasActiveFilters()"
                (click)="showSavePresetDialog()"
                aria-label="Save current filters as preset"
                title="Save preset">
                Save Preset
              </button>
            }

            @if (config.enableFilterExport) {
              <div class="export-import-section">
                <button 
                  type="button"
                  class="action-button export-button"
                  [disabled]="!hasActiveFilters()"
                  (click)="exportFilters()"
                  aria-label="Export filter configuration"
                  title="Export filters">
                  Export
                </button>
                <input 
                  type="file"
                  accept=".json"
                  (change)="onImportFileChange($event)"
                  #importFileInput
                  style="display: none;">
                <button 
                  type="button"
                  class="action-button import-button"
                  (click)="importFileInput.click()"
                  aria-label="Import filter configuration"
                  title="Import filters">
                  Import
                </button>
              </div>
            }

            <!-- Toolbar Toggle -->
            <button 
              type="button"
              class="action-button toolbar-toggle"
              (click)="toggleToolbar()"
              [attr.aria-label]="showToolbar() ? 'Hide filter toolbar' : 'Show filter toolbar'"
              [title]="showToolbar() ? 'Hide toolbar' : 'Show toolbar'">
              {{ showToolbar() ? '−' : '+' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Status Bar -->
      @if (showFilterStatus()) {
        <div class="filter-status-bar">
          <div class="status-info">
            <span class="filter-count">
              {{ getActiveFilterCount() }} filter{{ getActiveFilterCount() === 1 ? '' : 's' }} active
            </span>
            @if (filteredRowCount() !== null) {
              <span class="row-count">
                {{ filteredRowCount() }} of {{ totalRowCount() }} rows shown
              </span>
            }
          </div>

          @if (config.enableAdvancedMode && showPerformanceMetrics()) {
            <div class="performance-info">
              <span class="filter-time">{{ getLastFilterTime() }}ms</span>
              @if (getCacheHitRate() > 0) {
                <span class="cache-info">{{ getCacheHitRate() }}% cached</span>
              }
            </div>
          }
        </div>
      }

      <!-- Column Filters Container -->
      <div class="column-filters-container" #columnFiltersContainer>
        <!-- Dynamic filter components will be inserted here -->
      </div>

      <!-- Save Preset Dialog -->
      @if (showSavePresetDialog()) {
        <div class="dialog-overlay" (click)="closeSavePresetDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <h3>Save Filter Preset</h3>
            
            <div class="form-group">
              <label for="presetName">Preset Name:</label>
              <input 
                type="text"
                id="presetName"
                class="dialog-input"
                [(ngModel)]="presetDialogName"
                placeholder="Enter preset name..."
                maxlength="50"
                #presetNameInput>
            </div>
            
            <div class="form-group">
              <label for="presetDescription">Description (optional):</label>
              <textarea 
                id="presetDescription"
                class="dialog-textarea"
                [(ngModel)]="presetDialogDescription"
                placeholder="Enter description..."
                maxlength="200"
                rows="3"></textarea>
            </div>
            
            <div class="dialog-actions">
              <button 
                type="button"
                class="dialog-button cancel-button"
                (click)="closeSavePresetDialog()">
                Cancel
              </button>
              <button 
                type="button"
                class="dialog-button save-button"
                [disabled]="!presetDialogName.trim()"
                (click)="savePreset()">
                Save
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Performance Monitor (Debug Mode) -->
      @if (config.enableAdvancedMode && showDebugInfo()) {
        <div class="debug-panel">
          <h4>Filter Performance Debug</h4>
          <div class="debug-metrics">
            @for (metric of getRecentMetrics(); track $index) {
              <div class="metric-row">
                <span class="metric-label">{{ formatMetricTime(metric.timestamp) }}:</span>
                <span class="metric-value">{{ metric.filterTime }}ms</span>
                <span class="metric-details">
                  ({{ metric.dataSize }} rows, 
                  {{ metric.cacheHitRate * 100 | number:'1.0-0' }}% cache hit)
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .blg-enhanced-filter-manager {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      font-size: 13px;
    }

    .filter-toolbar {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: white;
      border-bottom: 1px solid #e9ecef;
      transition: all 0.2s ease;

      &.collapsed {
        padding: 6px 12px;
        
        .quick-filter-section,
        .preset-section,
        .undo-redo-section,
        .export-import-section {
          display: none;
        }
      }
    }

    .quick-filter-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quick-filter-input-wrapper {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .quick-filter-input {
      width: 100%;
      padding: 8px 12px;
      padding-right: 32px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      outline: none;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
      }

      &::placeholder {
        color: #999;
      }
    }

    .clear-quick-filter {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      &:hover {
        background-color: #f0f0f0;
        color: #333;
      }
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .preset-section {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .preset-selector {
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      background: white;
      min-width: 150px;

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .undo-redo-section {
      display: flex;
      gap: 4px;
    }

    .action-button {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover:not(:disabled) {
        background-color: #f5f5f5;
        border-color: #999;
      }

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: #f8f9fa;
      }
    }

    .undo-button,
    .redo-button {
      width: 32px;
      padding: 6px;
      font-size: 16px;
      font-weight: bold;
    }

    .clear-all-button {
      background-color: #f44336;
      color: white;
      border-color: #f44336;

      &:hover:not(:disabled) {
        background-color: #d32f2f;
        border-color: #d32f2f;
      }
    }

    .save-preset-button {
      background-color: #4caf50;
      color: white;
      border-color: #4caf50;

      &:hover:not(:disabled) {
        background-color: #388e3c;
        border-color: #388e3c;
      }
    }

    .export-import-section {
      display: flex;
      gap: 4px;
    }

    .export-button {
      background-color: #2196f3;
      color: white;
      border-color: #2196f3;

      &:hover:not(:disabled) {
        background-color: #1976d2;
        border-color: #1976d2;
      }
    }

    .import-button {
      background-color: #ff9800;
      color: white;
      border-color: #ff9800;

      &:hover:not(:disabled) {
        background-color: #f57c00;
        border-color: #f57c00;
      }
    }

    .toolbar-toggle {
      margin-left: auto;
      font-weight: bold;
      font-size: 16px;
    }

    .filter-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      background-color: #e3f2fd;
      border-bottom: 1px solid #bbdefb;
      font-size: 12px;
    }

    .status-info {
      display: flex;
      gap: 16px;
    }

    .filter-count {
      font-weight: 500;
      color: #1976d2;
    }

    .row-count {
      color: #666;
    }

    .performance-info {
      display: flex;
      gap: 12px;
      font-size: 11px;
    }

    .filter-time {
      color: #4caf50;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .cache-info {
      color: #ff9800;
    }

    .column-filters-container {
      min-height: 20px;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .dialog-content h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #666;
    }

    .dialog-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      outline: none;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
      }
    }

    .dialog-textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      resize: vertical;
      min-height: 60px;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
    }

    .dialog-button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
      }
    }

    .cancel-button {
      background: white;
      color: #666;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .save-button {
      background-color: #1976d2;
      color: white;
      border-color: #1976d2;

      &:hover:not(:disabled) {
        background-color: #1565c0;
        border-color: #1565c0;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .debug-panel {
      padding: 12px;
      background-color: #fff3e0;
      border-top: 1px solid #ffcc02;
    }

    .debug-panel h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #f57c00;
    }

    .debug-metrics {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metric-row {
      display: flex;
      gap: 8px;
      font-size: 11px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .metric-label {
      color: #666;
      min-width: 60px;
    }

    .metric-value {
      color: #4caf50;
      min-width: 40px;
    }

    .metric-details {
      color: #999;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .filter-toolbar {
        padding: 8px;
      }

      .filter-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .quick-filter-input-wrapper {
        max-width: none;
      }

      .export-import-section {
        order: 1;
      }

      .toolbar-toggle {
        margin-left: 0;
        order: -1;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedFilterManagerComponent implements OnInit, OnDestroy {
  @Input() columns: any[] = [];
  @Input() totalRowCount: number = 0;
  @Input() showDebugInfo = false;
  
  @Output() filtersChanged = new EventEmitter<FilterModel>();
  @Output() quickFilterChanged = new EventEmitter<string>();
  @Output() filteredRowCountChanged = new EventEmitter<number>();

  @ViewChild('columnFiltersContainer', { static: true }) 
  columnFiltersContainer!: ElementRef;

  @ViewChild('quickFilterInput') 
  quickFilterInput!: ElementRef;

  // Inject services
  private readonly filterService = inject(EnhancedFilterService);
  private readonly config: FilterConfig = inject(FILTER_CONFIG, { optional: true }) ?? this.getDefaultConfig();

  // Component state
  private readonly _showToolbar = signal(true);
  private readonly _showSavePresetDialog = signal(false);
  private readonly _filteredRowCount = signal<number | null>(null);

  // Dialog state
  presetDialogName = '';
  presetDialogDescription = '';

  // Computed signals from service
  readonly filterModel = this.filterService.filterModel;
  readonly quickFilterValue = this.filterService.quickFilterValue;
  readonly activePreset = this.filterService.activePreset;
  readonly canUndo = this.filterService.canUndo;
  readonly canRedo = this.filterService.canRedo;
  readonly presets = this.filterService.presets;
  readonly performanceMetrics = this.filterService.performanceMetrics;

  // Local computed signals
  readonly showToolbar = computed(() => this._showToolbar());
  readonly showSavePresetDialog = computed(() => this._showSavePresetDialog());
  readonly filteredRowCount = computed(() => this._filteredRowCount());

  // Keyboard event listener
  private keydownListener?: (event: KeyboardEvent) => void;

  ngOnInit(): void {
    this.setupKeyboardShortcuts();
    
    // Subscribe to filter service events
    this.filterService.addEventListener('filterChanged', (event) => {
      this.filtersChanged.emit(this.filterService.getFilterModel());
    });

    this.filterService.addEventListener('filterCleared', (event) => {
      this.filtersChanged.emit(this.filterService.getFilterModel());
    });
  }

  ngOnDestroy(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  // ============================================
  // Quick Filter Methods
  // ============================================

  async onQuickFilterChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    try {
      const filteredData = await this.filterService.setQuickFilter(value);
      this._filteredRowCount.set(filteredData.length);
      this.quickFilterChanged.emit(value);
      this.filteredRowCountChanged.emit(filteredData.length);
    } catch (error) {
      console.error('Quick filter error:', error);
    }
  }

  onQuickFilterKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearQuickFilter();
      event.preventDefault();
    }
  }

  clearQuickFilter(): void {
    this.filterService.clearQuickFilter();
    this.quickFilterChanged.emit('');
  }

  // ============================================
  // Preset Methods
  // ============================================

  async onPresetChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const presetId = target.value;
    
    if (presetId) {
      try {
        const filteredData = await this.filterService.applyPreset(presetId);
        this._filteredRowCount.set(filteredData.length);
        this.filtersChanged.emit(this.filterService.getFilterModel());
        this.filteredRowCountChanged.emit(filteredData.length);
      } catch (error) {
        console.error('Preset application error:', error);
      }
    }
  }

  showSavePresetDialog(): void {
    this.presetDialogName = '';
    this.presetDialogDescription = '';
    this._showSavePresetDialog.set(true);
  }

  closeSavePresetDialog(): void {
    this._showSavePresetDialog.set(false);
  }

  savePreset(): void {
    if (this.presetDialogName.trim()) {
      const preset = this.filterService.savePreset(
        this.presetDialogName.trim(),
        this.presetDialogDescription.trim() || undefined
      );
      
      this.closeSavePresetDialog();
      
      // Auto-select the new preset
      setTimeout(() => {
        const presetSelector = document.querySelector('.preset-selector') as HTMLSelectElement;
        if (presetSelector) {
          presetSelector.value = preset.id;
        }
      }, 100);
    }
  }

  // ============================================
  // Undo/Redo Methods
  // ============================================

  async undo(): Promise<void> {
    try {
      const filteredData = await this.filterService.undo();
      this._filteredRowCount.set(filteredData.length);
      this.filtersChanged.emit(this.filterService.getFilterModel());
      this.filteredRowCountChanged.emit(filteredData.length);
    } catch (error) {
      console.error('Undo error:', error);
    }
  }

  async redo(): Promise<void> {
    try {
      const filteredData = await this.filterService.redo();
      this._filteredRowCount.set(filteredData.length);
      this.filtersChanged.emit(this.filterService.getFilterModel());
      this.filteredRowCountChanged.emit(filteredData.length);
    } catch (error) {
      console.error('Redo error:', error);
    }
  }

  // ============================================
  // Filter Management Methods
  // ============================================

  clearAllFilters(): void {
    this.filterService.clearAllFilters();
    this._filteredRowCount.set(null);
    this.filtersChanged.emit({});
    this.filteredRowCountChanged.emit(this.totalRowCount);
  }

  async exportFilters(): Promise<void> {
    try {
      const filterJson = this.filterService.exportFilterModel();
      const blob = new Blob([filterJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `filter-configuration-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export filters: ' + error);
    }
  }

  async onImportFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      try {
        const text = await file.text();
        const filteredData = await this.filterService.importFilterModel(text);
        this._filteredRowCount.set(filteredData.length);
        this.filtersChanged.emit(this.filterService.getFilterModel());
        this.filteredRowCountChanged.emit(filteredData.length);
        
        // Reset file input
        input.value = '';
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import filters: ' + error);
        input.value = '';
      }
    }
  }

  // ============================================
  // UI State Methods
  // ============================================

  toggleToolbar(): void {
    this._showToolbar.update(show => !show);
  }

  hasActiveFilters(): boolean {
    const filterModel = this.filterModel();
    return Object.keys(filterModel).length > 0 || this.quickFilterValue().length > 0;
  }

  getActiveFilterCount(): number {
    const filterModel = this.filterModel();
    return Object.keys(filterModel).length;
  }

  showFilterStatus(): boolean {
    return this.hasActiveFilters() || this.config.enableAdvancedMode;
  }

  showPerformanceMetrics(): boolean {
    return this.config.enableAdvancedMode && this.performanceMetrics().length > 0;
  }

  // ============================================
  // Performance Metrics Methods
  // ============================================

  getLastFilterTime(): string {
    const metrics = this.performanceMetrics();
    if (metrics.length === 0) return '0';
    
    const lastMetric = metrics[metrics.length - 1];
    return lastMetric.filterTime.toFixed(1);
  }

  getCacheHitRate(): number {
    const metrics = this.performanceMetrics();
    if (metrics.length === 0) return 0;
    
    const recentMetrics = metrics.slice(-10);
    const avgCacheHit = recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;
    return Math.round(avgCacheHit * 100);
  }

  getRecentMetrics(): any[] {
    return this.performanceMetrics()
      .slice(-5)
      .map(metric => ({
        ...metric,
        timestamp: Date.now() - (5 - this.performanceMetrics().indexOf(metric)) * 1000
      }));
  }

  formatMetricTime(timestamp: number): string {
    const now = Date.now();
    const diffSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  }

  // ============================================
  // Column Filter Management
  // ============================================

  createColumnFilter(columnId: string, filterType: FilterType): void {
    // This method would be called to dynamically create column-specific filters
    // Implementation would depend on the specific grid integration
    console.log(`Creating ${filterType} filter for column ${columnId}`);
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  private setupKeyboardShortcuts(): void {
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            if (!event.shiftKey && this.canUndo()) {
              event.preventDefault();
              this.undo();
            }
            break;
          case 'y':
            if (this.canRedo()) {
              event.preventDefault();
              this.redo();
            }
            break;
          case 'Z':
            if (event.shiftKey && this.canRedo()) {
              event.preventDefault();
              this.redo();
            }
            break;
          case 'f':
            event.preventDefault();
            this.quickFilterInput?.nativeElement?.focus();
            break;
        }
      }
      
      if (event.key === 'Escape') {
        if (this.showSavePresetDialog()) {
          this.closeSavePresetDialog();
        }
      }
    };

    document.addEventListener('keydown', this.keydownListener);
  }

  // ============================================
  // Configuration
  // ============================================

  private getDefaultConfig(): FilterConfig {
    return {
      debounceMs: 300,
      enableCaching: true,
      cacheSize: 100,
      enableWebWorkers: true,
      enableIndexedDB: true,
      showFilterIcons: true,
      showClearAllButton: true,
      showFilterPanelButton: true,
      enableQuickFilter: true,
      enableUndoRedo: true,
      maxUndoSteps: 50,
      enableFilterPresets: true,
      enableFilterExport: true,
      enableAdvancedMode: true,
      textFilterOptions: {
        defaultCaseSensitive: false,
        enableRegex: true,
        enableFuzzyMatch: true,
        fuzzyThreshold: 0.8
      },
      numberFilterOptions: {
        allowDecimals: true,
        decimalPlaces: 2,
        enableAdvancedOperators: true
      },
      dateFilterOptions: {
        dateFormat: 'yyyy-MM-dd',
        includeTime: false,
        enableRelativeDates: true,
        enableSeasonalFilters: true
      }
    };
  }
}