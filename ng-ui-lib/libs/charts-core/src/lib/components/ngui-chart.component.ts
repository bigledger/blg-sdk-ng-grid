/**
 * NgUI Chart Component - Standardized chart component following NgUI conventions
 */

import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { 
  NgUiChartConfig, 
  NgUiChartDataset, 
  NgUiChartEvent,
  NgUiChartClickEvent,
  NgUiChartHoverEvent,
  NgUiChartZoomEvent,
  NgUiChartSelectionEvent,
  NgUiExportFormat,
  NgUiTheme,
  NgUiA11yConfig,
  NgUiResponsiveConfig
} from '@ng-ui/common';

/**
 * NgUI Chart Component - A high-performance charting component for Angular applications
 * 
 * @example
 * ```html
 * <ngui-chart 
 *   [config]="chartConfig" 
 *   [data]="chartData"
 *   (ngUiChartClick)="onChartClick($event)"
 *   (ngUiChartHover)="onChartHover($event)">
 * </ngui-chart>
 * ```
 * 
 * @see {@link NgUiChartConfig} for configuration options
 * @since 1.0.0
 */
@Component({
  selector: 'ngui-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #chartContainer 
      class="ngui-chart"
      [class.ngui-chart-loading]="isLoading()"
      [class.ngui-chart-error]="hasError()"
      [class.disabled]="disabled()"
      [style.width.px]="dimensions().width"
      [style.height.px]="dimensions().height"
      [attr.role]="accessibility().enabled ? 'img' : null"
      [attr.aria-label]="ariaLabel() || accessibility().ariaLabel"
      [attr.aria-describedby]="accessibility().description ? chartId + '-description' : null">
      
      <!-- Chart title -->
      @if (config().title) {
        <div class="ngui-chart-title">{{ config().title!.text }}</div>
      }
      
      <!-- Chart render container -->
      <div #renderContainer class="ngui-chart-render-container"></div>
      
      <!-- Legend -->
      @if (config().legend?.visible) {
        <div class="ngui-chart-legend"></div>
      }
      
      <!-- Loading indicator -->
      @if (isLoading()) {
        <div class="ngui-chart-loading-overlay">
          <div class="ngui-loading-spinner"></div>
          <span>Loading chart...</span>
        </div>
      }
      
      <!-- Error display -->
      @if (hasError()) {
        <div class="ngui-chart-error-overlay">
          <div class="ngui-error-icon">⚠</div>
          <span>{{ errorMessage() }}</span>
        </div>
      }
      
      <!-- Accessibility description -->
      @if (accessibility().description) {
        <div [id]="chartId + '-description'" class="sr-only">
          {{ accessibility().description }}
        </div>
      }
    </div>
  `,
  styleUrls: ['./ngui-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngui-chart-host',
    '[class.ngui-theme-dark]': 'theme() === "dark"',
    '[class.ngui-theme-light]': 'theme() === "light"',
    '[attr.data-chart-type]': 'config().type'
  }
})
export class NgUiChartComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // ============================================================================
  // STANDARD INPUTS (Following NgUI convention)
  // ============================================================================
  
  /** Chart configuration object */
  config = input.required<NgUiChartConfig>();
  
  /** Chart data */
  data = input<NgUiChartDataset[]>([]);
  
  /** Theme */
  theme = input<NgUiTheme>('light');
  
  /** Accessibility label */
  ariaLabel = input<string>();
  
  /** Disabled state */
  disabled = input<boolean>(false);
  
  // ============================================================================
  // STANDARD OUTPUTS (Following NgUI convention)
  // ============================================================================
  
  /** Component ready */
  ready = output<void>();
  
  /** Data/state changes */
  change = output<NgUiChartDataset[]>();
  
  /** Errors */
  error = output<Error>();
  
  /** Focus events */
  focus = output<FocusEvent>();
  blur = output<FocusEvent>();
  
  // ============================================================================
  // COMPONENT-SPECIFIC OUTPUTS (Following NgUI convention)
  // ============================================================================
  
  /** Chart click events */
  ngUiChartClick = output<NgUiChartClickEvent>();
  
  /** Chart hover events */
  ngUiChartHover = output<NgUiChartHoverEvent>();
  
  /** Chart zoom events */
  ngUiChartZoom = output<NgUiChartZoomEvent>();
  
  /** Chart selection events */
  ngUiChartSelection = output<NgUiChartSelectionEvent>();
  
  /** Generic chart events */
  ngUiChartEvent = output<NgUiChartEvent>();
  
  // ============================================================================
  // TEMPLATE REFERENCES
  // ============================================================================
  
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLElement>;
  @ViewChild('renderContainer', { static: true }) renderContainer!: ElementRef<HTMLElement>;
  
  // ============================================================================
  // INTERNAL STATE SIGNALS
  // ============================================================================
  
  private readonly isLoading = signal<boolean>(false);
  private readonly hasError = signal<boolean>(false);
  private readonly errorMessage = signal<string>('');
  private readonly isInitialized = signal<boolean>(false);
  
  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  /** Computed dimensions */
  readonly dimensions = computed(() => {
    const config = this.config();
    return config.dimensions;
  });
  
  /** Computed accessibility settings */
  readonly accessibility = computed((): NgUiA11yConfig => ({
    enabled: this.config().accessibility?.enabled !== false,
    ariaLabel: this.config().accessibility?.ariaLabel || `${this.config().type} chart`,
    description: this.config().accessibility?.description,
    keyboardNavigation: this.config().accessibility?.keyboardNavigation !== false,
    highContrast: this.config().accessibility?.highContrast || false
  }));
  
  /** Computed responsive settings */
  readonly responsive = computed((): NgUiResponsiveConfig => ({
    enabled: this.config().responsive !== false,
    ...this.config().responsive
  }));
  
  // ============================================================================
  // PRIVATE PROPERTIES
  // ============================================================================
  
  private readonly chartId = `ngui-chart-${Math.random().toString(36).substr(2, 9)}`;
  private readonly elementRef = inject(ElementRef);
  
  // ============================================================================
  // CONSTRUCTOR & EFFECTS
  // ============================================================================
  
  constructor() {
    // Effect to handle config changes
    effect(() => {
      const config = this.config();
      if (this.isInitialized()) {
        this.updateChart();
      }
    });
    
    // Effect to handle data changes
    effect(() => {
      const data = this.data();
      if (this.isInitialized()) {
        this.updateData();
        this.change.emit(data);
      }
    });
  }
  
  // ============================================================================
  // LIFECYCLE METHODS
  // ============================================================================
  
  ngOnInit(): void {
    this.initializeChart();
  }
  
  ngAfterViewInit(): void {
    this.setupChart();
    this.isInitialized.set(true);
    this.ready.emit();
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  // ============================================================================
  // STANDARD METHODS (Following NgUI convention)
  // ============================================================================
  
  /**
   * Export chart in specified format
   */
  async export(format: NgUiExportFormat): Promise<void> {
    try {
      // Implementation would go here
      console.log(`Exporting chart as ${format}`);
    } catch (err) {
      this.error.emit(err as Error);
      throw err;
    }
  }
  
  /**
   * Refresh chart data and rendering
   */
  refresh(): void {
    if (this.isInitialized()) {
      this.updateChart();
    }
  }
  
  /**
   * Reset chart to initial state
   */
  reset(): void {
    // Reset implementation
    this.hasError.set(false);
    this.errorMessage.set('');
    this.refresh();
  }
  
  /**
   * Destroy chart and cleanup resources
   */
  destroy(): void {
    this.cleanup();
  }
  
  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  
  private initializeChart(): void {
    // Chart initialization logic
  }
  
  private setupChart(): void {
    // Chart setup logic
  }
  
  private updateChart(): void {
    // Chart update logic
  }
  
  private updateData(): void {
    // Data update logic
  }
  
  private cleanup(): void {
    // Cleanup logic
  }
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  private handleChartClick(event: any): void {
    const clickEvent: NgUiChartClickEvent = {
      type: 'ngUiChartClick',
      data: event.data,
      datasetIndex: event.datasetIndex,
      pointIndex: event.pointIndex,
      coordinates: event.coordinates,
      timestamp: Date.now()
    };
    
    this.ngUiChartClick.emit(clickEvent);
    this.ngUiChartEvent.emit(clickEvent);
  }
  
  private handleChartHover(event: any): void {
    const hoverEvent: NgUiChartHoverEvent = {
      type: 'ngUiChartHover',
      data: event.data,
      datasetIndex: event.datasetIndex,
      pointIndex: event.pointIndex,
      coordinates: event.coordinates,
      timestamp: Date.now()
    };
    
    this.ngUiChartHover.emit(hoverEvent);
    this.ngUiChartEvent.emit(hoverEvent);
  }
  
  private handleChartZoom(domain: any): void {
    const zoomEvent: NgUiChartZoomEvent = {
      type: 'ngUiChartZoom',
      domain,
      timestamp: Date.now()
    };
    
    this.ngUiChartZoom.emit(zoomEvent);
    this.ngUiChartEvent.emit(zoomEvent);
  }
  
  private handleChartSelection(selection: any[]): void {
    const selectionEvent: NgUiChartSelectionEvent = {
      type: 'ngUiChartSelection',
      selection,
      timestamp: Date.now()
    };
    
    this.ngUiChartSelection.emit(selectionEvent);
    this.ngUiChartEvent.emit(selectionEvent);
  }
}