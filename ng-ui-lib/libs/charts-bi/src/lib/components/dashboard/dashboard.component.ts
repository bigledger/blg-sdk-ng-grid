import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  computed,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  DashboardConfig,
  DashboardWidget,
  DashboardFilter,
  DashboardContext,
  ExportFormat
} from '../../interfaces/dashboard.interface.ts';
import { DashboardService } from '../../services/dashboard.service.ts';

@Component({
  selector: 'ng-bi-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag
  ],
  template: `
    <div class="bi-dashboard" [class]="dashboardClasses()">
      <!-- Dashboard Header -->
      <div class="bi-dashboard-header" *ngIf="showHeader">
        <div class="bi-dashboard-title">
          <h2>{{ config()?.title }}</h2>
          <p class="bi-dashboard-description" *ngIf="config()?.description">
            {{ config()?.description }}
          </p>
        </div>
        
        <div class="bi-dashboard-actions">
          <!-- Refresh Button -->
          <button 
            class="bi-btn bi-btn-icon"
            [disabled]="context.state().loading.size > 0"
            (click)="context.actions.refreshAll()"
            title="Refresh All Widgets">
            <span class="bi-icon" [class.bi-loading]="context.state().loading.size > 0">↻</span>
          </button>
          
          <!-- Export Button -->
          <div class="bi-dropdown" *ngIf="allowExport">
            <button class="bi-btn bi-btn-icon bi-dropdown-toggle" title="Export Dashboard">
              <span class="bi-icon">⤓</span>
            </button>
            <div class="bi-dropdown-menu">
              <button 
                class="bi-dropdown-item"
                *ngFor="let format of exportFormats"
                (click)="context.actions.exportDashboard(format)">
                Export as {{ format.toUpperCase() }}
              </button>
            </div>
          </div>
          
          <!-- Bookmark Button -->
          <button 
            class="bi-btn bi-btn-icon"
            (click)="showBookmarkDialog = true"
            title="Save Bookmark">
            <span class="bi-icon">⭐</span>
          </button>
          
          <!-- Edit Mode Toggle -->
          <button 
            class="bi-btn bi-btn-icon"
            [class.active]="editMode()"
            (click)="editMode.set(!editMode())"
            *ngIf="allowEdit"
            title="Edit Mode">
            <span class="bi-icon">✏️</span>
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bi-filter-bar" *ngIf="showFilters && hasFilters()">
        <div class="bi-filter-controls">
          <div 
            class="bi-filter-control"
            *ngFor="let filter of config()?.filters || []">
            <ng-bi-filter-control
              [filter]="filter"
              [value]="context.state().filters.get(filter.id)"
              (valueChange)="context.actions.updateFilter(filter.id, $event)">
            </ng-bi-filter-control>
          </div>
        </div>
        
        <div class="bi-filter-actions">
          <button 
            class="bi-btn bi-btn-sm"
            (click)="clearAllFilters()"
            [disabled]="!hasActiveFilters()">
            Clear All
          </button>
        </div>
      </div>

      <!-- Breadcrumb Navigation -->
      <div class="bi-breadcrumb" *ngIf="showBreadcrumb && context.state().drillDownStack().length > 0">
        <button 
          class="bi-breadcrumb-item"
          (click)="context.actions.drillUp()">
          ← Back
        </button>
        <span class="bi-breadcrumb-separator">/</span>
        <span class="bi-breadcrumb-current">Current View</span>
      </div>

      <!-- Dashboard Grid -->
      <div 
        class="bi-dashboard-grid"
        cdkDropList
        [cdkDropListDisabled]="!editMode()"
        (cdkDropListDropped)="onWidgetDrop($event)"
        [style.grid-template-columns]="gridColumns()"
        [style.gap]="gridGap()">
        
        <div 
          class="bi-widget-container"
          *ngFor="let widget of visibleWidgets(); trackBy: trackByWidgetId"
          cdkDrag
          [cdkDragDisabled]="!editMode()"
          [style.grid-column]="getWidgetGridColumn(widget)"
          [style.grid-row]="getWidgetGridRow(widget)"
          [attr.data-widget-id]="widget.id">
          
          <!-- Widget Content -->
          <ng-bi-widget
            [widget]="widget"
            [data]="context.state().data.get(widget.id)"
            [loading]="context.state().loading.has(widget.id)"
            [error]="context.state().errors.get(widget.id)"
            [editMode]="editMode()"
            (drillDown)="onDrillDown(widget.id, $event)"
            (export)="onExportWidget(widget.id, $event)"
            (configure)="onConfigureWidget(widget)"
            (remove)="onRemoveWidget(widget.id)">
          </ng-bi-widget>
          
          <!-- Edit Mode Overlay -->
          <div class="bi-widget-edit-overlay" *ngIf="editMode()">
            <div class="bi-widget-edit-controls">
              <button 
                class="bi-btn bi-btn-sm"
                (click)="onConfigureWidget(widget)"
                title="Configure Widget">
                <span class="bi-icon">⚙️</span>
              </button>
              <button 
                class="bi-btn bi-btn-sm bi-btn-danger"
                (click)="onRemoveWidget(widget.id)"
                title="Remove Widget">
                <span class="bi-icon">🗑️</span>
              </button>
            </div>
            
            <!-- Resize Handles -->
            <div class="bi-resize-handles">
              <div class="bi-resize-handle bi-resize-se" 
                   (mousedown)="startResize($event, widget, 'se')"></div>
            </div>
          </div>
        </div>
        
        <!-- Add Widget Button -->
        <div class="bi-add-widget" *ngIf="editMode()" (click)="showAddWidgetDialog = true">
          <div class="bi-add-widget-content">
            <span class="bi-icon">+</span>
            <span>Add Widget</span>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="bi-loading-overlay" *ngIf="isFullyLoading()">
        <div class="bi-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <!-- Error Messages -->
      <div class="bi-error-list" *ngIf="hasErrors()">
        <div 
          class="bi-error-item"
          *ngFor="let error of getErrors()">
          <span class="bi-error-icon">⚠️</span>
          <span class="bi-error-message">{{ error.message }}</span>
          <button 
            class="bi-error-close"
            (click)="dismissError(error.widgetId)">×</button>
        </div>
      </div>
    </div>

    <!-- Bookmark Dialog -->
    <ng-bi-bookmark-dialog
      *ngIf="showBookmarkDialog"
      [dashboardId]="config()?.id || ''"
      [currentState]="getCurrentBookmarkState()"
      (save)="onSaveBookmark($event)"
      (close)="showBookmarkDialog = false">
    </ng-bi-bookmark-dialog>

    <!-- Add Widget Dialog -->
    <ng-bi-add-widget-dialog
      *ngIf="showAddWidgetDialog"
      (add)="onAddWidget($event)"
      (close)="showAddWidgetDialog = false">
    </ng-bi-add-widget-dialog>

    <!-- Widget Configuration Dialog -->
    <ng-bi-widget-config-dialog
      *ngIf="configureWidgetData"
      [widget]="configureWidgetData"
      (save)="onSaveWidgetConfig($event)"
      (close)="configureWidgetData = null">
    </ng-bi-widget-config-dialog>
  `,
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  // Inputs
  @Input() set dashboardConfig(config: DashboardConfig | null) {
    if (config) {
      this.config.set(config);
      this.dashboardService.initialize(config);
    }
  }

  @Input() showHeader = true;
  @Input() showFilters = true;
  @Input() showBreadcrumb = true;
  @Input() allowEdit = false;
  @Input() allowExport = true;
  @Input() exportFormats: ExportFormat[] = ['pdf', 'excel', 'csv'];

  // Outputs
  @Output() widgetDrillDown = new EventEmitter<{widgetId: string, params: any}>();
  @Output() widgetExport = new EventEmitter<{widgetId: string, format: ExportFormat}>();
  @Output() dashboardChange = new EventEmitter<DashboardConfig>();
  @Output() error = new EventEmitter<Error>();

  // State
  readonly config = signal<DashboardConfig | null>(null);
  readonly editMode = signal(false);
  readonly context = this.dashboardService.getContext();

  // Dialog states
  showBookmarkDialog = false;
  showAddWidgetDialog = false;
  configureWidgetData: DashboardWidget | null = null;

  // Computed properties
  readonly dashboardClasses = computed(() => {
    const classes = ['bi-dashboard'];
    if (this.editMode()) classes.push('bi-edit-mode');
    if (this.context.state().loading.size > 0) classes.push('bi-loading');
    return classes.join(' ');
  });

  readonly gridColumns = computed(() => {
    const config = this.config();
    if (!config?.layout) return 'repeat(12, 1fr)';
    return `repeat(${config.layout.columns}, 1fr)`;
  });

  readonly gridGap = computed(() => {
    const config = this.config();
    return `${config?.layout.gap || 16}px`;
  });

  readonly visibleWidgets = computed(() => {
    const config = this.config();
    return config?.widgets || [];
  });

  readonly hasFilters = computed(() => {
    const config = this.config();
    return config?.filters && config.filters.length > 0;
  });

  readonly isFullyLoading = computed(() => {
    const state = this.context.state();
    const config = this.config();
    return config && state.loading.size === config.widgets.length;
  });

  readonly hasErrors = computed(() => {
    return this.context.state().errors.size > 0;
  });

  ngOnInit(): void {
    // Auto-refresh effect
    effect(() => {
      const config = this.config();
      if (config?.refreshInterval && config.refreshInterval > 0) {
        const interval = setInterval(() => {
          this.context.actions.refreshAll();
        }, config.refreshInterval * 1000);

        return () => clearInterval(interval);
      }
      return () => {};
    });
  }

  ngOnDestroy(): void {
    // Cleanup handled by effects
  }

  // Event handlers
  onWidgetDrop(event: CdkDragDrop<DashboardWidget[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      const config = this.config();
      if (config) {
        const widgets = [...config.widgets];
        moveItemInArray(widgets, event.previousIndex, event.currentIndex);
        
        const updatedConfig = { ...config, widgets };
        this.config.set(updatedConfig);
        this.dashboardChange.emit(updatedConfig);
      }
    }
  }

  onDrillDown(widgetId: string, params: any): void {
    this.context.actions.drillDown(widgetId, params);
    this.widgetDrillDown.emit({ widgetId, params });
  }

  onExportWidget(widgetId: string, format: ExportFormat): void {
    this.context.actions.exportWidget(widgetId, format);
    this.widgetExport.emit({ widgetId, format });
  }

  onConfigureWidget(widget: DashboardWidget): void {
    this.configureWidgetData = widget;
  }

  onRemoveWidget(widgetId: string): void {
    if (confirm('Are you sure you want to remove this widget?')) {
      const config = this.config();
      if (config) {
        const widgets = config.widgets.filter(w => w.id !== widgetId);
        const updatedConfig = { ...config, widgets };
        this.config.set(updatedConfig);
        this.dashboardChange.emit(updatedConfig);
      }
    }
  }

  onAddWidget(widgetData: Partial<DashboardWidget>): void {
    const config = this.config();
    if (config) {
      const newWidget: DashboardWidget = {
        id: `widget_${Date.now()}`,
        type: widgetData.type || 'chart',
        title: widgetData.title || 'New Widget',
        position: widgetData.position || { x: 0, y: 0 },
        size: widgetData.size || { width: 4, height: 3 },
        config: widgetData.config || {},
        dataSource: widgetData.dataSource || {
          id: 'default',
          type: 'static',
          connection: {},
          query: {}
        }
      };

      const widgets = [...config.widgets, newWidget];
      const updatedConfig = { ...config, widgets };
      this.config.set(updatedConfig);
      this.dashboardChange.emit(updatedConfig);
    }
    this.showAddWidgetDialog = false;
  }

  onSaveWidgetConfig(updatedWidget: DashboardWidget): void {
    const config = this.config();
    if (config) {
      const widgets = config.widgets.map(w => 
        w.id === updatedWidget.id ? updatedWidget : w
      );
      const updatedConfig = { ...config, widgets };
      this.config.set(updatedConfig);
      this.dashboardChange.emit(updatedConfig);
    }
    this.configureWidgetData = null;
  }

  onSaveBookmark(bookmarkData: any): void {
    this.context.actions.saveBookmark(bookmarkData.name);
    this.showBookmarkDialog = false;
  }

  // Utility methods
  trackByWidgetId(index: number, widget: DashboardWidget): string {
    return widget.id;
  }

  getWidgetGridColumn(widget: DashboardWidget): string {
    return `${widget.position.x + 1} / span ${widget.size.width}`;
  }

  getWidgetGridRow(widget: DashboardWidget): string {
    return `${widget.position.y + 1} / span ${widget.size.height}`;
  }

  hasActiveFilters(): boolean {
    const filters = this.context.state().filters;
    return Array.from(filters.values()).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  }

  clearAllFilters(): void {
    const config = this.config();
    if (config?.filters) {
      config.filters.forEach(filter => {
        this.context.actions.updateFilter(filter.id, filter.defaultValue);
      });
    }
  }

  getErrors(): Array<{widgetId: string, message: string}> {
    const errors = this.context.state().errors;
    return Array.from(errors.entries()).map(([widgetId, error]) => ({
      widgetId,
      message: error.message
    }));
  }

  dismissError(widgetId: string): void {
    // This would be implemented in the dashboard service
    console.log('Dismissing error for widget:', widgetId);
  }

  getCurrentBookmarkState(): any {
    return {
      filters: Object.fromEntries(this.context.state().filters),
      drillDownStack: this.context.state().drillDownStack || []
    };
  }

  startResize(event: MouseEvent, widget: DashboardWidget, direction: string): void {
    // Implement resize functionality
    event.preventDefault();
    console.log('Starting resize for widget:', widget.id, 'direction:', direction);
    // This would involve mouse move listeners and updating widget size
  }
}