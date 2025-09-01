/**
 * Line Chart Component - Multi-series line chart with full feature support
 */

import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { 
  BaseChartComponent,
  ChartConfig,
  ChartDataset,
  ChartType,
  RenderEngine,
  ScaleType,
  InterpolationType,
  LegendPosition
} from '@ng-ui/charts-core';

/**
 * Line chart configuration interface
 */
export interface LineChartConfig extends Omit<ChartConfig, 'type'> {
  type: ChartType.LINE;
  line?: {
    interpolation?: InterpolationType;
    strokeWidth?: number;
    tension?: number;
    showPoints?: boolean;
    pointRadius?: number;
    smoothing?: boolean;
  };
  zoom?: {
    enabled?: boolean;
    type?: 'x' | 'y' | 'xy';
    wheel?: boolean;
    drag?: boolean;
  };
  pan?: {
    enabled?: boolean;
    type?: 'x' | 'y' | 'xy';
    button?: number;
  };
}

/**
 * Line Chart Component with multiple series support
 */
@Component({
  selector: 'blg-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartComponent],
  template: `
    <blg-base-chart
      [config]="chartConfig()"
      [data]="data()"
      [loading]="loading()"
      (chartReady)="chartReady.emit()"
      (chartError)="chartError.emit($event)"
      (dataChanged)="dataChanged.emit($event)"
      (chartEvent)="chartEvent.emit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'blg-line-chart',
    '[attr.data-series-count]': 'data().series.length',
    '[attr.data-interactive]': 'chartConfig().interaction ? "true" : "false"'
  }
})
export class LineChartComponent {
  
  // Input signals
  readonly data = input.required<ChartDataset>();
  readonly config = input<Partial<LineChartConfig>>({});
  readonly loading = input<boolean>(false);
  
  // Output events
  readonly chartReady = output<void>();
  readonly chartError = output<Error>();
  readonly dataChanged = output<ChartDataset>();
  readonly chartEvent = output<any>();
  
  // Computed chart configuration
  readonly chartConfig = computed((): LineChartConfig => {
    const baseConfig = this.createDefaultConfig();
    const userConfig = this.config();
    
    return {
      ...baseConfig,
      ...userConfig,
      type: ChartType.LINE,
      // Merge nested objects properly
      dimensions: {
        ...baseConfig.dimensions,
        ...userConfig.dimensions
      },
      axes: userConfig.axes || baseConfig.axes,
      legend: {
        ...baseConfig.legend,
        ...userConfig.legend
      },
      tooltip: {
        ...baseConfig.tooltip,
        ...userConfig.tooltip
      },
      animation: {
        ...baseConfig.animation,
        ...userConfig.animation
      },
      interaction: {
        ...baseConfig.interaction,
        ...userConfig.interaction
      },
      line: {
        ...baseConfig.line,
        ...userConfig.line
      }
    };
  });
  
  /**
   * Create default line chart configuration
   */
  private createDefaultConfig(): LineChartConfig {
    return {
      type: ChartType.LINE,
      renderEngine: RenderEngine.SVG,
      
      dimensions: {
        width: 800,
        height: 400,
        margin: {
          top: 20,
          right: 30,
          bottom: 50,
          left: 60
        }
      },
      
      axes: [
        {
          id: 'x-axis',
          type: ScaleType.LINEAR,
          position: 'bottom',
          label: 'X Axis',
          visible: true,
          gridLines: true,
          tickCount: 8
        },
        {
          id: 'y-axis',
          type: ScaleType.LINEAR,
          position: 'left',
          label: 'Y Axis',
          visible: true,
          gridLines: true,
          tickCount: 6
        }
      ],
      
      legend: {
        visible: true,
        position: LegendPosition.TOP,
        orientation: 'horizontal',
        align: 'center',
        spacing: 12,
        interactive: true
      },
      
      tooltip: {
        enabled: true,
        trigger: 'hover' as any,
        followCursor: true,
        formatter: (data: any) => {
          return `
            <div class="tooltip-content">
              <div class="tooltip-title">${data.series?.name || 'Series'}</div>
              <div class="tooltip-value">
                <span class="tooltip-label">X:</span> ${data.value?.x || 'N/A'}
              </div>
              <div class="tooltip-value">
                <span class="tooltip-label">Y:</span> ${data.value?.y || 'N/A'}
              </div>
            </div>
          `;
        }
      },
      
      animation: {
        enabled: true,
        duration: 750,
        easing: 'ease-out' as any,
        stagger: 50
      },
      
      interaction: {
        zoom: {
          enabled: true,
          type: 'xy',
          wheel: true,
          drag: true
        },
        pan: {
          enabled: true,
          type: 'xy',
          button: 1
        },
        hover: {
          enabled: true,
          highlightSeries: true,
          highlightPoint: true
        },
        selection: {
          enabled: true,
          multiple: false,
          clearOnOutsideClick: true
        }
      },
      
      line: {
        interpolation: InterpolationType.LINEAR,
        strokeWidth: 2,
        tension: 0.4,
        showPoints: true,
        pointRadius: 3,
        smoothing: false
      },
      
      export: {
        enabled: true,
        formats: ['png', 'svg', 'jpg'],
        filename: 'line-chart'
      },
      
      accessibility: {
        enabled: true,
        description: 'Interactive line chart with multiple data series',
        ariaLabel: 'Line chart',
        keyboardNavigation: true
      },
      
      responsive: true,
      maintainAspectRatio: false,
      
      colors: [
        '#1f77b4', // Blue
        '#ff7f0e', // Orange  
        '#2ca02c', // Green
        '#d62728', // Red
        '#9467bd', // Purple
        '#8c564b', // Brown
        '#e377c2', // Pink
        '#7f7f7f', // Gray
        '#bcbd22', // Olive
        '#17becf'  // Cyan
      ]
    };
  }
}

/**
 * Line chart factory function for programmatic creation
 */
export function createLineChart(
  container: HTMLElement,
  data: ChartDataset,
  config?: Partial<LineChartConfig>
): LineChartComponent {
  const chart = new LineChartComponent();
  
  // This would need proper initialization in a real implementation
  // For now, this serves as documentation of the intended API
  
  return chart;
}

/**
 * Line chart utilities
 */
export class LineChartUtils {
  
  /**
   * Create sample line chart data for testing
   */
  static createSampleData(seriesCount: number = 3, pointCount: number = 20): ChartDataset {
    const series: any[] = [];
    
    for (let s = 0; s < seriesCount; s++) {
      const data: any[] = [];
      
      for (let i = 0; i < pointCount; i++) {
        const x = i;
        const y = Math.sin((i + s) * 0.3) * 50 + Math.random() * 20 + (s * 30);
        
        data.push({ x, y });
      }
      
      series.push({
        id: `series-${s}`,
        name: `Series ${s + 1}`,
        data,
        visible: true,
        interpolation: InterpolationType.LINEAR
      });
    }
    
    return { series };
  }
  
  /**
   * Create time-series data
   */
  static createTimeSeriesData(
    startDate: Date,
    pointCount: number = 30,
    seriesCount: number = 2
  ): ChartDataset {
    const series: any[] = [];
    
    for (let s = 0; s < seriesCount; s++) {
      const data: any[] = [];
      
      for (let i = 0; i < pointCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const x = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const trend = i * 2; // Upward trend
        const seasonal = Math.sin(i * 0.2) * 10; // Seasonal variation
        const noise = (Math.random() - 0.5) * 20; // Random noise
        const y = 100 + (s * 50) + trend + seasonal + noise;
        
        data.push({ x, y: Math.round(y * 100) / 100 });
      }
      
      series.push({
        id: `timeseries-${s}`,
        name: `Metric ${s + 1}`,
        data,
        visible: true,
        interpolation: InterpolationType.MONOTONE
      });
    }
    
    return { 
      series,
      metadata: {
        type: 'timeseries',
        timeFormat: 'YYYY-MM-DD'
      }
    };
  }
  
  /**
   * Smooth line data using moving average
   */
  static smoothData(data: ChartDataset, windowSize: number = 3): ChartDataset {
    const smoothedSeries = data.series.map(series => {
      const smoothedData = series.data.map((point, index) => {
        const start = Math.max(0, index - Math.floor(windowSize / 2));
        const end = Math.min(series.data.length, index + Math.ceil(windowSize / 2));
        
        const window = series.data.slice(start, end);
        const sum = window.reduce((acc, p) => acc + Number(p.y), 0);
        const avg = sum / window.length;
        
        return { ...point, y: Math.round(avg * 100) / 100 };
      });
      
      return { ...series, data: smoothedData };
    });
    
    return { ...data, series: smoothedSeries };
  }
  
  /**
   * Add trend line to data
   */
  static addTrendLine(data: ChartDataset, seriesId: string): ChartDataset {
    const series = data.series.find(s => s.id === seriesId);
    if (!series) return data;
    
    // Calculate linear regression
    const n = series.data.length;
    const sumX = series.data.reduce((sum, point, index) => sum + index, 0);
    const sumY = series.data.reduce((sum, point) => sum + Number(point.y), 0);
    const sumXY = series.data.reduce((sum, point, index) => sum + (index * Number(point.y)), 0);
    const sumXX = series.data.reduce((sum, point, index) => sum + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Create trend line data
    const trendData = series.data.map((point, index) => ({
      x: point.x,
      y: Math.round((slope * index + intercept) * 100) / 100
    }));
    
    const trendSeries = {
      id: `${seriesId}-trend`,
      name: `${series.name} (Trend)`,
      data: trendData,
      visible: true,
      color: series.color,
      metadata: {
        type: 'trend',
        originalSeriesId: seriesId,
        slope,
        intercept
      }
    };
    
    return {
      ...data,
      series: [...data.series, trendSeries]
    };
  }
}