/**
 * Base Chart Component - Core chart lifecycle management and rendering
 */

import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  input,
  output,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  inject,
  Renderer2,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject, merge } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';

import { ChartConfig, ChartDataset, ChartEvents, ChartEventHandler } from '../interfaces';
import { ChartRenderer } from '../renderers/chart-renderer';
import { DataProcessor } from '../services/data-processor.service';
import { EventManager } from '../services/event-manager.service';
import { ThemeManager } from '../services/theme-manager.service';
import { AnimationController } from '../services/animation-controller.service';
import { ChartState } from '../services/chart-state.service';

/**
 * Base chart component providing core functionality for all chart types
 */
@Component({
  selector: 'ngui-base-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #chartContainer 
      class="blg-chart-container"
      [style.width.px]="computedDimensions().width"
      [style.height.px]="computedDimensions().height"
      [attr.role]="accessibility().enabled ? 'img' : null"
      [attr.aria-label]="accessibility().ariaLabel"
      [attr.aria-describedby]="accessibility().description ? chartId + '-description' : null">
      
      <!-- Chart title -->
      @if (config().title) {
        <div 
          class="blg-chart-title"
          [style.text-align]="config().title!.align || 'center'"
          [ngStyle]="config().title!.style">
          {{ config().title!.text }}
        </div>
      }
      
      <!-- Chart subtitle -->
      @if (config().subtitle) {
        <div 
          class="blg-chart-subtitle"
          [style.text-align]="config().subtitle!.align || 'center'"
          [ngStyle]="config().subtitle!.style">
          {{ config().subtitle!.text }}
        </div>
      }
      
      <!-- Main chart canvas/svg container -->
      <div #renderContainer class="blg-chart-render-container"></div>
      
      <!-- Legend -->
      @if (config().legend?.visible) {
        <div 
          class="blg-chart-legend"
          [class]="'blg-legend-' + (config().legend!.position || 'bottom')"
          #legendContainer>
        </div>
      }
      
      <!-- Tooltip -->
      <div 
        #tooltipContainer
        class="blg-chart-tooltip"
        [style.display]="tooltipVisible() ? 'block' : 'none'"
        [ngStyle]="tooltipStyle()">
        <div [innerHTML]="tooltipContent()"></div>
      </div>
      
      <!-- Accessibility description -->
      @if (accessibility().description) {
        <div 
          [id]="chartId + '-description'"
          class="sr-only">
          {{ accessibility().description }}
        </div>
      }
      
      <!-- Loading indicator -->
      @if (isLoading()) {
        <div class="blg-chart-loading">
          <div class="blg-loading-spinner"></div>
          <span>Loading chart...</span>
        </div>
      }
      
      <!-- Error display -->
      @if (error()) {
        <div class="blg-chart-error">
          <div class="blg-error-icon">⚠</div>
          <span>{{ error() }}</span>
        </div>
      }
    </div>
  `,
  styleUrls: ['./base-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'blg-chart',
    '[class]': 'chartClasses()',
    '[attr.data-chart-type]': 'config().type',
    '[attr.data-render-engine]': 'config().renderEngine'
  }
})
export class NgUiBaseChartComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  // Injected services
  private readonly renderer = inject(Renderer2);
  private readonly ngZone = inject(NgZone);
  private readonly elementRef = inject(ElementRef);
  
  // Core services
  protected readonly dataProcessor = inject(DataProcessor);
  protected readonly eventManager = inject(EventManager);
  protected readonly themeManager = inject(ThemeManager);
  protected readonly animationController = inject(AnimationController);
  protected readonly chartState = inject(ChartState);
  
  // Template references
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLElement>;
  @ViewChild('renderContainer', { static: true }) renderContainer!: ElementRef<HTMLElement>;
  @ViewChild('tooltipContainer', { static: true }) tooltipContainer!: ElementRef<HTMLElement>;
  @ViewChild('legendContainer') legendContainer?: ElementRef<HTMLElement>;
  
  // Input signals
  readonly config = input.required<ChartConfig>();
  readonly data = input.required<ChartDataset>();
  readonly loading = input<boolean>(false);
  
  // Output events
  readonly chartReady = output<void>();
  readonly chartError = output<Error>();
  readonly dataChanged = output<ChartDataset>();
  readonly chartEvent = output<ChartEvents>();
  
  // Internal state signals
  protected readonly isLoading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly tooltipVisible = signal<boolean>(false);
  protected readonly tooltipContent = signal<string>('');
  protected readonly tooltipStyle = signal<Record<string, any>>({});
  protected readonly isInitialized = signal<boolean>(false);
  
  // Computed properties
  protected readonly computedDimensions = computed(() => {
    const config = this.config();
    const responsive = config.responsive !== false;
    
    if (responsive && this.isInitialized()) {
      const container = this.chartContainer?.nativeElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        if (config.maintainAspectRatio !== false) {
          const aspectRatio = config.dimensions.width / config.dimensions.height;
          const height = containerWidth / aspectRatio;
          return { width: containerWidth, height };
        }
        
        return { 
          width: containerWidth || config.dimensions.width, 
          height: containerHeight || config.dimensions.height 
        };
      }
    }
    
    return config.dimensions;
  });
  
  protected readonly accessibility = computed(() => ({
    enabled: this.config().accessibility?.enabled !== false,
    description: this.config().accessibility?.description,
    ariaLabel: this.config().accessibility?.ariaLabel || `${this.config().type} chart`,
    keyboardNavigation: this.config().accessibility?.keyboardNavigation !== false,
    highContrast: this.config().accessibility?.highContrast || false
  }));
  
  protected readonly chartClasses = computed(() => {
    const classes = ['blg-chart'];
    const config = this.config();
    
    classes.push(`blg-chart-${config.type}`);
    classes.push(`blg-render-${config.renderEngine}`);
    
    if (config.theme) {
      const themeName = typeof config.theme === 'string' ? config.theme : config.theme.name;
      classes.push(`blg-theme-${themeName}`);
    }
    
    if (this.accessibility().highContrast) {
      classes.push('blg-high-contrast');
    }
    
    if (this.isLoading()) {
      classes.push('blg-loading');
    }
    
    if (this.error()) {
      classes.push('blg-error');
    }
    
    return classes.join(' ');
  });
  
  // Chart renderer instance
  protected chartRenderer!: ChartRenderer;
  
  // Unique chart ID
  protected readonly chartId = `blg-chart-${Math.random().toString(36).substr(2, 9)}`;
  
  // Resize observer
  private resizeObserver?: ResizeObserver;
  
  // Cleanup subject
  private readonly destroy$ = new Subject<void>();
  
  constructor() {
    // React to configuration changes
    effect(() => {
      const config = this.config();
      if (this.isInitialized() && this.chartRenderer) {
        this.updateChart();
      }
    });
    
    // React to data changes
    effect(() => {
      const data = this.data();
      if (this.isInitialized() && this.chartRenderer) {
        this.updateData();
      }
    });
    
    // React to loading state
    effect(() => {
      this.isLoading.set(this.loading());
    });
  }
  
  ngOnInit(): void {
    // Initialize chart state
    this.chartState.initialize(this.config(), this.data());
    
    // Apply theme
    this.applyTheme();
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      // Initialize chart renderer
      this.initializeRenderer();
      
      // Setup resize handling
      this.setupResizeHandling();
      
      // Mark as initialized
      this.isInitialized.set(true);
      
      // Initial render
      this.renderChart();
      
      // Emit ready event
      this.ngZone.run(() => {
        this.chartReady.emit();
      });
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInitialized()) {
      if (changes['config']) {
        this.updateChart();
      }
      
      if (changes['data']) {
        this.updateData();
      }
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Cleanup renderer
    if (this.chartRenderer) {
      this.chartRenderer.destroy();
    }
    
    // Cleanup resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Cleanup event manager
    this.eventManager.destroy();
    
    // Cleanup animation controller
    this.animationController.destroy();
  }
  
  /**
   * Initialize the chart renderer based on configuration
   */
  private initializeRenderer(): void {
    try {
      const config = this.config();
      const container = this.renderContainer.nativeElement;
      
      this.chartRenderer = new ChartRenderer(config.renderEngine, container);
      this.chartRenderer.initialize(this.computedDimensions());
      
      // Setup renderer event forwarding
      this.chartRenderer.events$
        .pipe(takeUntilDestroyed())
        .subscribe(event => {
          this.ngZone.run(() => {
            this.chartEvent.emit(event);
          });
        });
        
    } catch (error) {
      this.handleError(error as Error);
    }
  }
  
  /**
   * Setup resize handling for responsive charts
   */
  private setupResizeHandling(): void {
    if (this.config().responsive !== false && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(
        debounceTime(100)(() => {
          this.ngZone.run(() => {
            this.handleResize();
          });
        })
      );
      
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
    
    // Fallback for older browsers
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(250),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.handleResize();
        });
      });
  }
  
  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Mouse events
    merge(
      fromEvent<MouseEvent>(this.chartContainer.nativeElement, 'click'),
      fromEvent<MouseEvent>(this.chartContainer.nativeElement, 'mousemove'),
      fromEvent<MouseEvent>(this.chartContainer.nativeElement, 'mouseleave')
    )
    .pipe(
      throttleTime(16), // ~60fps
      takeUntilDestroyed()
    )
    .subscribe(event => {
      this.handleMouseEvent(event);
    });
    
    // Keyboard events (for accessibility)
    if (this.accessibility().keyboardNavigation) {
      fromEvent<KeyboardEvent>(this.chartContainer.nativeElement, 'keydown')
        .pipe(takeUntilDestroyed())
        .subscribe(event => {
          this.handleKeyboardEvent(event);
        });
    }
  }
  
  /**
   * Apply theme configuration
   */
  private applyTheme(): void {
    const config = this.config();
    if (config.theme) {
      this.themeManager.applyTheme(config.theme, this.chartContainer.nativeElement);
    }
  }
  
  /**
   * Render the chart
   */
  protected renderChart(): void {
    if (!this.chartRenderer || this.isLoading()) {
      return;
    }
    
    try {
      const processedData = this.dataProcessor.processData(this.data(), this.config());
      this.chartRenderer.render(processedData, this.config());
      this.error.set(null);
    } catch (error) {
      this.handleError(error as Error);
    }
  }
  
  /**
   * Update chart configuration
   */
  protected updateChart(): void {
    if (!this.chartRenderer) {
      return;
    }
    
    this.applyTheme();
    this.renderChart();
  }
  
  /**
   * Update chart data
   */
  protected updateData(): void {
    if (!this.chartRenderer) {
      return;
    }
    
    const config = this.config();
    const animated = config.animation?.enabled !== false;
    
    if (animated) {
      this.animateDataUpdate();
    } else {
      this.renderChart();
    }
    
    this.dataChanged.emit(this.data());
  }
  
  /**
   * Animate data updates
   */
  private animateDataUpdate(): void {
    const config = this.config();
    const duration = config.animation?.duration || 750;
    
    this.animationController.animateDataUpdate(
      this.chartRenderer,
      this.data(),
      duration,
      () => {
        this.renderChart();
      }
    );
  }
  
  /**
   * Handle resize events
   */
  private handleResize(): void {
    if (!this.chartRenderer) {
      return;
    }
    
    const newDimensions = this.computedDimensions();
    this.chartRenderer.resize(newDimensions);
    this.renderChart();
  }
  
  /**
   * Handle mouse events
   */
  private handleMouseEvent(event: MouseEvent): void {
    if (!this.chartRenderer) {
      return;
    }
    
    this.eventManager.handleMouseEvent(event, this.chartRenderer);
  }
  
  /**
   * Handle keyboard events
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.chartRenderer) {
      return;
    }
    
    this.eventManager.handleKeyboardEvent(event, this.chartRenderer);
  }
  
  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('Chart error:', error);
    this.error.set(error.message);
    this.chartError.emit(error);
  }
  
  /**
   * Public API methods
   */
  
  /**
   * Export chart as image
   */
  public exportChart(format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png'): Promise<string | Blob> {
    if (!this.chartRenderer) {
      throw new Error('Chart not initialized');
    }
    
    return this.chartRenderer.export(format);
  }
  
  /**
   * Update chart data programmatically
   */
  public updateChartData(newData: ChartDataset, animated = true): void {
    // This would be handled by the parent component updating the data input
    // but we provide this method for programmatic updates
    this.dataChanged.emit(newData);
  }
  
  /**
   * Add event listener
   */
  public addEventListener<T extends ChartEvents>(
    event: T['type'],
    handler: ChartEventHandler<T>
  ): void {
    this.eventManager.addEventListener(event, handler);
  }
  
  /**
   * Remove event listener
   */
  public removeEventListener<T extends ChartEvents>(
    event: T['type'],
    handler: ChartEventHandler<T>
  ): void {
    this.eventManager.removeEventListener(event, handler);
  }
  
  /**
   * Get chart data at coordinates
   */
  public getDataAtPoint(x: number, y: number): any {
    if (!this.chartRenderer) {
      return null;
    }
    
    return this.chartRenderer.getDataAtPoint(x, y);
  }
  
  /**
   * Zoom to specific domain
   */
  public zoomTo(domain: { x?: [any, any]; y?: [any, any] }, animated = true): void {
    if (!this.chartRenderer) {
      return;
    }
    
    if (animated) {
      this.animationController.animateZoom(this.chartRenderer, domain);
    } else {
      this.chartRenderer.setDomain(domain);
    }
  }
  
  /**
   * Reset zoom to original domain
   */
  public resetZoom(animated = true): void {
    if (!this.chartRenderer) {
      return;
    }
    
    const originalDomain = this.chartState.getOriginalDomain();
    this.zoomTo(originalDomain, animated);
  }
  
  /**
   * Show tooltip at coordinates
   */
  public showTooltip(content: string, x: number, y: number): void {
    this.tooltipContent.set(content);
    this.tooltipStyle.set({
      left: `${x}px`,
      top: `${y}px`,
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1000
    });
    this.tooltipVisible.set(true);
  }
  
  /**
   * Hide tooltip
   */
  public hideTooltip(): void {
    this.tooltipVisible.set(false);
  }
}

// Utility function for debounced callbacks
function debounceTime<T extends (...args: any[]) => any>(delay: number) {
  return (fn: T): T => {
    let timeoutId: number | undefined;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), delay);
    }) as T;
  };
}