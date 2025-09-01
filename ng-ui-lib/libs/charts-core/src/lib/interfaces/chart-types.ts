/**
 * Chart Types Interface - Defines all chart type enums and constants
 */

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  COLUMN = 'column',
  AREA = 'area',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  SCATTER = 'scatter',
  BUBBLE = 'bubble',
  RADAR = 'radar',
  POLAR = 'polar',
  COMBINED = 'combined',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  SUNBURST = 'sunburst'
}

export enum RenderEngine {
  CANVAS = 'canvas',
  SVG = 'svg',
  WEBGL = 'webgl'
}

export enum ScaleType {
  LINEAR = 'linear',
  LOG = 'log',
  TIME = 'time',
  BAND = 'band',
  POINT = 'point',
  ORDINAL = 'ordinal'
}

export enum InterpolationType {
  LINEAR = 'linear',
  STEP = 'step',
  STEP_BEFORE = 'step-before',
  STEP_AFTER = 'step-after',
  BASIS = 'basis',
  CARDINAL = 'cardinal',
  MONOTONE = 'monotone',
  CATMULL_ROM = 'catmull-rom'
}

export enum StackType {
  NONE = 'none',
  NORMAL = 'normal',
  PERCENT = 'percent'
}

export enum LegendPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
  NONE = 'none'
}

export enum TooltipTrigger {
  HOVER = 'hover',
  CLICK = 'click',
  FOCUS = 'focus',
  MANUAL = 'manual'
}

export enum AnimationEasing {
  LINEAR = 'linear',
  EASE = 'ease',
  EASE_IN = 'ease-in',
  EASE_OUT = 'ease-out',
  EASE_IN_OUT = 'ease-in-out',
  ELASTIC = 'elastic',
  BOUNCE = 'bounce',
  BACK = 'back'
}

export enum ChartEvent {
  CLICK = 'click',
  HOVER = 'hover',
  SELECT = 'select',
  ZOOM = 'zoom',
  PAN = 'pan',
  BRUSH = 'brush',
  LEGEND_CLICK = 'legend-click',
  LEGEND_HOVER = 'legend-hover'
}