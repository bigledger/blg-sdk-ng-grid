import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { 
  ToolbarConfig, 
  ToolbarState, 
  ToolbarMode,
  ToolbarButton,
  SelectionState,
  ToolbarEvents
} from '../interfaces/toolbar-config.interface';
import { TOOLBAR_CONFIGS, DEFAULT_BREAKPOINTS } from '../types/toolbar.types';

/**
 * Service for managing toolbar state using Angular Signals
 */
@Injectable({
  providedIn: 'root'
})
export class ToolbarStateService {
  // Core state signals
  private readonly _config = signal<ToolbarConfig>(TOOLBAR_CONFIGS.FULL);
  private readonly _activeButtons = signal<Set<string>>(new Set());
  private readonly _disabledButtons = signal<Set<string>>(new Set());
  private readonly _buttonValues = signal<Map<string, any>>(new Map());
  private readonly _selectionState = signal<SelectionState | undefined>(undefined);
  private readonly _mobileMode = signal<boolean>(false);
  private readonly _keyboardNavigation = signal<boolean>(false);
  private readonly _visible = signal<boolean>(true);

  // Event emitters
  private readonly _eventHandlers = new Map<keyof ToolbarEvents, Set<(event: any) => void>>();

  // Read-only computed state
  readonly config = this._config.asReadonly();
  readonly activeButtons = this._activeButtons.asReadonly();
  readonly disabledButtons = this._disabledButtons.asReadonly();
  readonly buttonValues = this._buttonValues.asReadonly();
  readonly selectionState = this._selectionState.asReadonly();
  readonly mobileMode = this._mobileMode.asReadonly();
  readonly keyboardNavigation = this._keyboardNavigation.asReadonly();
  readonly visible = this._visible.asReadonly();

  // Computed state
  readonly state = computed<ToolbarState>(() => ({
    config: this._config(),
    activeButtons: this._activeButtons(),
    disabledButtons: this._disabledButtons(),
    buttonValues: this._buttonValues(),
    selectionState: this._selectionState(),
    mobileMode: this._mobileMode(),
    keyboardNavigation: this._keyboardNavigation()
  }));

  readonly visibleButtons = computed(() => {
    const config = this._config();
    const buttons: ToolbarButton[] = [];
    
    config.sections.forEach(section => {
      if (section.visible !== false) {
        section.buttons.forEach(button => {
          if (button.visible !== false) {
            buttons.push(button);
          }
        });
      }
    });
    
    return buttons;
  });

  readonly enabledButtons = computed(() => {
    const disabled = this._disabledButtons();
    return this.visibleButtons().filter(button => !disabled.has(button.id));
  });

  readonly currentMode = computed(() => this._config().mode);

  readonly isFloatingMode = computed(() => this.currentMode() === 'floating');
  
  readonly shouldShowFloatingToolbar = computed(() => {
    const selection = this._selectionState();
    const isFloating = this.isFloatingMode();
    return isFloating && selection?.hasSelection === true;
  });

  constructor() {
    // Initialize responsive behavior
    this.initializeResponsiveBehavior();
    
    // Initialize selection tracking for floating toolbar
    this.initializeSelectionTracking();
    
    // Initialize keyboard navigation
    this.initializeKeyboardNavigation();
  }

  /**
   * Update toolbar configuration
   */
  updateConfig(config: Partial<ToolbarConfig> | ToolbarConfig): void {
    const currentConfig = this._config();
    const newConfig = { ...currentConfig, ...config };
    this._config.set(newConfig);
    
    this.emitEvent('stateChange', {
      state: this.state(),
      previousState: { ...this.state(), config: currentConfig },
      changes: ['config'],
      timestamp: new Date()
    });
  }

  /**
   * Set toolbar mode
   */
  setMode(mode: ToolbarMode): void {
    const currentMode = this.currentMode();
    const config = this._config();
    this.updateConfig({ ...config, mode });
    
    this.emitEvent('modeChange', {
      mode,
      previousMode: currentMode,
      timestamp: new Date()
    });
  }

  /**
   * Toggle button active state
   */
  toggleButton(buttonId: string): void {
    const activeButtons = new Set(this._activeButtons());
    const button = this.getButton(buttonId);
    
    if (!button) return;
    
    const wasActive = activeButtons.has(buttonId);
    if (wasActive) {
      activeButtons.delete(buttonId);
    } else {
      activeButtons.add(buttonId);
    }
    
    this._activeButtons.set(activeButtons);
    
    this.emitEvent('buttonToggle', {
      button,
      active: !wasActive,
      previousActive: wasActive,
      timestamp: new Date()
    });
  }

  /**
   * Set button active state
   */
  setButtonActive(buttonId: string, active: boolean): void {
    const activeButtons = new Set(this._activeButtons());
    const wasActive = activeButtons.has(buttonId);
    
    if (active) {
      activeButtons.add(buttonId);
    } else {
      activeButtons.delete(buttonId);
    }
    
    if (wasActive !== active) {
      this._activeButtons.set(activeButtons);
      
      const button = this.getButton(buttonId);
      if (button) {
        this.emitEvent('buttonToggle', {
          button,
          active,
          previousActive: wasActive,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Set button enabled state
   */
  setButtonEnabled(buttonId: string, enabled: boolean): void {
    const disabledButtons = new Set(this._disabledButtons());
    
    if (enabled) {
      disabledButtons.delete(buttonId);
    } else {
      disabledButtons.add(buttonId);
    }
    
    this._disabledButtons.set(disabledButtons);
  }

  /**
   * Set button value
   */
  setButtonValue(buttonId: string, value: any): void {
    const buttonValues = new Map(this._buttonValues());
    buttonValues.set(buttonId, value);
    this._buttonValues.set(buttonValues);
  }

  /**
   * Get button value
   */
  getButtonValue(buttonId: string): any {
    return this._buttonValues().get(buttonId);
  }

  /**
   * Execute button action
   */
  executeButton(buttonId: string, event?: Event): void {
    const button = this.getButton(buttonId);
    if (!button || this._disabledButtons().has(buttonId)) {
      return;
    }

    if (button.type === 'toggle') {
      this.toggleButton(buttonId);
    }

    if (typeof button.action === 'function') {
      button.action();
    }

    this.emitEvent('buttonClick', {
      button,
      action: button.action,
      timestamp: new Date(),
      originalEvent: event
    });
  }

  /**
   * Set toolbar visibility
   */
  setVisible(visible: boolean): void {
    this._visible.set(visible);
  }

  /**
   * Get button by ID
   */
  private getButton(buttonId: string): ToolbarButton | undefined {
    const config = this._config();
    for (const section of config.sections) {
      const button = section.buttons.find(b => b.id === buttonId);
      if (button) return button;
    }
    return undefined;
  }

  /**
   * Add event listener
   */
  addEventListener<K extends keyof ToolbarEvents>(
    eventType: K, 
    handler: (event: ToolbarEvents[K]) => void
  ): void {
    if (!this._eventHandlers.has(eventType)) {
      this._eventHandlers.set(eventType, new Set());
    }
    this._eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Remove event listener
   */
  removeEventListener<K extends keyof ToolbarEvents>(
    eventType: K, 
    handler: (event: ToolbarEvents[K]) => void
  ): void {
    const handlers = this._eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent<K extends keyof ToolbarEvents>(
    eventType: K, 
    event: ToolbarEvents[K]
  ): void {
    const handlers = this._eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  /**
   * Initialize responsive behavior
   */
  private initializeResponsiveBehavior(): void {
    const resize$ = fromEvent(window, 'resize').pipe(
      debounceTime(150),
      takeUntilDestroyed()
    );

    // Initial check
    this.updateMobileMode();

    // Listen for resize events
    resize$.subscribe(() => {
      this.updateMobileMode();
    });
  }

  /**
   * Update mobile mode based on viewport size
   */
  private updateMobileMode(): void {
    const breakpoints = this._config().breakpoints || DEFAULT_BREAKPOINTS;
    const isMobile = window.innerWidth <= breakpoints.mobile!;
    this._mobileMode.set(isMobile);
  }

  /**
   * Initialize selection tracking for floating toolbar
   */
  private initializeSelectionTracking(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const selectionChange$ = fromEvent(document, 'selectionchange').pipe(
      throttleTime(100),
      takeUntilDestroyed()
    );

    const mouseUp$ = fromEvent(document, 'mouseup').pipe(
      debounceTime(50),
      takeUntilDestroyed()
    );

    merge(selectionChange$, mouseUp$).subscribe(() => {
      this.updateSelectionState();
    });
  }

  /**
   * Update current selection state
   */
  private updateSelectionState(): void {
    const selection = window.getSelection();
    if (!selection) {
      this._selectionState.set(undefined);
      return;
    }

    const hasSelection = !selection.isCollapsed && selection.toString().trim().length > 0;
    
    if (hasSelection) {
      const range = selection.getRangeAt(0);
      const bounds = range.getBoundingClientRect();
      const commonAncestor = range.commonAncestorContainer;
      const element = commonAncestor.nodeType === Node.ELEMENT_NODE 
        ? commonAncestor as HTMLElement
        : commonAncestor.parentElement;

      this._selectionState.set({
        hasSelection: true,
        text: selection.toString(),
        range,
        bounds,
        element: element || undefined
      });
    } else {
      this._selectionState.set({
        hasSelection: false
      });
    }
  }

  /**
   * Initialize keyboard navigation
   */
  private initializeKeyboardNavigation(): void {
    effect(() => {
      const keyboardNav = this._config().keyboardNavigation;
      this._keyboardNavigation.set(keyboardNav || false);
    });

    // Listen for keyboard events when navigation is enabled
    const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      takeUntilDestroyed()
    );

    keydown$.subscribe(event => {
      if (this._keyboardNavigation()) {
        this.handleKeyboardEvent(event);
      }
    });
  }

  /**
   * Handle keyboard navigation events
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    // Check for toolbar shortcuts
    const config = this._config();
    for (const section of config.sections) {
      for (const button of section.buttons) {
        if (button.shortcut && this.matchesShortcut(event, button.shortcut)) {
          event.preventDefault();
          this.executeButton(button.id, event);
          return;
        }
      }
    }
  }

  /**
   * Check if keyboard event matches shortcut
   */
  private matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
    const parts = shortcut.toLowerCase().split('+');
    const key = parts.pop();
    
    const hasCtrl = parts.includes('ctrl') ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
    const hasShift = parts.includes('shift') ? event.shiftKey : !event.shiftKey;
    const hasAlt = parts.includes('alt') ? event.altKey : !event.altKey;
    
    return hasCtrl && hasShift && hasAlt && event.key.toLowerCase() === key;
  }
}