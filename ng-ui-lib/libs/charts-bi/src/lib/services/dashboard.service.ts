import { Injectable, Signal, computed, signal, effect } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, timer, EMPTY, of } from 'rxjs';
import { map, switchMap, catchError, debounceTime, distinctUntilChanged, share } from 'rxjs/operators';

import {
  DashboardConfig,
  DashboardState,
  DashboardContext,
  DashboardActions,
  DashboardWidget,
  DashboardFilter,
  ExportFormat
} from '../interfaces/dashboard.interface.ts';
import { DataConnectorService } from './data-connector.service.ts';
import { ExportService } from './export.service.ts';
import { BookmarkService } from './bookmark.service.ts';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly _state = signal<DashboardState>({
    config: {} as DashboardConfig,
    data: new Map(),
    filters: new Map(),
    loading: new Set(),
    errors: new Map(),
    lastRefresh: new Date()
  });

  private readonly _drillDownStack = signal<string[]>([]);
  private readonly _bookmarks = signal<Map<string, any>>(new Map());
  
  readonly state = this._state.asReadonly();
  readonly drillDownStack = this._drillDownStack.asReadonly();
  readonly bookmarks = this._bookmarks.asReadonly();

  // Computed signals for derived state
  readonly isLoading = computed(() => this._state().loading.size > 0);
  readonly hasErrors = computed(() => this._state().errors.size > 0);
  readonly canDrillUp = computed(() => this._drillDownStack().length > 0);
  
  readonly filteredWidgets = computed(() => {
    const state = this._state();
    const filters = state.filters;
    
    return state.config.widgets?.filter(widget => 
      this.matchesFilters(widget, filters)
    ) || [];
  });

  readonly actions: DashboardActions = {
    updateFilter: (filterId: string, value: any) => this.updateFilter(filterId, value),
    refreshWidget: (widgetId: string) => this.refreshWidget(widgetId),
    refreshAll: () => this.refreshAll(),
    drillDown: (widgetId: string, params: Record<string, any>) => this.drillDown(widgetId, params),
    drillUp: () => this.drillUp(),
    exportWidget: (widgetId: string, format: ExportFormat) => this.exportWidget(widgetId, format),
    exportDashboard: (format: ExportFormat) => this.exportDashboard(format),
    saveBookmark: (name: string) => this.saveBookmark(name),
    loadBookmark: (bookmarkId: string) => this.loadBookmark(bookmarkId)
  };

  constructor(
    private dataConnector: DataConnectorService,
    private exportService: ExportService,
    private bookmarkService: BookmarkService
  ) {
    this.setupAutoRefresh();
  }

  /**
   * Initialize dashboard with configuration
   */
  initialize(config: DashboardConfig): void {
    this._state.update(state => ({
      ...state,
      config,
      data: new Map(),
      filters: this.initializeFilters(config.filters || []),
      loading: new Set(),
      errors: new Map(),
      lastRefresh: new Date()
    }));

    // Load initial data for all widgets
    this.refreshAll();

    // Setup real-time updates if enabled
    if (config.realTimeEnabled) {
      this.setupRealTimeUpdates();
    }
  }

  /**
   * Update filter value and refresh affected widgets
   */
  private updateFilter(filterId: string, value: any): void {
    this._state.update(state => {
      const newFilters = new Map(state.filters);
      newFilters.set(filterId, value);
      
      return {
        ...state,
        filters: newFilters
      };
    });

    // Refresh widgets affected by this filter
    this.refreshFilteredWidgets(filterId);
  }

  /**
   * Refresh specific widget data
   */
  private refreshWidget(widgetId: string): void {
    const state = this._state();
    const widget = state.config.widgets?.find(w => w.id === widgetId);
    
    if (!widget) {
      console.error(`Widget not found: ${widgetId}`);
      return;
    }

    this.setLoading(widgetId, true);
    
    this.loadWidgetData(widget)
      .subscribe({
        next: (data) => {
          this._state.update(state => {
            const newData = new Map(state.data);
            newData.set(widgetId, data);
            
            const newErrors = new Map(state.errors);
            newErrors.delete(widgetId);
            
            return {
              ...state,
              data: newData,
              errors: newErrors,
              lastRefresh: new Date()
            };
          });
          
          this.setLoading(widgetId, false);
        },
        error: (error) => {
          this._state.update(state => {
            const newErrors = new Map(state.errors);
            newErrors.set(widgetId, error);
            
            return {
              ...state,
              errors: newErrors
            };
          });
          
          this.setLoading(widgetId, false);
        }
      });
  }

  /**
   * Refresh all widgets
   */
  private refreshAll(): void {
    const state = this._state();
    const widgets = state.config.widgets || [];
    
    widgets.forEach(widget => {
      this.refreshWidget(widget.id);
    });
  }

  /**
   * Drill down to detailed view
   */
  private drillDown(widgetId: string, params: Record<string, any>): void {
    const state = this._state();
    const widget = state.config.widgets?.find(w => w.id === widgetId);
    
    if (!widget?.drillDown?.enabled) {
      return;
    }

    // Add current state to drill-down stack
    this._drillDownStack.update(stack => [...stack, widgetId]);
    
    // Apply drill-down parameters as filters
    Object.entries(params).forEach(([key, value]) => {
      this.updateFilter(key, value);
    });
    
    // Navigate to drill-down target if specified
    if (widget.drillDown.target.type === 'dashboard') {
      this.navigateToDashboard(widget.drillDown.target.target);
    }
  }

  /**
   * Drill up to previous level
   */
  private drillUp(): void {
    const stack = this._drillDownStack();
    if (stack.length === 0) return;
    
    // Remove last item from stack
    this._drillDownStack.update(stack => stack.slice(0, -1));
    
    // Restore previous state or clear drill-down filters
    this.clearDrillDownFilters();
  }

  /**
   * Export widget data
   */
  private exportWidget(widgetId: string, format: ExportFormat): void {
    const state = this._state();
    const widget = state.config.widgets?.find(w => w.id === widgetId);
    const data = state.data.get(widgetId);
    
    if (!widget || !data) {
      console.error(`Cannot export widget: ${widgetId}`);
      return;
    }

    this.exportService.exportWidget(widget, data, format);
  }

  /**
   * Export entire dashboard
   */
  private exportDashboard(format: ExportFormat): void {
    const state = this._state();
    
    this.exportService.exportDashboard(
      state.config,
      state.data,
      format
    );
  }

  /**
   * Save current dashboard state as bookmark
   */
  private saveBookmark(name: string): void {
    const state = this._state();
    
    const bookmark = {
      name,
      filters: Object.fromEntries(state.filters),
      drillDownStack: this._drillDownStack(),
      timestamp: new Date()
    };
    
    this.bookmarkService.saveBookmark(state.config.id, bookmark)
      .subscribe(bookmarkId => {
        this._bookmarks.update(bookmarks => {
          const newBookmarks = new Map(bookmarks);
          newBookmarks.set(bookmarkId, bookmark);
          return newBookmarks;
        });
      });
  }

  /**
   * Load saved bookmark
   */
  private loadBookmark(bookmarkId: string): void {
    this.bookmarkService.loadBookmark(bookmarkId)
      .subscribe(bookmark => {
        // Restore filters
        this._state.update(state => ({
          ...state,
          filters: new Map(Object.entries(bookmark.filters))
        }));
        
        // Restore drill-down stack
        this._drillDownStack.set(bookmark.drillDownStack || []);
        
        // Refresh data with restored filters
        this.refreshAll();
      });
  }

  /**
   * Load data for a specific widget
   */
  private loadWidgetData(widget: DashboardWidget): Observable<any> {
    const state = this._state();
    const appliedFilters = this.getAppliedFilters(widget, state.filters);
    
    return this.dataConnector.loadData(widget.dataSource, appliedFilters);
  }

  /**
   * Get filters that apply to a specific widget
   */
  private getAppliedFilters(widget: DashboardWidget, allFilters: Map<string, any>): Record<string, any> {
    const widgetFilters = widget.filters || [];
    const applied: Record<string, any> = {};
    
    widgetFilters.forEach(filterId => {
      const value = allFilters.get(filterId);
      if (value !== undefined) {
        applied[filterId] = value;
      }
    });
    
    return applied;
  }

  /**
   * Check if widget matches current filters
   */
  private matchesFilters(widget: DashboardWidget, filters: Map<string, any>): boolean {
    const widgetFilters = widget.filters || [];
    
    return widgetFilters.every(filterId => {
      const filter = this._state().config.filters?.find(f => f.id === filterId);
      const value = filters.get(filterId);
      
      // If filter is required and has no value, widget doesn't match
      if (filter?.required && (value === undefined || value === null || value === '')) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Initialize filter values from configuration
   */
  private initializeFilters(filters: DashboardFilter[]): Map<string, any> {
    const filterMap = new Map();
    
    filters.forEach(filter => {
      filterMap.set(filter.id, filter.defaultValue);
    });
    
    return filterMap;
  }

  /**
   * Refresh widgets affected by a specific filter
   */
  private refreshFilteredWidgets(filterId: string): void {
    const state = this._state();
    const affectedWidgets = state.config.widgets?.filter(widget => 
      widget.filters?.includes(filterId)
    ) || [];
    
    affectedWidgets.forEach(widget => {
      this.refreshWidget(widget.id);
    });
  }

  /**
   * Set loading state for a widget
   */
  private setLoading(widgetId: string, loading: boolean): void {
    this._state.update(state => {
      const newLoading = new Set(state.loading);
      
      if (loading) {
        newLoading.add(widgetId);
      } else {
        newLoading.delete(widgetId);
      }
      
      return {
        ...state,
        loading: newLoading
      };
    });
  }

  /**
   * Setup automatic refresh based on configuration
   */
  private setupAutoRefresh(): void {
    effect(() => {
      const config = this._state().config;
      
      if (config.refreshInterval && config.refreshInterval > 0) {
        const subscription = timer(0, config.refreshInterval * 1000)
          .subscribe(() => {
            this.refreshAll();
          });
        
        return () => subscription.unsubscribe();
      }
      
      return () => {};
    });
  }

  /**
   * Setup real-time updates via WebSocket
   */
  private setupRealTimeUpdates(): void {
    const config = this._state().config;
    
    config.widgets?.forEach(widget => {
      if (widget.dataSource.type === 'websocket') {
        this.dataConnector.subscribeToRealTime(widget.dataSource)
          .subscribe(data => {
            this._state.update(state => {
              const newData = new Map(state.data);
              newData.set(widget.id, data);
              
              return {
                ...state,
                data: newData,
                lastRefresh: new Date()
              };
            });
          });
      }
    });
  }

  /**
   * Navigate to different dashboard
   */
  private navigateToDashboard(dashboardId: string): void {
    // Implementation depends on routing strategy
    console.log(`Navigating to dashboard: ${dashboardId}`);
  }

  /**
   * Clear drill-down specific filters
   */
  private clearDrillDownFilters(): void {
    // Implementation to remove drill-down applied filters
    // This would depend on how drill-down filters are tracked
  }

  /**
   * Get dashboard context for components
   */
  getContext(): DashboardContext {
    return {
      state: this.state,
      actions: this.actions
    };
  }
}