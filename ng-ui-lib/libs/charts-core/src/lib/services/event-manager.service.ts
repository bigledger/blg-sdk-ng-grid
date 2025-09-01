/**
 * Event Manager Service - Handles chart event processing and delegation
 */

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { 
  ChartEvent, 
  ChartEvents, 
  ChartEventHandler, 
  ChartEventListener,
  ChartClickEvent,
  ChartHoverEvent 
} from '../interfaces';

/**
 * Event manager for chart interactions
 */
@Injectable({
  providedIn: 'root'
})
export class EventManager {
  
  // Event listeners map
  private eventListeners = new Map<ChartEvent, ChartEventListener[]>();
  
  // Event subjects for different types
  private eventSubjects = new Map<ChartEvent, Subject<ChartEvents>>();
  
  // Debounce timers
  private debounceTimers = new Map<string, number>();
  
  // Throttle timers
  private throttleTimers = new Map<string, number>();
  
  constructor() {
    this.initializeEventSubjects();
  }
  
  /**
   * Add event listener
   */
  addEventListener<T extends ChartEvents>(
    event: T['type'], 
    handler: ChartEventHandler<T>,
    options: { once?: boolean; priority?: number } = {}
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    const listener: ChartEventListener = {
      event,
      handler: handler as ChartEventHandler,
      once: options.once,
      priority: options.priority || 0
    };
    
    const listeners = this.eventListeners.get(event)!;
    listeners.push(listener);
    
    // Sort by priority (higher priority first)
    listeners.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  /**
   * Remove event listener
   */
  removeEventListener<T extends ChartEvents>(
    event: T['type'], 
    handler: ChartEventHandler<T>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    
    const index = listeners.findIndex(l => l.handler === handler);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Remove all event listeners for a specific event
   */
  removeAllListeners(event: ChartEvent): void {
    this.eventListeners.set(event, []);
  }
  
  /**
   * Emit chart event
   */
  emitEvent(chartEvent: ChartEvents): void {
    const listeners = this.eventListeners.get(chartEvent.type);
    if (!listeners || listeners.length === 0) return;
    
    // Create a copy to avoid issues if listeners are modified during execution
    const listenersToCall = [...listeners];
    
    for (const listener of listenersToCall) {
      try {
        listener.handler(chartEvent);
        
        // Remove one-time listeners
        if (listener.once) {
          this.removeEventListener(chartEvent.type, listener.handler);
        }
        
        // Stop if event propagation was stopped
        if ((chartEvent as any)._propagationStopped) {
          break;
        }
        
      } catch (error) {
        console.error('Error in chart event handler:', error);
      }
    }
    
    // Also emit to subject for observable streams
    const subject = this.eventSubjects.get(chartEvent.type);
    if (subject) {
      subject.next(chartEvent);
    }
  }
  
  /**
   * Get observable stream for specific event type
   */
  getEventObservable<T extends ChartEvents>(event: T['type']): Observable<T> {
    let subject = this.eventSubjects.get(event);
    if (!subject) {
      subject = new Subject<ChartEvents>();
      this.eventSubjects.set(event, subject);
    }
    return subject.asObservable() as Observable<T>;
  }
  
  /**
   * Handle mouse events from chart renderers
   */
  handleMouseEvent(event: MouseEvent, renderer: any): void {
    const rect = event.target ? (event.target as HTMLElement).getBoundingClientRect() : null;
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Get data at point from renderer
    const data = renderer.getDataAtPoint ? renderer.getDataAtPoint(x, y) : null;
    
    const baseEventData = {
      target: event.target,
      originalEvent: event,
      timestamp: Date.now(),
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => {
        event.stopPropagation();
        (event as any)._propagationStopped = true;
      }
    };
    
    switch (event.type) {
      case 'click':
        if (data) {
          const clickEvent: ChartClickEvent = {
            type: ChartEvent.CLICK,
            ...baseEventData,
            data: {
              seriesId: data.seriesId || '',
              dataPointIndex: data.dataPointIndex || 0,
              value: data.value || data,
              coordinates: { x, y, chartX: x, chartY: y }
            }
          };
          
          this.emitEvent(clickEvent);
        }
        break;
        
      case 'mousemove':
        this.handleMouseMove(event, data, x, y, baseEventData);
        break;
        
      case 'mouseleave':
        this.handleMouseLeave(baseEventData);
        break;
    }
  }
  
  /**
   * Handle keyboard events
   */
  handleKeyboardEvent(event: KeyboardEvent, renderer: any): void {
    // Handle keyboard navigation for accessibility
    const baseEventData = {
      target: event.target,
      originalEvent: event,
      timestamp: Date.now(),
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => {
        event.stopPropagation();
        (event as any)._propagationStopped = true;
      }
    };
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        this.handleArrowKeyNavigation(event, renderer, baseEventData);
        break;
        
      case 'Enter':
      case ' ':
        this.handleSelectionKey(event, renderer, baseEventData);
        break;
        
      case 'Escape':
        this.handleEscapeKey(baseEventData);
        break;
    }
  }
  
  /**
   * Handle mouse move with throttling
   */
  private handleMouseMove(
    event: MouseEvent, 
    data: any, 
    x: number, 
    y: number, 
    baseEventData: any
  ): void {
    const throttleKey = 'mousemove';
    
    // Throttle mouse move events
    if (this.throttleTimers.has(throttleKey)) {
      return;
    }
    
    this.throttleTimers.set(throttleKey, window.setTimeout(() => {
      this.throttleTimers.delete(throttleKey);
    }, 16)); // ~60fps
    
    if (data) {
      const hoverEvent: ChartHoverEvent = {
        type: ChartEvent.HOVER,
        ...baseEventData,
        data: {
          seriesId: data.seriesId || '',
          dataPointIndex: data.dataPointIndex || 0,
          value: data.value || data,
          coordinates: { x, y, chartX: x, chartY: y }
        }
      };
      
      this.emitEvent(hoverEvent);
    }
  }
  
  /**
   * Handle mouse leave
   */
  private handleMouseLeave(baseEventData: any): void {
    // Clear any hover states
    // This could emit a specific "hover-end" event
  }
  
  /**
   * Handle arrow key navigation
   */
  private handleArrowKeyNavigation(event: KeyboardEvent, renderer: any, baseEventData: any): void {
    // Implementation for keyboard navigation
    // This would move focus between data points
    event.preventDefault();
  }
  
  /**
   * Handle selection keys (Enter, Space)
   */
  private handleSelectionKey(event: KeyboardEvent, renderer: any, baseEventData: any): void {
    // Implementation for keyboard selection
    // This would trigger the same as a click event
    event.preventDefault();
  }
  
  /**
   * Handle escape key
   */
  private handleEscapeKey(baseEventData: any): void {
    // Clear selections, close tooltips, etc.
  }
  
  /**
   * Debounce function calls
   */
  debounce(key: string, fn: Function, delay: number): void {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timerId = window.setTimeout(() => {
      this.debounceTimers.delete(key);
      fn();
    }, delay);
    
    this.debounceTimers.set(key, timerId);
  }
  
  /**
   * Throttle function calls
   */
  throttle(key: string, fn: Function, delay: number): void {
    if (this.throttleTimers.has(key)) {
      return;
    }
    
    fn();
    
    const timerId = window.setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);
    
    this.throttleTimers.set(key, timerId);
  }
  
  /**
   * Initialize event subjects for all event types
   */
  private initializeEventSubjects(): void {
    Object.values(ChartEvent).forEach(eventType => {
      this.eventSubjects.set(eventType, new Subject<ChartEvents>());
    });
  }
  
  /**
   * Destroy event manager
   */
  destroy(): void {
    // Clear all listeners
    this.eventListeners.clear();
    
    // Complete and clean up subjects
    this.eventSubjects.forEach(subject => {
      subject.complete();
    });
    this.eventSubjects.clear();
    
    // Clear timers
    this.debounceTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.debounceTimers.clear();
    
    this.throttleTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.throttleTimers.clear();
  }
}