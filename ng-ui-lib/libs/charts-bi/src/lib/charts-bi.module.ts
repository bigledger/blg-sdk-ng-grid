import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Services
import { DashboardService } from './services/dashboard.service';
import { DataConnectorService } from './services/data-connector.service';
import { KPIService } from './services/kpi.service';
import { AnalyticsService } from './services/analytics.service';
import { PivotService } from './services/pivot.service';
import { ExportService } from './services/export.service';
import { BookmarkService } from './services/bookmark.service';

/**
 * BigLedger Charts Business Intelligence Module
 * 
 * This module provides comprehensive BI capabilities including:
 * - Interactive dashboards with drag-and-drop
 * - Real-time data visualization
 * - Advanced analytics and predictions
 * - KPI monitoring and scorecards
 * - Pivot tables and data exploration
 * - Cross-chart filtering and drill-down
 * - Export and reporting features
 * - Collaborative bookmarks and annotations
 * 
 * @example
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { ChartsBIModule } from '@ng-ui/charts-bi';
 * 
 * @NgModule({
 *   imports: [ChartsBIModule],
 *   // ...
 * })
 * export class AppModule {}
 * ```
 * 
 * @example
 * ```html
 * <ng-bi-dashboard
 *   [dashboardConfig]="dashboardConfig"
 *   [allowEdit]="true"
 *   (widgetDrillDown)="onDrillDown($event)"
 *   (dashboardChange)="onDashboardChange($event)">
 * </ng-bi-dashboard>
 * ```
 */
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    // Import standalone components
    DashboardComponent
  ],
  providers: [
    DashboardService,
    DataConnectorService,
    KPIService,
    AnalyticsService,
    PivotService,
    ExportService,
    BookmarkService
  ],
  exports: [
    // Export standalone components for use in other modules
    DashboardComponent
  ]
})
export class ChartsBIModule {
  
  /**
   * Configure the module with custom settings
   * 
   * @example
   * ```typescript
   * import { ChartsBIModule } from '@ng-ui/charts-bi';
   * 
   * @NgModule({
   *   imports: [
   *     ChartsBIModule.forRoot({
   *       apiUrl: 'https://api.example.com',
   *       enableAnalytics: true,
   *       cacheTimeout: 300000
   *     })
   *   ]
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(config?: ChartsBIConfig): ModuleWithProviders<ChartsBIModule> {
    return {
      ngModule: ChartsBIModule,
      providers: [
        {
          provide: CHARTS_BI_CONFIG,
          useValue: config || {}
        }
      ]
    };
  }
}

/**
 * Configuration interface for Charts BI module
 */
export interface ChartsBIConfig {
  /**
   * Base API URL for data connections
   */
  apiUrl?: string;

  /**
   * Enable advanced analytics features
   */
  enableAnalytics?: boolean;

  /**
   * Enable real-time features via WebSocket
   */
  enableRealTime?: boolean;

  /**
   * Cache timeout in milliseconds
   */
  cacheTimeout?: number;

  /**
   * Default theme for components
   */
  theme?: 'light' | 'dark' | 'auto';

  /**
   * Export service configuration
   */
  export?: {
    formats?: ('pdf' | 'excel' | 'csv' | 'json' | 'png' | 'svg')[];
    includeWatermark?: boolean;
    author?: string;
  };

  /**
   * Authentication configuration
   */
  auth?: {
    enabled: boolean;
    provider: 'jwt' | 'oauth2' | 'custom';
    config: any;
  };
}

/**
 * Injection token for Charts BI configuration
 */
export const CHARTS_BI_CONFIG = new InjectionToken<ChartsBIConfig>('charts-bi-config');

// Re-export for convenience
export { 
  DashboardComponent,
  DashboardService,
  DataConnectorService,
  KPIService,
  AnalyticsService,
  PivotService,
  ExportService,
  BookmarkService
};

// Re-export interfaces
export type {
  DashboardConfig,
  DashboardWidget,
  DashboardFilter,
  DashboardContext,
  DashboardActions,
  ExportFormat
} from './interfaces/dashboard.interface';

export type {
  KPIConfig,
  KPIData,
  ScorecardConfig
} from './interfaces/kpi.interface';

export type {
  PivotTableConfig,
  PivotTableData
} from './interfaces/pivot.interface';

export type {
  PredictiveAnalyticsConfig,
  AnomalyDetectionConfig,
  TrendAnalysisConfig,
  AnalyticsResult,
  AnalyticsInsight
} from './interfaces/analytics.interface';