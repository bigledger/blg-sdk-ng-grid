/**
 * Chart Configuration Interfaces
 */

import { 
  ChartType, 
  RenderEngine, 
  ScaleType, 
  LegendPosition, 
  TooltipTrigger, 
  AnimationEasing 
} from './chart-types';

/**
 * Chart dimensions and layout
 */
export interface ChartDimensions {
  width: number;
  height: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  id: string;
  type: ScaleType;
  position: 'top' | 'right' | 'bottom' | 'left';
  domain?: [any, any];
  range?: [number, number];
  label?: string;
  visible?: boolean;
  gridLines?: boolean;
  tickCount?: number;
  tickFormat?: string | ((value: any) => string);
  tickSize?: number;
  tickPadding?: number;
}

/**
 * Legend configuration
 */
export interface LegendConfig {
  visible: boolean;
  position: LegendPosition;
  orientation?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  spacing?: number;
  itemStyle?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
  };
  interactive?: boolean;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  enabled: boolean;
  trigger: TooltipTrigger;
  followCursor?: boolean;
  className?: string;
  style?: {
    backgroundColor?: string;
    color?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontFamily?: string;
  };
  formatter?: (data: any) => string;
  position?: 'auto' | 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: AnimationEasing;
  delay?: number;
  stagger?: number;
  loop?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

/**
 * Interaction configuration
 */
export interface InteractionConfig {
  zoom?: {
    enabled: boolean;
    type: 'x' | 'y' | 'xy';
    wheel?: boolean;
    drag?: boolean;
    rangeSelector?: boolean;
  };
  pan?: {
    enabled: boolean;
    type: 'x' | 'y' | 'xy';
    button?: number;
  };
  brush?: {
    enabled: boolean;
    type: 'x' | 'y' | 'xy';
  };
  selection?: {
    enabled: boolean;
    multiple?: boolean;
    clearOnOutsideClick?: boolean;
  };
  hover?: {
    enabled: boolean;
    highlightSeries?: boolean;
    highlightPoint?: boolean;
  };
}

/**
 * Export configuration
 */
export interface ExportConfig {
  enabled: boolean;
  formats: ('png' | 'jpg' | 'svg' | 'pdf')[];
  filename?: string;
  quality?: number;
  resolution?: number;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string[];
    background: string;
    text: string;
    axis: string;
    grid: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  animation?: Partial<AnimationConfig>;
}

/**
 * Main chart configuration
 */
export interface ChartConfig {
  type: ChartType;
  renderEngine: RenderEngine;
  dimensions: ChartDimensions;
  theme?: string | ThemeConfig;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  
  // Layout
  title?: {
    text: string;
    position?: 'top' | 'center' | 'bottom';
    align?: 'left' | 'center' | 'right';
    style?: {
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      fontWeight?: string | number;
    };
  };
  
  subtitle?: {
    text: string;
    position?: 'top' | 'center' | 'bottom';
    align?: 'left' | 'center' | 'right';
    style?: {
      fontSize?: number;
      fontFamily?: string;
      color?: string;
    };
  };
  
  // Components
  axes?: AxisConfig[];
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  animation?: AnimationConfig;
  interaction?: InteractionConfig;
  export?: ExportConfig;
  
  // Performance
  performance?: {
    enableVirtualization?: boolean;
    maxDataPoints?: number;
    renderBatchSize?: number;
    useWebWorker?: boolean;
  };
  
  // Accessibility
  accessibility?: {
    enabled?: boolean;
    description?: string;
    ariaLabel?: string;
    keyboardNavigation?: boolean;
    highContrast?: boolean;
  };
  
  // Plugins
  plugins?: string[];
  
  // Custom properties
  [key: string]: any;
}