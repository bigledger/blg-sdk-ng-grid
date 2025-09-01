/**
 * Chart Event Interfaces
 */

import { ChartEvent } from './chart-types';

/**
 * Base chart event
 */
export interface BaseChartEvent {
  type: ChartEvent;
  target: any;
  originalEvent?: Event;
  timestamp: number;
  preventDefault: () => void;
  stopPropagation: () => void;
}

/**
 * Chart click event
 */
export interface ChartClickEvent extends BaseChartEvent {
  type: ChartEvent.CLICK;
  data: {
    seriesId: string;
    dataPointIndex: number;
    value: any;
    coordinates: {
      x: number;
      y: number;
      chartX: number;
      chartY: number;
    };
  };
}

/**
 * Chart hover event
 */
export interface ChartHoverEvent extends BaseChartEvent {
  type: ChartEvent.HOVER;
  data: {
    seriesId: string;
    dataPointIndex: number;
    value: any;
    coordinates: {
      x: number;
      y: number;
      chartX: number;
      chartY: number;
    };
  };
}

/**
 * Chart selection event
 */
export interface ChartSelectionEvent extends BaseChartEvent {
  type: ChartEvent.SELECT;
  data: {
    selectedItems: {
      seriesId: string;
      dataPointIndex: number;
      value: any;
    }[];
    selectionArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

/**
 * Chart zoom event
 */
export interface ChartZoomEvent extends BaseChartEvent {
  type: ChartEvent.ZOOM;
  data: {
    axis: 'x' | 'y' | 'xy';
    domain: {
      x?: [any, any];
      y?: [any, any];
    };
    scale: number;
    center: {
      x: number;
      y: number;
    };
  };
}

/**
 * Chart pan event
 */
export interface ChartPanEvent extends BaseChartEvent {
  type: ChartEvent.PAN;
  data: {
    axis: 'x' | 'y' | 'xy';
    delta: {
      x: number;
      y: number;
    };
    domain: {
      x?: [any, any];
      y?: [any, any];
    };
  };
}

/**
 * Chart brush event
 */
export interface ChartBrushEvent extends BaseChartEvent {
  type: ChartEvent.BRUSH;
  data: {
    selection: {
      x: [number, number];
      y: [number, number];
    };
    domain: {
      x: [any, any];
      y: [any, any];
    };
  };
}

/**
 * Legend event
 */
export interface LegendEvent extends BaseChartEvent {
  type: ChartEvent.LEGEND_CLICK | ChartEvent.LEGEND_HOVER;
  data: {
    seriesId: string;
    seriesName: string;
    visible: boolean;
    color: string;
  };
}

/**
 * Union type for all chart events
 */
export type ChartEvents = 
  | ChartClickEvent
  | ChartHoverEvent
  | ChartSelectionEvent
  | ChartZoomEvent
  | ChartPanEvent
  | ChartBrushEvent
  | LegendEvent;

/**
 * Event handler function type
 */
export type ChartEventHandler<T extends BaseChartEvent = BaseChartEvent> = (event: T) => void;

/**
 * Event listener interface
 */
export interface ChartEventListener {
  event: ChartEvent;
  handler: ChartEventHandler;
  once?: boolean;
  priority?: number;
}