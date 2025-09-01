import { NgUiBaseConfig, NgUiDimensions, NgUiColor, NgUiAnimationConfig } from '../types/ngui-common.types';

/**
 * NgUI Chart Configuration Interface
 */
export interface NgUiChartConfig extends NgUiBaseConfig {
  /** Chart type */
  type: NgUiChartType;

  /** Chart dimensions */
  dimensions: NgUiDimensions;

  /** Chart title */
  title?: NgUiChartTitle;

  /** Chart subtitle */
  subtitle?: NgUiChartTitle;

  /** Chart legend */
  legend?: NgUiChartLegend;

  /** Chart axes */
  axes?: NgUiChartAxes;

  /** Chart colors */
  colors?: NgUiChartColors;

  /** Chart animation */
  animation?: NgUiAnimationConfig;

  /** Chart tooltip */
  tooltip?: NgUiChartTooltip;

  /** Chart margins */
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  /** Responsive behavior */
  responsive?: boolean;

  /** Maintain aspect ratio */
  maintainAspectRatio?: boolean;

  /** Render engine */
  renderEngine?: 'svg' | 'canvas' | 'webgl';

  /** Performance settings */
  performance?: {
    enableDataDecimation?: boolean;
    maxDataPoints?: number;
    useWorkers?: boolean;
  };

  /** Interaction settings */
  interaction?: NgUiChartInteraction;

  /** Export settings */
  exportSettings?: NgUiChartExportSettings;
}

/**
 * Chart Types
 */
export type NgUiChartType = 
  | 'line' 
  | 'bar' 
  | 'area' 
  | 'pie' 
  | 'doughnut' 
  | 'scatter' 
  | 'bubble' 
  | 'radar' 
  | 'polar' 
  | 'heatmap'
  | 'treemap'
  | 'candlestick'
  | 'waterfall'
  | 'gantt'
  | 'sankey'
  | 'sunburst'
  | 'bar-3d'
  | 'scatter-3d'
  | 'surface-3d'
  | 'globe';

/**
 * Chart Title Configuration
 */
export interface NgUiChartTitle {
  /** Title text */
  text: string;

  /** Title alignment */
  align?: 'left' | 'center' | 'right';

  /** Title styling */
  style?: {
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    textDecoration?: string;
  };

  /** Title margin */
  margin?: number;
}

/**
 * Chart Legend Configuration
 */
export interface NgUiChartLegend {
  /** Show legend */
  visible?: boolean;

  /** Legend position */
  position?: 'top' | 'bottom' | 'left' | 'right';

  /** Legend alignment */
  align?: 'start' | 'center' | 'end';

  /** Legend layout */
  layout?: 'horizontal' | 'vertical';

  /** Legend item styling */
  itemStyle?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
  };

  /** Legend marker */
  marker?: {
    shape?: 'circle' | 'square' | 'triangle' | 'diamond';
    size?: number;
  };

  /** Interactive legend */
  interactive?: boolean;

  /** Custom legend items */
  customItems?: NgUiChartLegendItem[];
}

export interface NgUiChartLegendItem {
  /** Item label */
  label: string;

  /** Item color */
  color: string;

  /** Item visibility */
  visible?: boolean;

  /** Item data series reference */
  seriesId?: string;
}

/**
 * Chart Axes Configuration
 */
export interface NgUiChartAxes {
  /** X-axis configuration */
  x?: NgUiChartAxis;

  /** Y-axis configuration */
  y?: NgUiChartAxis;

  /** Secondary Y-axis */
  y2?: NgUiChartAxis;

  /** Z-axis configuration (for 3D charts) */
  z?: NgUiChartAxis;
}

export interface NgUiChartAxis {
  /** Axis type */
  type?: 'linear' | 'logarithmic' | 'category' | 'time' | 'radial';

  /** Axis title */
  title?: string;

  /** Axis domain */
  domain?: [any, any];

  /** Axis ticks */
  ticks?: {
    count?: number;
    values?: any[];
    format?: string | ((value: any) => string);
    rotation?: number;
  };

  /** Grid lines */
  grid?: {
    visible?: boolean;
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
    width?: number;
  };

  /** Axis line */
  line?: {
    visible?: boolean;
    color?: string;
    width?: number;
  };

  /** Axis labels */
  labels?: {
    visible?: boolean;
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    offset?: number;
  };

  /** Axis position */
  position?: 'bottom' | 'top' | 'left' | 'right';

  /** Reverse axis */
  reverse?: boolean;
}

/**
 * Chart Colors Configuration
 */
export interface NgUiChartColors {
  /** Color scheme */
  scheme?: 'category10' | 'category20' | 'viridis' | 'plasma' | 'cool' | 'warm' | 'custom';

  /** Custom color palette */
  palette?: string[];

  /** Background color */
  background?: string;

  /** Plot area background */
  plotBackground?: string;

  /** Grid color */
  grid?: string;

  /** Text color */
  text?: string;
}

/**
 * Chart Tooltip Configuration
 */
export interface NgUiChartTooltip {
  /** Show tooltip */
  enabled?: boolean;

  /** Tooltip trigger */
  trigger?: 'hover' | 'click' | 'focus';

  /** Tooltip position */
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';

  /** Tooltip content format */
  format?: string | ((data: any) => string);

  /** Tooltip styling */
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: string;
    color?: string;
    padding?: string;
    maxWidth?: string;
  };

  /** Shared tooltip */
  shared?: boolean;

  /** Sort tooltip items */
  sort?: (a: any, b: any) => number;
}

/**
 * Chart Interaction Configuration
 */
export interface NgUiChartInteraction {
  /** Pan and zoom */
  zoom?: {
    enabled?: boolean;
    mode?: 'x' | 'y' | 'xy';
    speed?: number;
    limits?: {
      x?: [number, number];
      y?: [number, number];
    };
  };

  /** Selection */
  selection?: {
    enabled?: boolean;
    mode?: 'point' | 'area' | 'lasso';
    multiple?: boolean;
  };

  /** Brush */
  brush?: {
    enabled?: boolean;
    axis?: 'x' | 'y' | 'xy';
  };

  /** Crosshair */
  crosshair?: {
    enabled?: boolean;
    axis?: 'x' | 'y' | 'xy';
    style?: {
      color?: string;
      width?: number;
      style?: 'solid' | 'dashed' | 'dotted';
    };
  };
}

/**
 * Chart Export Settings
 */
export interface NgUiChartExportSettings {
  /** Export formats */
  formats?: ('png' | 'jpg' | 'svg' | 'pdf')[];

  /** Export quality */
  quality?: number;

  /** Export scale */
  scale?: number;

  /** Export background */
  background?: string;

  /** Export dimensions */
  dimensions?: NgUiDimensions;
}

/**
 * Chart Dataset Interface
 */
export interface NgUiChartDataset {
  /** Dataset name */
  name?: string;

  /** Dataset data */
  data: NgUiChartDataPoint[];

  /** Dataset color */
  color?: string;

  /** Dataset type (for mixed charts) */
  type?: NgUiChartType;

  /** Dataset styling */
  style?: NgUiChartDatasetStyle;

  /** Dataset visibility */
  visible?: boolean;

  /** Dataset axis binding */
  yAxisId?: string;

  /** Dataset metadata */
  metadata?: Record<string, any>;
}

export interface NgUiChartDataPoint {
  /** X value */
  x?: any;

  /** Y value */
  y?: any;

  /** Z value (for 3D charts) */
  z?: any;

  /** Point label */
  label?: string;

  /** Point color */
  color?: string;

  /** Point size */
  size?: number;

  /** Point metadata */
  metadata?: Record<string, any>;
}

export interface NgUiChartDatasetStyle {
  /** Line style */
  line?: {
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    curve?: 'linear' | 'smooth' | 'step';
  };

  /** Point style */
  point?: {
    radius?: number;
    shape?: 'circle' | 'square' | 'triangle' | 'diamond';
    border?: {
      width?: number;
      color?: string;
    };
  };

  /** Area style */
  area?: {
    fill?: boolean;
    opacity?: number;
    gradient?: {
      start?: string;
      stop?: string;
    };
  };

  /** Bar style */
  bar?: {
    width?: number;
    borderWidth?: number;
    borderRadius?: number;
  };
}

/**
 * NgUI Chart Event Interfaces
 */
export interface NgUiChartClickEvent {
  type: 'ngUiChartClick';
  data: NgUiChartDataPoint;
  datasetIndex: number;
  pointIndex: number;
  coordinates: { x: number; y: number };
  timestamp: number;
}

export interface NgUiChartHoverEvent {
  type: 'ngUiChartHover';
  data: NgUiChartDataPoint | null;
  datasetIndex?: number;
  pointIndex?: number;
  coordinates: { x: number; y: number };
  timestamp: number;
}

export interface NgUiChartZoomEvent {
  type: 'ngUiChartZoom';
  domain: {
    x?: [any, any];
    y?: [any, any];
  };
  timestamp: number;
}

export interface NgUiChartSelectionEvent {
  type: 'ngUiChartSelection';
  selection: NgUiChartDataPoint[];
  timestamp: number;
}

export type NgUiChartEvent =
  | NgUiChartClickEvent
  | NgUiChartHoverEvent
  | NgUiChartZoomEvent
  | NgUiChartSelectionEvent;