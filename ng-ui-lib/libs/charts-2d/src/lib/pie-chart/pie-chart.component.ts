/**
 * Pie Chart Component - Circular charts with pie and doughnut variants
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
  LegendPosition
} from '@ng-ui/charts-core';

/**
 * Pie chart configuration interface
 */
export interface PieChartConfig extends Omit<ChartConfig, 'type'> {
  type: ChartType.PIE | ChartType.DOUGHNUT;
  pie?: {
    innerRadius?: number; // 0 = pie, >0 = doughnut
    outerRadius?: number;
    startAngle?: number; // In degrees
    endAngle?: number;   // In degrees
    padAngle?: number;   // Gap between slices
    cornerRadius?: number;
    showLabels?: boolean;
    labelPosition?: 'inside' | 'outside' | 'edge';
    showValues?: boolean;
    showPercentages?: boolean;
    labelConnectors?: boolean;
    sortSlices?: boolean;
    sortBy?: 'value' | 'label' | 'none';
    sortDirection?: 'asc' | 'desc';
    minSliceAngle?: number; // Minimum angle for a slice to be visible
    explodeSlices?: number[]; // Indices of slices to explode
    explodeDistance?: number;
  };
}

/**
 * Pie Chart Component supporting both pie and doughnut styles
 */
@Component({
  selector: 'blg-pie-chart',
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
    'class': 'blg-pie-chart',
    '[attr.data-variant]': 'chartConfig().type',
    '[attr.data-slice-count]': 'processedData().series[0]?.data.length || 0'
  }
})
export class PieChartComponent {
  
  // Input signals
  readonly data = input.required<ChartDataset>();
  readonly config = input<Partial<PieChartConfig>>({});
  readonly loading = input<boolean>(false);
  
  // Output events
  readonly chartReady = output<void>();
  readonly chartError = output<Error>();
  readonly dataChanged = output<ChartDataset>();
  readonly chartEvent = output<any>();
  
  // Computed processed data
  readonly processedData = computed((): ChartDataset => {
    const rawData = this.data();
    const config = this.chartConfig();
    
    // For pie charts, we typically use the first series only
    const firstSeries = rawData.series[0];
    if (!firstSeries) {
      return { series: [] };
    }
    
    let processedSeries = { ...firstSeries };
    
    // Sort slices if requested
    if (config.pie?.sortSlices && config.pie.sortBy !== 'none') {
      processedSeries.data = this.sortSlices(
        processedSeries.data, 
        config.pie.sortBy!, 
        config.pie.sortDirection || 'desc'
      );
    }
    
    // Filter out slices below minimum angle
    if (config.pie?.minSliceAngle && config.pie.minSliceAngle > 0) {
      processedSeries.data = this.filterSmallSlices(
        processedSeries.data,
        config.pie.minSliceAngle
      );
    }
    
    // Calculate percentages and angles
    processedSeries.data = this.calculateSliceMetadata(processedSeries.data);
    
    return { 
      series: [processedSeries],
      metadata: {
        ...rawData.metadata,
        pieChart: true,
        totalValue: this.calculateTotal(processedSeries.data)
      }
    };
  });
  
  // Computed chart configuration
  readonly chartConfig = computed((): PieChartConfig => {
    const baseConfig = this.createDefaultConfig();
    const userConfig = this.config();
    
    // Determine if this should be a doughnut chart
    const innerRadius = userConfig.pie?.innerRadius ?? baseConfig.pie?.innerRadius ?? 0;
    const chartType = innerRadius > 0 ? ChartType.DOUGHNUT : ChartType.PIE;
    
    return {
      ...baseConfig,
      ...userConfig,
      type: chartType,
      // Merge nested objects properly
      dimensions: {
        ...baseConfig.dimensions,
        ...userConfig.dimensions
      },
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
      pie: {
        ...baseConfig.pie,
        ...userConfig.pie,
        innerRadius
      }
    };
  });
  
  /**
   * Create default pie chart configuration
   */
  private createDefaultConfig(): PieChartConfig {
    return {
      type: ChartType.PIE,
      renderEngine: RenderEngine.SVG,
      
      dimensions: {
        width: 500,
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      
      // Pie charts don't use traditional axes
      axes: [],
      
      legend: {
        visible: true,
        position: LegendPosition.RIGHT,
        orientation: 'vertical',
        align: 'center',
        spacing: 8,
        interactive: true
      },
      
      tooltip: {
        enabled: true,
        trigger: 'hover' as any,
        formatter: (data: any) => {
          const value = data.value?.y || data.value;
          const label = data.value?.x || data.label;
          const percentage = data.percentage || 0;
          
          return `
            <div class="tooltip-content">
              <div class="tooltip-title">${label}</div>
              <div class="tooltip-value">
                <strong>${this.formatValue(value)}</strong>
                <span class="tooltip-percentage">(${percentage.toFixed(1)}%)</span>
              </div>
            </div>
          `;
        }
      },
      
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'ease-out' as any,
        stagger: 50
      },
      
      interaction: {
        hover: {
          enabled: true,
          highlightSeries: false // Individual slice highlighting
        },
        selection: {
          enabled: true,
          multiple: true,
          clearOnOutsideClick: true
        }
      },
      
      pie: {
        innerRadius: 0, // 0 = pie, >0 = doughnut
        outerRadius: 180,
        startAngle: -90, // Start at top
        endAngle: 270,   // Full circle
        padAngle: 2,     // Small gap between slices
        cornerRadius: 3,
        showLabels: true,
        labelPosition: 'outside',
        showValues: false,
        showPercentages: true,
        labelConnectors: true,
        sortSlices: true,
        sortBy: 'value',
        sortDirection: 'desc',
        minSliceAngle: 3, // Hide slices smaller than 3 degrees
        explodeSlices: [],
        explodeDistance: 10
      },
      
      export: {
        enabled: true,
        formats: ['png', 'svg', 'jpg'],
        filename: 'pie-chart'
      },
      
      accessibility: {
        enabled: true,
        description: 'Interactive pie chart showing proportional data',
        ariaLabel: 'Pie chart',
        keyboardNavigation: true
      },
      
      responsive: true,
      maintainAspectRatio: true,
      
      colors: [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#96CEB4', // Green
        '#FECA57', // Yellow
        '#FF9FF3', // Pink
        '#54A0FF', // Light Blue
        '#5F27CD', // Purple
        '#00D2D3', // Cyan
        '#FF9F43', // Orange
        '#10AC84', // Emerald
        '#EE5A24'  // Dark Orange
      ]
    };
  }
  
  /**
   * Sort slices by specified criteria
   */
  private sortSlices(data: any[], sortBy: string, direction: 'asc' | 'desc'): any[] {
    return [...data].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'value':
          compareValue = Number(a.y) - Number(b.y);
          break;
        case 'label':
          compareValue = String(a.x).localeCompare(String(b.x));
          break;
        default:
          return 0;
      }
      
      return direction === 'desc' ? -compareValue : compareValue;
    });
  }
  
  /**
   * Filter out slices below minimum angle
   */
  private filterSmallSlices(data: any[], minAngle: number): any[] {
    const total = this.calculateTotal(data);
    const minValue = (minAngle / 360) * total;
    
    const filtered = data.filter(point => Number(point.y) >= minValue);
    
    // If we filtered out slices, add an "Others" slice for the remainder
    const filteredTotal = this.calculateTotal(filtered);
    if (filteredTotal < total) {
      const othersValue = total - filteredTotal;
      filtered.push({
        x: 'Others',
        y: othersValue,
        isOthers: true
      });
    }
    
    return filtered;
  }
  
  /**
   * Calculate slice metadata (percentages, angles)
   */
  private calculateSliceMetadata(data: any[]): any[] {
    const total = this.calculateTotal(data);
    let cumulativeAngle = 0;
    
    return data.map(point => {
      const value = Number(point.y);
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const angle = total > 0 ? (value / total) * 360 : 0;
      
      const enrichedPoint = {
        ...point,
        percentage,
        angle,
        startAngle: cumulativeAngle,
        endAngle: cumulativeAngle + angle,
        value // Normalized numeric value
      };
      
      cumulativeAngle += angle;
      return enrichedPoint;
    });
  }
  
  /**
   * Calculate total value of all slices
   */
  private calculateTotal(data: any[]): number {
    return data.reduce((sum, point) => sum + Number(point.y), 0);
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
 * Pie chart utilities
 */
export class PieChartUtils {
  
  /**
   * Create sample pie chart data
   */
  static createSampleData(
    labels: string[] = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    randomValues: boolean = true
  ): ChartDataset {
    const data = labels.map((label, index) => ({
      x: label,
      y: randomValues ? 
        Math.floor(Math.random() * 100) + 10 : 
        (index + 1) * 20
    }));
    
    return {
      series: [{
        id: 'pie-series',
        name: 'Pie Chart Data',
        data,
        visible: true
      }]
    };
  }
  
  /**
   * Create market share data
   */
  static createMarketShareData(): ChartDataset {
    const marketData = [
      { x: 'Company A', y: 35.2 },
      { x: 'Company B', y: 28.7 },
      { x: 'Company C', y: 15.6 },
      { x: 'Company D', y: 12.1 },
      { x: 'Others', y: 8.4 }
    ];
    
    return {
      series: [{
        id: 'market-share',
        name: 'Market Share',
        data: marketData,
        visible: true
      }],
      metadata: {
        title: 'Market Share by Company',
        unit: '%',
        year: new Date().getFullYear()
      }
    };
  }
  
  /**
   * Create budget breakdown data
   */
  static createBudgetData(): ChartDataset {
    const budgetData = [
      { x: 'Marketing', y: 35000 },
      { x: 'Development', y: 45000 },
      { x: 'Operations', y: 25000 },
      { x: 'Sales', y: 30000 },
      { x: 'HR', y: 15000 },
      { x: 'Other', y: 10000 }
    ];
    
    return {
      series: [{
        id: 'budget-breakdown',
        name: 'Budget Allocation',
        data: budgetData,
        visible: true
      }],
      metadata: {
        title: 'Annual Budget Breakdown',
        unit: 'USD',
        total: budgetData.reduce((sum, item) => sum + item.y, 0)
      }
    };
  }
  
  /**
   * Convert bar chart data to pie chart data
   */
  static convertFromBarData(barData: ChartDataset, seriesIndex: number = 0): ChartDataset {
    const series = barData.series[seriesIndex];
    if (!series) {
      return { series: [] };
    }
    
    return {
      series: [{
        id: `pie-from-${series.id}`,
        name: series.name,
        data: series.data,
        visible: true
      }],
      metadata: {
        ...barData.metadata,
        convertedFrom: 'bar',
        originalSeriesId: series.id
      }
    };
  }
  
  /**
   * Create hierarchical pie chart data (for nested doughnuts)
   */
  static createHierarchicalData(): ChartDataset {
    const innerData = [
      { x: 'Desktop', y: 60 },
      { x: 'Mobile', y: 35 },
      { x: 'Tablet', y: 5 }
    ];
    
    const outerData = [
      { x: 'Windows', y: 35, parent: 'Desktop' },
      { x: 'macOS', y: 20, parent: 'Desktop' },
      { x: 'Linux', y: 5, parent: 'Desktop' },
      { x: 'iOS', y: 20, parent: 'Mobile' },
      { x: 'Android', y: 15, parent: 'Mobile' },
      { x: 'iPad', y: 3, parent: 'Tablet' },
      { x: 'Android Tablet', y: 2, parent: 'Tablet' }
    ];
    
    return {
      series: [
        {
          id: 'inner-ring',
          name: 'Device Categories',
          data: innerData,
          visible: true
        },
        {
          id: 'outer-ring',
          name: 'Specific Platforms',
          data: outerData,
          visible: true
        }
      ],
      metadata: {
        hierarchical: true,
        levels: 2
      }
    };
  }
  
  /**
   * Calculate slice colors with automatic contrast
   */
  static generateSliceColors(
    sliceCount: number,
    baseHue: number = 220,
    saturation: number = 70,
    lightness: number = 50
  ): string[] {
    const colors: string[] = [];
    const hueStep = 360 / sliceCount;
    
    for (let i = 0; i < sliceCount; i++) {
      const hue = (baseHue + (i * hueStep)) % 360;
      const lightnessVariation = lightness + (i % 2 === 0 ? -10 : 10);
      colors.push(`hsl(${hue}, ${saturation}%, ${lightnessVariation}%)`);
    }
    
    return colors;
  }
  
  /**
   * Explode specific slices
   */
  static explodeSlices(data: ChartDataset, sliceIndices: number[]): ChartDataset {
    const series = { ...data.series[0] };
    
    series.metadata = {
      ...series.metadata,
      explodedSlices: sliceIndices
    };
    
    return {
      ...data,
      series: [series]
    };
  }
}