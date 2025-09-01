/**
 * Chart State Service - Manages chart state and domain information
 */

import { Injectable, signal, computed } from '@angular/core';
import { ChartConfig, ChartDataset } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChartState {
  private readonly _config = signal<ChartConfig | null>(null);
  private readonly _data = signal<ChartDataset | null>(null);
  private readonly _originalDomain = signal<{ x?: [any, any]; y?: [any, any] } | null>(null);
  private readonly _currentDomain = signal<{ x?: [any, any]; y?: [any, any] } | null>(null);
  
  readonly config = this._config.asReadonly();
  readonly data = this._data.asReadonly();
  readonly originalDomain = this._originalDomain.asReadonly();
  readonly currentDomain = this._currentDomain.asReadonly();
  
  initialize(config: ChartConfig, data: ChartDataset): void {
    this._config.set(config);
    this._data.set(data);
    this._originalDomain.set(this.calculateDomain(data));
    this._currentDomain.set(this._originalDomain());
  }
  
  updateConfig(config: ChartConfig): void {
    this._config.set(config);
  }
  
  updateData(data: ChartDataset): void {
    this._data.set(data);
    this._originalDomain.set(this.calculateDomain(data));
  }
  
  setDomain(domain: { x?: [any, any]; y?: [any, any] }): void {
    this._currentDomain.set(domain);
  }
  
  resetDomain(): void {
    this._currentDomain.set(this._originalDomain());
  }
  
  getOriginalDomain(): { x?: [any, any]; y?: [any, any] } | null {
    return this._originalDomain();
  }
  
  private calculateDomain(data: ChartDataset): { x?: [any, any]; y?: [any, any] } {
    const xValues: any[] = [];
    const yValues: number[] = [];
    
    data.series.forEach(series => {
      series.data.forEach(point => {
        xValues.push(point.x);
        const y = Number(point.y);
        if (isFinite(y)) {
          yValues.push(y);
        }
      });
    });
    
    return {
      x: xValues.length > 0 ? [Math.min(...xValues), Math.max(...xValues)] : undefined,
      y: yValues.length > 0 ? [Math.min(...yValues), Math.max(...yValues)] : undefined
    };
  }
}