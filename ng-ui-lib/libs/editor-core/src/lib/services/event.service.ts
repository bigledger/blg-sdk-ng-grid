import { Injectable, signal, computed } from '@angular/core';
import {
  EditorEvent,
  EditorEventType,
  EditorEventSource,
  EditorEventHandler,
  EditorContentChangeEvent,
  EditorSelectionChangeEvent,
  EditorFocusEvent,
  EditorKeyboardEvent,
  EditorMouseEvent,
  EditorCommandEvent
} from '../interfaces';

/**
 * Event Service
 * Manages event handling and propagation for the BLG Editor
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Private state
  private _listeners = signal<Map<EditorEventType, EditorEventHandler[]>>(new Map());
  private _eventHistory = signal<EditorEvent[]>([]);
  private _maxHistorySize = signal<number>(100);
  private _enabled = signal<boolean>(true);

  // Public readonly state
  readonly listeners = this._listeners.asReadonly();
  readonly eventHistory = this._eventHistory.asReadonly();
  readonly enabled = this._enabled.asReadonly();

  // Computed values
  readonly listenerCount = computed(() => {
    const listeners = this._listeners();
    let total = 0;
    listeners.forEach(handlers => total += handlers.length);
    return total;
  });

  readonly eventTypeCount = computed(() => this._listeners().size);

  /**
   * Add event listener
   */
  on<T extends EditorEvent = EditorEvent>(
    eventType: EditorEventType,
    handler: (event: T) => void | boolean,
    options?: {
      priority?: number;
      once?: boolean;
      context?: any;
    }
  ): () => void {
    const listeners = new Map(this._listeners());
    const eventHandlers = listeners.get(eventType) || [];

    const eventHandler: EditorEventHandler<T> = {
      handler: handler as (event: EditorEvent) => void | boolean,
      priority: options?.priority || 0,
      once: options?.once || false,
      context: options?.context
    };

    // Insert handler based on priority (higher priority first)
    const insertIndex = eventHandlers.findIndex(h => h.priority! < eventHandler.priority!);
    if (insertIndex === -1) {
      eventHandlers.push(eventHandler);
    } else {
      eventHandlers.splice(insertIndex, 0, eventHandler);
    }

    listeners.set(eventType, eventHandlers);
    this._listeners.set(listeners);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  /**
   * Remove event listener
   */
  off(eventType: EditorEventType, handler: Function): boolean {
    const listeners = new Map(this._listeners());
    const eventHandlers = listeners.get(eventType);

    if (!eventHandlers) return false;

    const index = eventHandlers.findIndex(h => h.handler === handler);
    if (index === -1) return false;

    eventHandlers.splice(index, 1);

    if (eventHandlers.length === 0) {
      listeners.delete(eventType);
    } else {
      listeners.set(eventType, eventHandlers);
    }

    this._listeners.set(listeners);
    return true;
  }

  /**
   * Add one-time event listener
   */
  once<T extends EditorEvent = EditorEvent>(
    eventType: EditorEventType,
    handler: (event: T) => void | boolean,
    options?: {
      priority?: number;
      context?: any;
    }
  ): () => void {
    return this.on(eventType, handler, { ...options, once: true });
  }

  /**
   * Emit event
   */
  emit<T extends EditorEvent>(
    eventType: EditorEventType,
    data: any = {},
    source: EditorEventSource = 'editor',
    cancelable: boolean = false
  ): T {
    if (!this._enabled()) {
      return this.createEvent(eventType, data, source, cancelable) as T;
    }

    const event = this.createEvent(eventType, data, source, cancelable) as T;
    
    // Add to history
    this.addToHistory(event);

    // Get handlers for this event type
    const listeners = this._listeners();
    const eventHandlers = listeners.get(eventType) || [];

    // Execute handlers in priority order
    for (const eventHandler of eventHandlers) {
      try {
        const result = eventHandler.handler(event);
        
        // If handler returns false, stop propagation
        if (result === false && cancelable) {
          event.cancelled = true;
          event.propagationStopped = true;
          break;
        }
        
        // Remove one-time handlers
        if (eventHandler.once) {
          this.off(eventType, eventHandler.handler);
        }
        
        // Check if propagation was stopped
        if (event.propagationStopped) {
          break;
        }
      } catch (error) {
        console.error(`Event handler error for ${eventType}:`, error);
      }
    }

    return event;
  }

  /**
   * Create typed event emitters for common events
   */
  emitContentChange(
    previousContent: string,
    newContent: string,
    source: 'user' | 'api' | 'plugin' = 'user'
  ): EditorContentChangeEvent {
    return this.emit<EditorContentChangeEvent>('contentChange', {
      previousContent,
      newContent,
      delta: this.calculateDelta(previousContent, newContent),
      source
    }, 'editor', true);
  }

  emitSelectionChange(
    previousSelection: any,
    newSelection: any,
    reason: any = 'userInteraction'
  ): EditorSelectionChangeEvent {
    return this.emit<EditorSelectionChangeEvent>('selectionChange', {
      previousSelection,
      newSelection,
      reason
    }, 'editor', false);
  }

  emitFocus(
    originalEvent: FocusEvent,
    relatedTarget: EventTarget | null = null,
    direction: 'forward' | 'backward' | 'none' = 'none'
  ): EditorFocusEvent {
    return this.emit<EditorFocusEvent>('focus', {
      originalEvent,
      relatedTarget,
      direction
    }, 'editor', false);
  }

  emitBlur(
    originalEvent: FocusEvent,
    relatedTarget: EventTarget | null = null,
    direction: 'forward' | 'backward' | 'none' = 'none'
  ): EditorFocusEvent {
    return this.emit<EditorFocusEvent>('blur', {
      originalEvent,
      relatedTarget,
      direction
    }, 'editor', false);
  }

  emitKeyboard(
    type: 'keydown' | 'keyup' | 'keypress',
    originalEvent: KeyboardEvent
  ): EditorKeyboardEvent {
    return this.emit<EditorKeyboardEvent>(type, {
      originalEvent,
      keyCode: originalEvent.keyCode,
      key: originalEvent.key,
      modifiers: {
        ctrl: originalEvent.ctrlKey,
        alt: originalEvent.altKey,
        shift: originalEvent.shiftKey,
        meta: originalEvent.metaKey
      },
      printable: this.isPrintableKey(originalEvent.key)
    }, 'editor', true);
  }

  emitMouse(
    type: 'mousedown' | 'mouseup' | 'click' | 'dblclick' | 'contextmenu',
    originalEvent: MouseEvent,
    clickCount: number = 1
  ): EditorMouseEvent {
    return this.emit<EditorMouseEvent>(type, {
      originalEvent,
      position: { x: originalEvent.clientX, y: originalEvent.clientY },
      target: originalEvent.target as Element,
      button: originalEvent.button,
      clickCount
    }, 'editor', true);
  }

  emitCommand(
    type: 'beforeCommand' | 'afterCommand' | 'commandFailed',
    commandName: string,
    commandParams: Record<string, any> = {},
    result?: any,
    error?: Error
  ): EditorCommandEvent {
    return this.emit<EditorCommandEvent>(type, {
      commandName,
      commandParams,
      result,
      error
    }, 'editor', type === 'beforeCommand');
  }

  /**
   * Remove all listeners for a specific event type
   */
  removeAllListeners(eventType?: EditorEventType): void {
    const listeners = new Map(this._listeners());
    
    if (eventType) {
      listeners.delete(eventType);
    } else {
      listeners.clear();
    }
    
    this._listeners.set(listeners);
  }

  /**
   * Check if there are listeners for an event type
   */
  hasListeners(eventType: EditorEventType): boolean {
    const listeners = this._listeners();
    const eventHandlers = listeners.get(eventType);
    return eventHandlers !== undefined && eventHandlers.length > 0;
  }

  /**
   * Get listener count for an event type
   */
  getListenerCount(eventType: EditorEventType): number {
    const listeners = this._listeners();
    const eventHandlers = listeners.get(eventType);
    return eventHandlers ? eventHandlers.length : 0;
  }

  /**
   * Enable or disable event processing
   */
  setEnabled(enabled: boolean): void {
    this._enabled.set(enabled);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this._eventHistory.set([]);
  }

  /**
   * Get events by type from history
   */
  getEventsByType(eventType: EditorEventType): EditorEvent[] {
    return this._eventHistory().filter(event => event.type === eventType);
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 10): EditorEvent[] {
    const history = this._eventHistory();
    return history.slice(-count);
  }

  /**
   * Create event object
   */
  private createEvent(
    type: EditorEventType,
    data: any,
    source: EditorEventSource,
    cancelable: boolean
  ): EditorEvent {
    return {
      type,
      timestamp: Date.now(),
      source,
      data,
      cancelable,
      cancelled: false,
      propagationStopped: false
    };
  }

  /**
   * Add event to history
   */
  private addToHistory(event: EditorEvent): void {
    const history = this._eventHistory();
    const maxSize = this._maxHistorySize();
    
    const newHistory = [...history, event];
    
    // Limit history size
    if (newHistory.length > maxSize) {
      newHistory.shift();
    }
    
    this._eventHistory.set(newHistory);
  }

  /**
   * Calculate content delta
   */
  private calculateDelta(previousContent: string, newContent: string): any {
    // Simple diff implementation
    if (previousContent === newContent) {
      return { type: 'none', position: 0, length: 0 };
    }
    
    // Find common prefix
    let start = 0;
    const minLength = Math.min(previousContent.length, newContent.length);
    while (start < minLength && previousContent[start] === newContent[start]) {
      start++;
    }
    
    // Find common suffix
    let endOld = previousContent.length;
    let endNew = newContent.length;
    while (endOld > start && endNew > start && 
           previousContent[endOld - 1] === newContent[endNew - 1]) {
      endOld--;
      endNew--;
    }
    
    const deletedLength = endOld - start;
    const insertedContent = newContent.substring(start, endNew);
    const deletedContent = previousContent.substring(start, endOld);
    
    if (deletedLength === 0) {
      return {
        type: 'insert',
        position: start,
        length: insertedContent.length,
        content: insertedContent
      };
    } else if (insertedContent.length === 0) {
      return {
        type: 'delete',
        position: start,
        length: deletedLength,
        deletedContent
      };
    } else {
      return {
        type: 'replace',
        position: start,
        length: deletedLength,
        content: insertedContent,
        deletedContent
      };
    }
  }

  /**
   * Check if key is printable
   */
  private isPrintableKey(key: string): boolean {
    return key.length === 1 && !key.match(/[\x00-\x1F\x7F]/);
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this._maxHistorySize.set(size);
    
    // Trim current history if needed
    const history = this._eventHistory();
    if (history.length > size) {
      this._eventHistory.set(history.slice(-size));
    }
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this._listeners.set(new Map());
    this._eventHistory.set([]);
    this._enabled.set(false);
  }
}