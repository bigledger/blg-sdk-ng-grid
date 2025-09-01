import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridOptions } from './ag-grid-options.interface';
import { MigrationUtilities, NgUiGridCompatibleInstance } from './migration-utilities';
import { EventAdapter } from './event-adapter';
import { GridEvent } from '@blg-grid/core';

/**
 * NgUiGrid component with ag-Grid compatibility layer
 * Provides backwards compatibility for ag-Grid applications
 */
@Component({
  selector: 'ng-ui-grid-compat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #gridContainer 
      class="ng-ui-grid-compat-container"
      [class.ag-theme-alpine]="isAgGridTheme('ag-theme-alpine')"
      [class.ag-theme-alpine-dark]="isAgGridTheme('ag-theme-alpine-dark')"
      [class.ag-theme-balham]="isAgGridTheme('ag-theme-balham')"
      [class.ag-theme-balham-dark]="isAgGridTheme('ag-theme-balham-dark')"
      [class.ag-theme-material]="isAgGridTheme('ag-theme-material')"
      [class.ag-theme-quartz]="isAgGridTheme('ag-theme-quartz')"
      [class.ag-theme-quartz-dark]="isAgGridTheme('ag-theme-quartz-dark')"
      [style.height]="containerHeight()"
      [style.width]="containerWidth()">
      
      <!-- Compatibility warnings -->
      <div 
        *ngIf="showCompatibilityWarnings() && compatibilityWarnings().length > 0" 
        class="compatibility-warnings">
        <div class="warning-header">
          <strong>ag-Grid Compatibility Warnings:</strong>
          <button 
            type="button"
            class="close-warnings"
            (click)="hideWarnings()">×</button>
        </div>
        <ul class="warning-list">
          <li *ngFor="let warning of compatibilityWarnings()">{{ warning }}</li>
        </ul>
      </div>
      
      <!-- Loading overlay -->
      <div 
        *ngIf="showLoading()" 
        class="ag-overlay ag-overlay-loading-wrapper">
        <div class="ag-overlay-loading-center">
          <div class="ag-overlay-loading-text">Loading...</div>
        </div>
      </div>
      
      <!-- No rows overlay -->
      <div 
        *ngIf="showNoRows()" 
        class="ag-overlay ag-overlay-no-rows-wrapper">
        <div class="ag-overlay-no-rows-center">
          <div class="ag-overlay-no-rows-text">No Rows To Show</div>
        </div>
      </div>
      
      <!-- Grid content would be rendered here -->
      <!-- This would integrate with the actual NgUiGrid component -->
      <div class="grid-content" *ngIf="!showLoading() && !showNoRows()">
        <!-- Placeholder for NgUiGrid component integration -->
        <div class="grid-placeholder">
          <p>NgUiGrid Component Integration Point</p>
          <p>Rows: {{ currentRowData().length }}</p>
          <p>Columns: {{ currentColumnDefs().length }}</p>
          <p>Theme: {{ currentTheme() }}</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ng-ui-grid-compat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgUiGridCompatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef<HTMLElement>;
  
  // ag-Grid compatible inputs
  @Input() gridOptions: AgGridOptions = {};
  @Input() rowData: any[] = [];
  @Input() columnDefs: any[] = [];
  @Input() autoSizeStrategy: any = null;
  @Input() context: any = null;
  @Input() debug: boolean = false;
  
  // Compatibility options
  @Input() enableCompatibilityMode: boolean = true;
  @Input() showCompatibilityWarnings: boolean = true;
  @Input() strictCompatibility: boolean = false;
  
  // ag-Grid compatible outputs
  @Output() gridReady = new EventEmitter<any>();
  @Output() firstDataRendered = new EventEmitter<any>();
  @Output() modelUpdated = new EventEmitter<any>();
  @Output() rowClicked = new EventEmitter<any>();
  @Output() rowDoubleClicked = new EventEmitter<any>();
  @Output() rowSelected = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<any>();
  @Output() cellClicked = new EventEmitter<any>();
  @Output() cellDoubleClicked = new EventEmitter<any>();
  @Output() cellValueChanged = new EventEmitter<any>();
  @Output() cellEditingStarted = new EventEmitter<any>();
  @Output() cellEditingStopped = new EventEmitter<any>();
  @Output() columnResized = new EventEmitter<any>();
  @Output() columnMoved = new EventEmitter<any>();
  @Output() columnVisible = new EventEmitter<any>();
  @Output() columnPinned = new EventEmitter<any>();
  @Output() sortChanged = new EventEmitter<any>();
  @Output() filterChanged = new EventEmitter<any>();
  @Output() paginationChanged = new EventEmitter<any>();
  
  // Internal state signals
  private _compatibleInstance = signal<NgUiGridCompatibleInstance | null>(null);
  private _isInitialized = signal<boolean>(false);
  private _showWarnings = signal<boolean>(true);
  private _isLoading = signal<boolean>(false);
  private _showNoRowsOverlay = signal<boolean>(false);
  
  // Computed properties
  readonly compatibilityWarnings = computed(() => {
    const instance = this._compatibleInstance();
    return instance?.getCompatibilityReport().warnings || [];
  });
  
  readonly currentRowData = computed(() => {
    const instance = this._compatibleInstance();
    return instance?.gridOptions.rowData || this.rowData;
  });
  
  readonly currentColumnDefs = computed(() => {
    const instance = this._compatibleInstance();
    return instance?.gridOptions.columnDefs || [];
  });
  
  readonly currentTheme = computed(() => {
    return this.gridOptions.theme || 'ag-theme-alpine';
  });
  
  readonly containerHeight = computed(() => {
    const height = this.gridOptions.height;
    if (typeof height === 'number') return `${height}px`;
    if (typeof height === 'string') return height;
    return '400px'; // default height
  });
  
  readonly containerWidth = computed(() => {
    const width = this.gridOptions.width;
    if (typeof width === 'number') return `${width}px`;
    if (typeof width === 'string') return width;
    return '100%'; // default width
  });
  
  readonly showLoading = computed(() => this._isLoading());
  readonly showNoRows = computed(() => {
    return !this._isLoading() && 
           this._showNoRowsOverlay() && 
           this.currentRowData().length === 0;
  });
  
  readonly showCompatibilityWarnings = computed(() => {
    return this.showCompatibilityWarnings && 
           this._showWarnings() && 
           this.compatibilityWarnings().length > 0;
  });
  
  // Public API properties (ag-Grid compatible)
  public api: any = null;
  public columnApi: any = null;
  
  constructor(private migrationUtilities: MigrationUtilities) {}
  
  ngOnInit(): void {
    this.initializeCompatibilityLayer();
  }
  
  ngAfterViewInit(): void {
    if (this._isInitialized()) {
      this.setupEventHandlers();
      this.fireGridReadyEvent();
    }
  }
  
  ngOnDestroy(): void {
    const instance = this._compatibleInstance();
    if (instance) {
      instance.destroy();
    }
  }
  
  /**
   * Initialize the ag-Grid compatibility layer
   */
  private initializeCompatibilityLayer(): void {
    try {
      // Merge inputs with gridOptions
      const mergedOptions: AgGridOptions = {
        ...this.gridOptions,
        rowData: this.rowData.length > 0 ? this.rowData : this.gridOptions.rowData,
        columnDefs: this.columnDefs.length > 0 ? this.columnDefs : this.gridOptions.columnDefs
      };
      
      // Create compatible instance
      const instance = this.migrationUtilities.createCompatibleGridInstance(
        mergedOptions,
        this.gridContainer.nativeElement
      );
      
      // Set up API references
      this.api = instance.api;
      this.columnApi = instance.columnApi;
      
      // Set grid references in API adapter
      instance.api.setGridReferences(this, null); // Would need actual NgUiGrid service
      
      this._compatibleInstance.set(instance);
      this._isInitialized.set(true);
      
      if (this.debug) {
        console.log('NgUiGrid Compatibility Layer initialized', {
          instance,
          compatibilityReport: instance.getCompatibilityReport()
        });
      }
      
    } catch (error) {
      console.error('Failed to initialize ag-Grid compatibility layer:', error);
      this._isInitialized.set(false);
    }
  }
  
  /**
   * Set up event handlers for ag-Grid compatibility
   */
  private setupEventHandlers(): void {
    const instance = this._compatibleInstance();
    if (!instance) return;
    
    const eventAdapter = instance.eventAdapter;
    
    // Map NgUiGrid events to ag-Grid events and emit them
    eventAdapter.addEventListener('gridReady', (event) => this.gridReady.emit(event));
    eventAdapter.addEventListener('firstDataRendered', (event) => this.firstDataRendered.emit(event));
    eventAdapter.addEventListener('modelUpdated', (event) => this.modelUpdated.emit(event));
    eventAdapter.addEventListener('rowClicked', (event) => this.rowClicked.emit(event));
    eventAdapter.addEventListener('rowDoubleClicked', (event) => this.rowDoubleClicked.emit(event));
    eventAdapter.addEventListener('rowSelected', (event) => this.rowSelected.emit(event));
    eventAdapter.addEventListener('selectionChanged', (event) => this.selectionChanged.emit(event));
    eventAdapter.addEventListener('cellClicked', (event) => this.cellClicked.emit(event));
    eventAdapter.addEventListener('cellDoubleClicked', (event) => this.cellDoubleClicked.emit(event));
    eventAdapter.addEventListener('cellValueChanged', (event) => this.cellValueChanged.emit(event));
    eventAdapter.addEventListener('cellEditingStarted', (event) => this.cellEditingStarted.emit(event));
    eventAdapter.addEventListener('cellEditingStopped', (event) => this.cellEditingStopped.emit(event));
    eventAdapter.addEventListener('columnResized', (event) => this.columnResized.emit(event));
    eventAdapter.addEventListener('columnMoved', (event) => this.columnMoved.emit(event));
    eventAdapter.addEventListener('columnVisible', (event) => this.columnVisible.emit(event));
    eventAdapter.addEventListener('columnPinned', (event) => this.columnPinned.emit(event));
    eventAdapter.addEventListener('sortChanged', (event) => this.sortChanged.emit(event));
    eventAdapter.addEventListener('filterChanged', (event) => this.filterChanged.emit(event));
    eventAdapter.addEventListener('paginationChanged', (event) => this.paginationChanged.emit(event));
  }
  
  /**
   * Fire the grid ready event
   */
  private fireGridReadyEvent(): void {
    const instance = this._compatibleInstance();
    if (instance) {
      instance.eventAdapter.fireGridReadyEvent();
    }
  }
  
  /**
   * Handle NgUiGrid events and convert to ag-Grid format
   */
  public onNgUiGridEvent(event: GridEvent): void {
    const instance = this._compatibleInstance();
    if (instance) {
      instance.eventAdapter.handleNgUiGridEvent(event);
    }
  }
  
  /**
   * Check if the current theme is an ag-Grid theme
   */
  public isAgGridTheme(theme: string): boolean {
    return this.currentTheme() === theme;
  }
  
  /**
   * Hide compatibility warnings
   */
  public hideWarnings(): void {
    this._showWarnings.set(false);
  }
  
  /**
   * Show loading overlay (ag-Grid compatible method)
   */
  public showLoadingOverlay(): void {
    this._isLoading.set(true);
    this._showNoRowsOverlay.set(false);
  }
  
  /**
   * Show no rows overlay (ag-Grid compatible method)
   */
  public showNoRowsOverlay(): void {
    this._isLoading.set(false);
    this._showNoRowsOverlay.set(true);
  }
  
  /**
   * Hide overlay (ag-Grid compatible method)
   */
  public hideOverlay(): void {
    this._isLoading.set(false);
    this._showNoRowsOverlay.set(false);
  }
  
  /**
   * Update grid options (ag-Grid compatible method)
   */
  public updateGridOptions(newOptions: Partial<AgGridOptions>): void {
    const currentOptions = this._compatibleInstance()?.gridOptions.agGridOptions || this.gridOptions;
    const mergedOptions = { ...currentOptions, ...newOptions };
    
    // Reinitialize with new options
    this.gridOptions = mergedOptions;
    this.initializeCompatibilityLayer();
    
    if (this._isInitialized()) {
      this.setupEventHandlers();
    }
  }
  
  /**
   * Get compatibility report
   */
  public getCompatibilityReport(): any {
    const instance = this._compatibleInstance();
    return instance ? instance.getCompatibilityReport() : null;
  }
  
  /**
   * Get migration documentation
   */
  public getMigrationDocumentation(): any {
    return this.migrationUtilities.generateMigrationDocumentation(this.gridOptions);
  }
  
  /**
   * Validate current configuration compatibility
   */
  public validateCompatibility(): any {
    return this.migrationUtilities.validateCompatibility(this.gridOptions);
  }
  
  /**
   * Generate migration checklist
   */
  public generateMigrationChecklist(): any {
    return this.migrationUtilities.generateMigrationChecklist(this.gridOptions);
  }
  
  /**
   * Export configuration for debugging
   */
  public exportConfiguration(): any {
    const instance = this._compatibleInstance();
    return {
      originalAgGridOptions: this.gridOptions,
      migratedConfiguration: instance?.gridOptions,
      compatibilityReport: instance?.getCompatibilityReport(),
      currentState: {
        rowData: this.currentRowData(),
        columnDefs: this.currentColumnDefs(),
        isInitialized: this._isInitialized(),
        warnings: this.compatibilityWarnings()
      }
    };
  }
  
  // ag-Grid compatible lifecycle methods
  
  /**
   * Refresh the grid (ag-Grid compatible)
   */
  public refreshCells(): void {
    if (this.api) {
      this.api.refreshCells();
    }
  }
  
  /**
   * Size columns to fit (ag-Grid compatible)
   */
  public sizeColumnsToFit(): void {
    if (this.columnApi) {
      this.columnApi.autoSizeAllColumns();
    }
  }
  
  /**
   * Get selected rows (ag-Grid compatible)
   */
  public getSelectedRows(): any[] {
    return this.api ? this.api.getSelectedRows() : [];
  }
  
  /**
   * Get selected nodes (ag-Grid compatible)
   */
  public getSelectedNodes(): any[] {
    return this.api ? this.api.getSelectedNodes() : [];
  }
  
  /**
   * Set row data (ag-Grid compatible)
   */
  public setRowData(rowData: any[]): void {
    if (this.api) {
      this.api.setRowData(rowData);
    }
    this.rowData = rowData;
  }
  
  /**
   * Set column definitions (ag-Grid compatible)
   */
  public setColumnDefs(colDefs: any[]): void {
    if (this.api) {
      this.api.setColumnDefs(colDefs);
    }
    this.columnDefs = colDefs;
  }
}