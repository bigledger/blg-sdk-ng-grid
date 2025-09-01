import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, fromEvent } from 'rxjs';
import { debounceTime, throttleTime, map } from 'rxjs/operators';

import {
  SetFilterValue,
  SetFilterSortBy,
  SetFilterValueSelectedEvent,
  SetFilterPerformanceMetrics
} from '../set-filter.interface';

/**
 * Set Filter Value List Component
 * 
 * Displays a virtualized list of filter values with advanced features:
 * - Virtual scrolling for 100k+ values
 * - Mini distribution charts
 * - Color coding by frequency
 * - Multiple selection modes
 * - Drag and drop reordering
 * - Keyboard navigation
 * - Performance monitoring
 */
@Component({
  selector: 'blg-set-filter-value-list',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  template: `
    <div class="blg-set-filter-value-list" 
         [class]="containerClasses()"
         [style.height.px]="containerHeight()">
      
      <!-- Sort controls -->
      <div class="blg-set-filter-value-list__controls" *ngIf="showSortControls">
        <div class="blg-set-filter-value-list__sort">
          <label>Sort by:</label>
          <select 
            [value]="sortBy()" 
            (change)="onSortByChanged($event)"
            class="blg-set-filter-value-list__sort-select"
            aria-label="Sort values by">
            <option value="count">Frequency</option>
            <option value="value">Value</option>
            <option value="display">Display</option>
            <option value="percentage">Percentage</option>
            <option value="alphabetical">A-Z</option>
            <option value="recent">Recent</option>
          </select>
          
          <button 
            class="blg-set-filter-value-list__sort-order"
            [class.desc]="sortOrder() === 'desc'"
            (click)="toggleSortOrder()"
            [title]="sortOrder() === 'asc' ? 'Sort ascending' : 'Sort descending'"
            aria-label="Toggle sort order">
            <i class="icon-sort-{{sortOrder()}}" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Selection controls -->
        <div class="blg-set-filter-value-list__selection-info">
          <span class="blg-set-filter-value-list__count">
            {{ selectedCount() }}/{{ displayedValues().length }} selected
          </span>
          
          <div class="blg-set-filter-value-list__selection-controls" *ngIf="allowBulkActions">
            <button
              class="blg-set-filter-value-list__bulk-btn"
              (click)="selectAllVisible()"
              [disabled]="allVisibleSelected()"
              title="Select all visible values"
              aria-label="Select all visible values">
              All
            </button>
            
            <button
              class="blg-set-filter-value-list__bulk-btn"
              (click)="clearAllVisible()"
              [disabled]="noneVisibleSelected()"
              title="Clear all visible selections"
              aria-label="Clear all visible selections">
              None
            </button>
            
            <button
              class="blg-set-filter-value-list__bulk-btn"
              (click)="invertAllVisible()"
              title="Invert visible selections"
              aria-label="Invert visible selections">
              Invert
            </button>
          </div>
        </div>
      </div>

      <!-- Virtual scrolling container -->
      <cdk-virtual-scroll-viewport 
        #viewport
        *ngIf="virtualScrolling && displayedValues().length > virtualScrollThreshold"
        [itemSize]="itemHeight"
        [minBufferPx]="bufferSize"
        [maxBufferPx]="bufferSize * 2"
        class="blg-set-filter-value-list__viewport"
        (scrolledIndexChange)="onScrollIndexChanged($event)"
        [attr.aria-label]="'Value list with ' + displayedValues().length + ' items'">
        
        <div 
          *cdkVirtualFor="let value of displayedValues(); let i = index; trackBy: trackByValue"
          class="blg-set-filter-value-list__item-container"
          [attr.data-index]="i">
          <blg-set-filter-value-item
            [value]="value"
            [index]="i"
            [isSelected]="selectedValues().has(value.value)"
            [showCount]="showCounts"
            [showChart]="showCharts"
            [showColorCoding]="showColorCoding"
            [showIcon]="showIcons"
            [compactMode]="compactMode"
            [customRenderer]="value.customRenderer"
            (selectionChanged)="onValueSelectionChanged($event, value)"
            (doubleClick)="onValueDoubleClick(value)"
            (contextMenu)="onValueContextMenu($event, value)">
          </blg-set-filter-value-item>
        </div>
      </cdk-virtual-scroll-viewport>

      <!-- Regular scrolling container for small lists -->
      <div 
        *ngIf="!virtualScrolling || displayedValues().length <= virtualScrollThreshold"
        class="blg-set-filter-value-list__regular-container"
        #regularContainer
        [style.max-height.px]="containerHeight()"
        [attr.aria-label]="'Value list with ' + displayedValues().length + ' items'">
        
        <blg-set-filter-value-item
          *ngFor="let value of displayedValues(); let i = index; trackBy: trackByValue"
          [value]="value"
          [index]="i"
          [isSelected]="selectedValues().has(value.value)"
          [showCount]="showCounts"
          [showChart]="showCharts"
          [showColorCoding]="showColorCoding"
          [showIcon]="showIcons"
          [compactMode]="compactMode"
          [customRenderer]="value.customRenderer"
          (selectionChanged)="onValueSelectionChanged($event, value)"
          (doubleClick)="onValueDoubleClick(value)"
          (contextMenu)="onValueContextMenu($event, value)">
        </blg-set-filter-value-item>
      </div>

      <!-- Performance overlay -->
      <div class="blg-set-filter-value-list__performance" 
           *ngIf="showPerformanceOverlay && performanceMetrics()">
        <div class="blg-set-filter-value-list__perf-item">
          <i class="icon-clock" aria-hidden="true"></i>
          {{ performanceMetrics()?.renderingTime?.toFixed(1) }}ms
        </div>
        <div class="blg-set-filter-value-list__perf-item">
          <i class="icon-memory" aria-hidden="true"></i>
          {{ formatMemoryUsage(performanceMetrics()?.totalMemoryUsage || 0) }}
        </div>
        <div class="blg-set-filter-value-list__perf-item">
          <i class="icon-scroll" aria-hidden="true"></i>
          {{ performanceMetrics()?.scrollPerformance?.toFixed(1) }}fps
        </div>
      </div>

      <!-- Loading overlay -->
      <div class="blg-set-filter-value-list__loading" *ngIf="isLoading">
        <div class="blg-set-filter-value-list__loading-spinner" aria-hidden="true"></div>
        <p>Processing {{ values.length }} values...</p>
      </div>
    </div>

    <!-- Context menu -->
    <div class="blg-set-filter-value-list__context-menu"
         *ngIf="contextMenuVisible"
         [style.left.px]="contextMenuPosition.x"
         [style.top.px]="contextMenuPosition.y"
         (clickOutside)="hideContextMenu()">
      
      <button 
        class="blg-set-filter-value-list__context-item"
        (click)="copyValueToClipboard(contextValue)"
        [disabled]="!contextValue">
        <i class="icon-copy" aria-hidden="true"></i>
        Copy Value
      </button>
      
      <button 
        class="blg-set-filter-value-list__context-item"
        (click)="selectSimilarValues(contextValue)"
        [disabled]="!contextValue">
        <i class="icon-similar" aria-hidden="true"></i>
        Select Similar
      </button>
      
      <button 
        class="blg-set-filter-value-list__context-item"
        (click)="excludeValue(contextValue)"
        [disabled]="!contextValue">
        <i class="icon-exclude" aria-hidden="true"></i>
        Exclude Value
      </button>
      
      <div class="blg-set-filter-value-list__context-divider"></div>
      
      <button 
        class="blg-set-filter-value-list__context-item"
        (click)="showValueDetails(contextValue)"
        [disabled]="!contextValue">
        <i class="icon-info" aria-hidden="true"></i>
        Value Details
      </button>
    </div>
  `,
  styleUrls: ['./set-filter-value-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'blg-set-filter-value-list-host',
    '[class.compact]': 'compactMode',
    '[class.loading]': 'isLoading',
    '(keydown)': 'onKeyDown($event)',
    'tabindex': '0',
    'role': 'listbox',
    '[attr.aria-multiselectable]': 'true',
    '[attr.aria-label]': '"Filter values list with " + displayedValues().length + " items"'
  }
})
export class SetFilterValueListComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  // Inputs
  @Input() values: SetFilterValue[] = [];
  @Input() selectedValues = signal<Set<any>>(new Set());
  @Input() sortBy = signal<SetFilterSortBy>('count');
  @Input() sortOrder = signal<'asc' | 'desc'>('desc');
  
  // Display options
  @Input() showCounts = true;
  @Input() showCharts = true;
  @Input() showColorCoding = true;
  @Input() showIcons = true;
  @Input() compactMode = false;
  
  // Virtual scrolling options
  @Input() virtualScrolling = true;
  @Input() itemHeight = 32;
  @Input() bufferSize = 200;
  @Input() virtualScrollThreshold = 100;
  @Input() containerHeight = signal(400);
  
  // Behavior options
  @Input() allowBulkActions = true;
  @Input() showSortControls = true;
  @Input() showPerformanceOverlay = false;
  @Input() enableDragDrop = false;
  @Input() enableKeyboardNavigation = true;

  // Outputs
  @Output() valueSelected = new EventEmitter<SetFilterValueSelectedEvent>();
  @Output() sortChanged = new EventEmitter<{sortBy: SetFilterSortBy; sortOrder: 'asc' | 'desc'}>();
  @Output() performanceUpdate = new EventEmitter<Partial<SetFilterPerformanceMetrics>>();
  @Output() bulkAction = new EventEmitter<{action: string; values: any[]}>();

  // ViewChild references
  @ViewChild('viewport', { static: false }) viewport?: CdkVirtualScrollViewport;
  @ViewChild('regularContainer', { static: false }) regularContainer?: ElementRef;

  // State signals
  private _displayedValues = signal<SetFilterValue[]>([]);
  private _isLoading = signal(false);
  private _performanceMetrics = signal<SetFilterPerformanceMetrics | null>(null);
  private _focusedIndex = signal(-1);
  
  // Context menu state
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextValue: SetFilterValue | null = null;

  // Computed values
  readonly displayedValues = computed(() => {
    const values = this.values || [];
    this._displayedValues.set(values);
    return values;
  });
  
  readonly isLoading = this._isLoading.asReadonly();
  readonly performanceMetrics = this._performanceMetrics.asReadonly();
  readonly focusedIndex = this._focusedIndex.asReadonly();
  
  readonly selectedCount = computed(() => {
    return Array.from(this.selectedValues()).filter(value =>
      this.displayedValues().some(v => v.value === value)
    ).length;
  });
  
  readonly allVisibleSelected = computed(() => {
    const visible = this.displayedValues();
    const selected = this.selectedValues();
    return visible.length > 0 && visible.every(v => selected.has(v.value));
  });
  
  readonly noneVisibleSelected = computed(() => {
    const visible = this.displayedValues();
    const selected = this.selectedValues();
    return visible.every(v => !selected.has(v.value));
  });
  
  readonly containerClasses = computed(() => ({
    'blg-set-filter-value-list--virtual': this.virtualScrolling && this.displayedValues().length > this.virtualScrollThreshold,
    'blg-set-filter-value-list--regular': !this.virtualScrolling || this.displayedValues().length <= this.virtualScrollThreshold,
    'blg-set-filter-value-list--compact': this.compactMode,
    'blg-set-filter-value-list--loading': this.isLoading(),
    'blg-set-filter-value-list--large': this.displayedValues().length > 1000,
    'blg-set-filter-value-list--charts': this.showCharts,
    'blg-set-filter-value-list--colors': this.showColorCoding
  }));

  // Performance monitoring
  private renderStartTime = 0;
  private scrollStartTime = 0;
  private frameCount = 0;
  private lastScrollTime = 0;

  ngOnInit() {
    this.initializeComponent();
    this.setupPerformanceMonitoring();
    this.measureInitialRender();
  }

  ngOnDestroy() {
    // Cleanup handled by destroyRef
  }

  // ============================================
  // Component Initialization
  // ============================================

  private initializeComponent() {
    // Update displayed values when input changes
    effect(() => {
      const values = this.values;
      if (values) {
        this.updateDisplayedValues(values);
      }
    });

    // Monitor selection changes
    effect(() => {
      const selectedCount = this.selectedCount();
      // Emit performance update if needed
      if (this.showPerformanceOverlay) {
        this.updateSelectionPerformance(selectedCount);
      }
    });
  }

  private setupPerformanceMonitoring() {
    if (this.showPerformanceOverlay) {
      // Monitor scroll performance
      if (this.viewport) {
        fromEvent(this.viewport.elementRef.nativeElement, 'scroll')
          .pipe(
            throttleTime(16), // 60fps
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => {
            this.measureScrollPerformance();
          });
      }

      // Monitor rendering performance
      this.setupRenderingMonitoring();
    }
  }

  private measureInitialRender() {
    this.renderStartTime = performance.now();
    
    // Measure after view init
    requestAnimationFrame(() => {
      const renderTime = performance.now() - this.renderStartTime;
      this.updatePerformanceMetrics({ renderingTime: renderTime });
    });
  }

  // ============================================
  // Data Management
  // ============================================

  private updateDisplayedValues(values: SetFilterValue[]) {
    this._displayedValues.set(values);
    this.measureRenderingTime();
  }

  private measureRenderingTime() {
    const startTime = performance.now();
    
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      this.updatePerformanceMetrics({ renderingTime: renderTime });
    });
  }

  // ============================================
  // Selection Management
  // ============================================

  onValueSelectionChanged(isSelected: boolean, value: SetFilterValue) {
    const event: SetFilterValueSelectedEvent = {
      type: isSelected ? 'valueSelected' : 'valueDeselected',
      value: value.value,
      displayValue: value.displayValue,
      isSelected,
      totalSelected: this.selectedCount(),
      source: 'click'
    };
    
    this.valueSelected.emit(event);
    
    // Update access tracking
    this.updateValueAccess(value);
  }

  onValueDoubleClick(value: SetFilterValue) {
    // Double-click to toggle and apply
    const isSelected = this.selectedValues().has(value.value);
    this.onValueSelectionChanged(!isSelected, value);
    
    // Could emit a special "apply" event here
  }

  onValueContextMenu(event: MouseEvent, value: SetFilterValue) {
    event.preventDefault();
    this.showContextMenu(event, value);
  }

  // ============================================
  // Bulk Actions
  // ============================================

  selectAllVisible() {
    const visibleValues = this.displayedValues().map(v => v.value);
    this.emitBulkAction('selectAll', visibleValues);
  }

  clearAllVisible() {
    const visibleValues = this.displayedValues().map(v => v.value);
    this.emitBulkAction('clearAll', visibleValues);
  }

  invertAllVisible() {
    const visibleValues = this.displayedValues().map(v => v.value);
    this.emitBulkAction('invert', visibleValues);
  }

  private emitBulkAction(action: string, values: any[]) {
    this.bulkAction.emit({ action, values });
    
    // Also emit individual selection events for each value
    values.forEach(value => {
      const filterValue = this.displayedValues().find(v => v.value === value);
      if (filterValue) {
        const isSelected = action === 'selectAll' || 
                          (action === 'invert' && !this.selectedValues().has(value));
        
        this.onValueSelectionChanged(isSelected, filterValue);
      }
    });
  }

  // ============================================
  // Sorting
  // ============================================

  onSortByChanged(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSortBy = target.value as SetFilterSortBy;
    this.sortBy.set(newSortBy);
    this.emitSortChange();
  }

  toggleSortOrder() {
    const newOrder = this.sortOrder() === 'asc' ? 'desc' : 'asc';
    this.sortOrder.set(newOrder);
    this.emitSortChange();
  }

  private emitSortChange() {
    this.sortChanged.emit({
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    });
  }

  // ============================================
  // Context Menu
  // ============================================

  private showContextMenu(event: MouseEvent, value: SetFilterValue) {
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextValue = value;
    this.contextMenuVisible = true;
  }

  hideContextMenu() {
    this.contextMenuVisible = false;
    this.contextValue = null;
  }

  copyValueToClipboard(value: SetFilterValue | null) {
    if (value && navigator.clipboard) {
      navigator.clipboard.writeText(value.displayValue);
    }
    this.hideContextMenu();
  }

  selectSimilarValues(value: SetFilterValue | null) {
    if (!value) return;
    
    // Find values that are similar (this is a simplified implementation)
    const similarValues = this.displayedValues()
      .filter(v => v.displayValue.toLowerCase().includes(value.displayValue.toLowerCase().substring(0, 3)))
      .map(v => v.value);
    
    this.emitBulkAction('selectSimilar', similarValues);
    this.hideContextMenu();
  }

  excludeValue(value: SetFilterValue | null) {
    if (!value) return;
    
    this.emitBulkAction('exclude', [value.value]);
    this.hideContextMenu();
  }

  showValueDetails(value: SetFilterValue | null) {
    if (!value) return;
    
    // This would open a details dialog
    console.log('Value details:', value);
    this.hideContextMenu();
  }

  // ============================================
  // Keyboard Navigation
  // ============================================

  onKeyDown(event: KeyboardEvent) {
    if (!this.enableKeyboardNavigation) return;
    
    const values = this.displayedValues();
    let currentIndex = this.focusedIndex();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        currentIndex = Math.min(currentIndex + 1, values.length - 1);
        this._focusedIndex.set(currentIndex);
        this.scrollToIndex(currentIndex);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this._focusedIndex.set(currentIndex);
        this.scrollToIndex(currentIndex);
        break;
        
      case 'Space':
      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < values.length) {
          const value = values[currentIndex];
          const isSelected = this.selectedValues().has(value.value);
          this.onValueSelectionChanged(!isSelected, value);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        this._focusedIndex.set(0);
        this.scrollToIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        const lastIndex = values.length - 1;
        this._focusedIndex.set(lastIndex);
        this.scrollToIndex(lastIndex);
        break;
        
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.selectAllVisible();
        }
        break;
    }
  }

  private scrollToIndex(index: number) {
    if (this.viewport) {
      this.viewport.scrollToIndex(index);
    } else if (this.regularContainer) {
      const container = this.regularContainer.nativeElement;
      const itemHeight = this.compactMode ? 24 : this.itemHeight;
      const scrollTop = index * itemHeight;
      container.scrollTop = scrollTop;
    }
  }

  // ============================================
  // Virtual Scrolling
  // ============================================

  onScrollIndexChanged(index: number) {
    // Update focused index when scrolling
    this._focusedIndex.set(index);
    this.measureScrollPerformance();
  }

  trackByValue = (index: number, value: SetFilterValue): any => {
    return value.value;
  };

  // ============================================
  // Performance Monitoring
  // ============================================

  private setupRenderingMonitoring() {
    // Use ResizeObserver to monitor rendering performance
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        this.measureRenderingTime();
      });
      
      // Observe the container
      const element = this.viewport?.elementRef.nativeElement || this.regularContainer?.nativeElement;
      if (element) {
        resizeObserver.observe(element);
      }
    }
  }

  private measureScrollPerformance() {
    const now = performance.now();
    
    if (this.lastScrollTime > 0) {
      const deltaTime = now - this.lastScrollTime;
      const fps = 1000 / deltaTime;
      
      this.updatePerformanceMetrics({ scrollPerformance: fps });
    }
    
    this.lastScrollTime = now;
  }

  private updateSelectionPerformance(selectedCount: number) {
    const startTime = performance.now();
    
    // Simulate selection processing time
    requestAnimationFrame(() => {
      const selectionTime = performance.now() - startTime;
      this.updatePerformanceMetrics({ averageSelectionTime: selectionTime });
    });
  }

  private updatePerformanceMetrics(update: Partial<SetFilterPerformanceMetrics>) {
    const current = this._performanceMetrics() || {} as SetFilterPerformanceMetrics;
    const updated = { ...current, ...update };
    this._performanceMetrics.set(updated);
    this.performanceUpdate.emit(update);
  }

  private updateValueAccess(value: SetFilterValue) {
    // Track value access for analytics
    value.lastAccessed = new Date();
    value.accessCount = (value.accessCount || 0) + 1;
  }

  // ============================================
  // Utility Methods
  // ============================================

  formatMemoryUsage(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)}${units[unitIndex]}`;
  }

  // Estimate memory usage (simplified)
  private estimateMemoryUsage(): number {
    const baseSize = 100; // Base component size in bytes
    const valueSize = 200; // Average size per value in bytes
    return baseSize + (this.displayedValues().length * valueSize);
  }
}