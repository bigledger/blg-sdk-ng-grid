/**
 * Bar Chart Component - Horizontal and vertical bar charts with stacking support
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
  StackType,
  LegendPosition
} from '@ng-ui/charts-core';

/**
 * Bar chart configuration interface
 */
export interface BarChartConfig extends Omit<ChartConfig, 'type'> {
  type: ChartType.BAR | ChartType.COLUMN;
  bar?: {
    orientation?: 'horizontal' | 'vertical';
    barWidth?: number;
    maxBarWidth?: number;
    categoryGap?: number;
    barGap?: number;
    stacking?: StackType;
    stackType?: 'normal' | 'percent';
    showValues?: boolean;
    valuePosition?: 'inside' | 'outside' | 'center';
    borderRadius?: number;
    gradient?: boolean;
  };
}

/**
 * Bar Chart Component supporting both horizontal and vertical orientations
 */
@Component({
  selector: 'blg-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartComponent],
  template: `
    <blg-base-chart
      [config]="chartConfig()"
      [data]="processedData()"
      [loading]="loading()"
      (chartReady)="chartReady.emit()"
      (chartError)="chartError.emit($event)"
      (dataChanged)="dataChanged.emit($event)"
      (chartEvent)="chartEvent.emit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'blg-bar-chart',
    '[attr.data-orientation]': 'chartConfig().bar?.orientation || "vertical"',
    '[attr.data-stacking]': 'chartConfig().bar?.stacking || "none"',
    '[attr.data-series-count]': 'data().series.length'
  }
})
export class BarChartComponent {
  
  // Input signals
  readonly data = input.required<ChartDataset>();
  readonly config = input<Partial<BarChartConfig>>({});
  readonly loading = input<boolean>(false);
  
  // Output events
  readonly chartReady = output<void>();
  readonly chartError = output<Error>();
  readonly dataChanged = output<ChartDataset>();
  readonly chartEvent = output<any>();
  
  // Computed processed data for stacking
  readonly processedData = computed((): ChartDataset => {
    const config = this.chartConfig();
    const rawData = this.data();
    
    if (config.bar?.stacking === StackType.NONE) {
      return rawData;
    }
    
    return this.applyStacking(rawData, config.bar?.stacking || StackType.NORMAL);
  });
  
  // Computed chart configuration
  readonly chartConfig = computed((): BarChartConfig => {
    const baseConfig = this.createDefaultConfig();
    const userConfig = this.config();
    
    // Determine chart type from orientation
    const orientation = userConfig.bar?.orientation || baseConfig.bar?.orientation || 'vertical';
    const chartType = orientation === 'horizontal' ? ChartType.BAR : ChartType.COLUMN;
    
    return {
      ...baseConfig,
      ...userConfig,
      type: chartType,
      // Merge nested objects properly
      dimensions: {
        ...baseConfig.dimensions,
        ...userConfig.dimensions
      },
      axes: this.createAxesConfig(orientation, userConfig.axes || baseConfig.axes),
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
      bar: {
        ...baseConfig.bar,
        ...userConfig.bar,
        orientation
      }
    };
  });
  
  /**
   * Create default bar chart configuration
   */
  private createDefaultConfig(): BarChartConfig {
    return {
      type: ChartType.COLUMN,
      renderEngine: RenderEngine.SVG,
      
      dimensions: {
        width: 800,
        height: 400,
        margin: {
          top: 20,
          right: 30,
          bottom: 60,
          left: 80
        }
      },
      
      axes: [], // Will be set by createAxesConfig
      
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
        formatter: (data: any) => {
          const value = data.value?.y || data.value;
          const category = data.value?.x || data.category;
          const seriesName = data.series?.name || 'Series';
          
          return `
            <div class="tooltip-content">
              <div class="tooltip-title">${seriesName}</div>
              <div class="tooltip-category">${category}</div>
              <div class="tooltip-value">
                <strong>${this.formatValue(value)}</strong>
              </div>
            </div>
          `;
        }
      },
      
      animation: {
        enabled: true,
        duration: 800,
        easing: 'ease-out' as any,
        stagger: 100
      },
      
      interaction: {
        hover: {
          enabled: true,
          highlightSeries: true
        },
        selection: {
          enabled: true,
          multiple: true,
          clearOnOutsideClick: true
        }
      },
      
      bar: {
        orientation: 'vertical',
        barWidth: 0.8,
        maxBarWidth: 50,
        categoryGap: 0.2,
        barGap: 0.1,
        stacking: StackType.NONE,
        showValues: false,
        valuePosition: 'outside',
        borderRadius: 2,
        gradient: false
      },
      
      export: {
        enabled: true,
        formats: ['png', 'svg', 'jpg'],
        filename: 'bar-chart'
      },
      
      accessibility: {
        enabled: true,
        description: 'Interactive bar chart showing categorical data',
        ariaLabel: 'Bar chart',
        keyboardNavigation: true
      },
      
      responsive: true,
      maintainAspectRatio: false,
      
      colors: [
        '#3498db', // Blue
        '#e74c3c', // Red
        '#2ecc71', // Green
        '#f39c12', // Orange
        '#9b59b6', // Purple
        '#1abc9c', // Turquoise
        '#34495e', // Dark Blue-Gray
        '#e67e22', // Carrot
        '#95a5a6', // Concrete
        '#f1c40f'  // Sunflower
      ]
    };
  }
  
  /**
   * Create axes configuration based on orientation
   */
  private createAxesConfig(orientation: string, existingAxes?: any[]): any[] {
    if (existingAxes && existingAxes.length > 0) {
      return existingAxes;
    }
    
    if (orientation === 'horizontal') {
      return [
        {
          id: 'x-axis',
          type: ScaleType.LINEAR,
          position: 'bottom',
          label: 'Values',
          visible: true,
          gridLines: true,
          tickCount: 8
        },
        {
          id: 'y-axis',
          type: ScaleType.BAND,
          position: 'left',
          label: 'Categories',
          visible: true,
          gridLines: false,
          tickCount: 10
        }
      ];
    } else {
      return [
        {
          id: 'x-axis',
          type: ScaleType.BAND,
          position: 'bottom',
          label: 'Categories',
          visible: true,
          gridLines: false,
          tickCount: 10
        },
        {
          id: 'y-axis',
          type: ScaleType.LINEAR,
          position: 'left',
          label: 'Values',
          visible: true,
          gridLines: true,
          tickCount: 6
        }
      ];
    }
  }
  
  /**
   * Apply stacking to data
   */
  private applyStacking(data: ChartDataset, stackType: StackType): ChartDataset {
    if (stackType === StackType.NONE) {
      return data;
    }
    
    const processedSeries = [...data.series];
    
    // Group series by stack ID
    const stackGroups = new Map<string, any[]>();
    processedSeries.forEach(series => {
      const stackId = series.stack || 'default';
      if (!stackGroups.has(stackId)) {
        stackGroups.set(stackId, []);
      }
      stackGroups.get(stackId)!.push(series);
    });
    
    // Apply stacking for each group
    stackGroups.forEach(stackSeries => {
      this.stackSeriesGroup(stackSeries, stackType);
    });
    
    return { ...data, series: processedSeries };
  }
  
  /**
   * Stack a group of series
   */
  private stackSeriesGroup(series: any[], stackType: StackType): void {
    if (series.length <= 1) return;
    
    // Get all unique categories
    const categories = new Set<string>();
    series.forEach(s => {
      s.data.forEach((point: any) => {
        categories.add(point.x);
      });
    });
    
    // Apply stacking for each category
    Array.from(categories).forEach(category => {
      let cumulativeValue = 0;
      let totalValue = 0;
      
      // Calculate total for percentage stacking
      if (stackType === StackType.PERCENT) {
        totalValue = series.reduce((sum, s) => {
          const point = s.data.find((p: any) => p.x === category);
          return sum + (point ? Number(point.y) : 0);
        }, 0);
      }
      
      series.forEach(s => {
        const pointIndex = s.data.findIndex((p: any) => p.x === category);
        if (pointIndex >= 0) {
          const point = s.data[pointIndex];
          const originalValue = Number(point.y) || 0;
          
          // Store original value
          point.originalY = originalValue;
          
          if (stackType === StackType.PERCENT && totalValue > 0) {
            const percentage = (originalValue / totalValue) * 100;
            point.y = cumulativeValue + percentage;
            point.percentage = percentage;
            cumulativeValue = point.y;
          } else {
            point.y = cumulativeValue + originalValue;
            cumulativeValue = point.y;
          }
          
          point.stackedValue = point.y;
        }
      });
    });
  }
  
  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      } else {
        return value.toLocaleString();
      }
    }
    return String(value);
  }
}

/**
 * Bar chart utilities
 */
export class BarChartUtils {
  
  /**
   * Create sample bar chart data
   */
  static createSampleData(
    categories: string[] = ['A', 'B', 'C', 'D', 'E'],
    seriesCount: number = 3
  ): ChartDataset {
    const series: any[] = [];
    
    for (let s = 0; s < seriesCount; s++) {
      const data = categories.map(category => ({
        x: category,
        y: Math.floor(Math.random() * 100) + 10 + (s * 20)
      }));
      
      series.push({
        id: `series-${s}`,
        name: `Series ${s + 1}`,
        data,
        visible: true,
        stack: 'default' // All series in same stack group
      });
    }
    
    return { series };
  }
  
  /**
   * Create grouped bar chart data
   */
  static createGroupedData(
    categories: string[] = ['Q1', 'Q2', 'Q3', 'Q4'],
    groups: string[] = ['Product A', 'Product B', 'Product C']
  ): ChartDataset {
    const series = groups.map((group, groupIndex) => {
      const data = categories.map(category => ({
        x: category,
        y: Math.floor(Math.random() * 80) + 20 + (groupIndex * 10)
      }));
      
      return {
        id: `group-${groupIndex}`,
        name: group,
        data,
        visible: true
        // No stack property = separate groups
      };
    });
    
    return { series };
  }
  
  /**
   * Create stacked percentage data
   */
  static createPercentageData(
    categories: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    segments: string[] = ['Segment 1', 'Segment 2', 'Segment 3']
  ): ChartDataset {
    const series = segments.map((segment, segmentIndex) => {
      const data = categories.map(category => ({
        x: category,
        y: Math.floor(Math.random() * 50) + 10 // Raw values, will be converted to percentages
      }));
      
      return {
        id: `segment-${segmentIndex}`,
        name: segment,
        data,
        visible: true,
        stack: 'percentage',
        stackType: StackType.PERCENT
      };
    });
    
    return { series };
  }
  
  /**
   * Convert line data to bar data
   */
  static convertFromLineData(lineData: ChartDataset): ChartDataset {
    const barSeries = lineData.series.map(series => ({
      ...series,
      data: series.data.map(point => ({
        x: String(point.x), // Convert x to category
        y: point.y
      }))
    }));
    
    return { ...lineData, series: barSeries };
  }
  
  /**
   * Aggregate data by time period
   */
  static aggregateByPeriod(
    data: ChartDataset,
    period: 'day' | 'week' | 'month' | 'quarter' = 'month'
  ): ChartDataset {
    const aggregatedSeries = data.series.map(series => {
      const grouped = new Map<string, number[]>();
      
      series.data.forEach(point => {
        const date = new Date(point.x);
        let key: string;
        
        switch (period) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const week = Math.ceil(date.getDate() / 7);
            key = `${date.getFullYear()}-W${week}`;
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'quarter':
            const quarter = Math.ceil((date.getMonth() + 1) / 3);
            key = `${date.getFullYear()}-Q${quarter}`;
            break;
        }
        
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(Number(point.y));
      });
      
      const aggregatedData = Array.from(grouped.entries()).map(([key, values]) => ({
        x: key,
        y: values.reduce((sum, val) => sum + val, 0) / values.length // Average
      }));
      
      return { ...series, data: aggregatedData };
    });
    
    return { ...data, series: aggregatedSeries };
  }
}