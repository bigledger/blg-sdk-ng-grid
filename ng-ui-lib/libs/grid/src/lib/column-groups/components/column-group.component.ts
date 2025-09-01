import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  ElementRef,
  Renderer2,
  inject,
  signal,
  computed,
  effect,
  ViewChildren,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger, state } from '@angular/animations';
import { CdkDrag, CdkDropList, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { ColumnDefinition } from '@blg/core';
import {
  ColumnGroupDefinition,
  ColumnGroupApi,
  ColumnGroupAction,
  ColumnGroupHeaderParams,
  ColumnGroupInteractionEvent
} from '../interfaces/column-group.interface';
import { ColumnGroupManagerService } from '../services/column-group-manager.service';
import { ColumnGroupAnimationService } from '../services/column-group-animation.service';

/**
 * Advanced Column Group Component with multi-level nesting and rich interactions
 * Supports unlimited depth, drag-and-drop, animations, and custom rendering
 */
@Component({
  selector: 'blg-column-group',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    OverlayModule
  ],
  templateUrl: './column-group.component.html',
  styleUrls: ['./column-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({
        height: '*',
        opacity: 1,
        transform: 'scaleY(1)'
      })),
      state('collapsed', style({
        height: '0px',
        opacity: 0,
        transform: 'scaleY(0)',
        overflow: 'hidden'
      })),
      transition('expanded <=> collapsed', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('groupHover', [
      state('normal', style({ transform: 'translateY(0px)' })),
      state('hover', style({ transform: 'translateY(-2px)' })),
      transition('normal <=> hover', animate('200ms ease-out'))
    ])
  ]
})
export class ColumnGroupComponent implements OnInit, OnDestroy {
  @Input({ required: true }) group!: ColumnGroupDefinition;
  @Input() level: number = 0;
  @Input() maxDepth: number = 10;
  @Input() dragEnabled: boolean = true;
  @Input() animationsEnabled: boolean = true;
  @Input() showGroupCount: boolean = true;
  @Input() showGroupActions: boolean = true;
  @Input() customHeaderTemplate?: TemplateRef<any>;
  @Input() readonly: boolean = false;

  @Output() groupToggled = new EventEmitter<{ groupId: string; collapsed: boolean }>();
  @Output() groupAction = new EventEmitter<{ groupId: string; action: ColumnGroupAction }>();
  @Output() groupDragged = new EventEmitter<{ groupId: string; previousIndex: number; currentIndex: number }>();
  @Output() groupHovered = new EventEmitter<{ groupId: string; hovered: boolean }>();
  @Output() groupFocused = new EventEmitter<{ groupId: string; focused: boolean }>();
  @Output() groupRightClick = new EventEmitter<{ groupId: string; event: MouseEvent }>();

  @ViewChild('headerElement', { static: true }) headerElement!: ElementRef<HTMLElement>;
  @ViewChild('contentElement', { static: true }) contentElement!: ElementRef<HTMLElement>;
  @ViewChild('actionMenu', { static: false }) actionMenu?: TemplateRef<any>;
  
  @ViewChildren('childGroups') childGroups!: QueryList<ColumnGroupComponent>;

  // Injected services
  private readonly groupManager = inject(ColumnGroupManagerService);
  private readonly animationService = inject(ColumnGroupAnimationService);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  // Component state
  private readonly destroy$ = new Subject<void>();
  private readonly hover$ = new Subject<boolean>();
  
  readonly collapsed = signal<boolean>(false);
  readonly visible = signal<boolean>(true);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly hovered = signal<boolean>(false);
  readonly focused = signal<boolean>(false);
  readonly dragActive = signal<boolean>(false);
  readonly actionMenuOpen = signal<boolean>(false);

  // Computed properties
  readonly hasChildren = computed(() => 
    this.group?.children && this.group.children.length > 0
  );

  readonly childGroups$ = computed(() => {
    if (!this.group?.children) return [];
    return this.group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
  });

  readonly childColumns = computed(() => {
    if (!this.group?.children) return [];
    return this.group.children.filter(child => !('children' in child)) as ColumnDefinition[];
  });

  readonly groupDepth = computed(() => this.calculateDepth(this.group));

  readonly isExpandable = computed(() => 
    this.group?.collapsible !== false && this.hasChildren()
  );

  readonly showExpandIcon = computed(() => 
    this.isExpandable() && !this.readonly
  );

  readonly groupClasses = computed(() => {
    const classes = ['blg-column-group'];
    classes.push(`level-${this.level}`);
    
    if (this.collapsed()) classes.push('collapsed');
    if (!this.visible()) classes.push('hidden');
    if (this.hovered()) classes.push('hovered');
    if (this.focused()) classes.push('focused');
    if (this.dragActive()) classes.push('dragging');
    if (this.group.sticky) classes.push('sticky');
    if (this.readonly) classes.push('readonly');
    
    if (this.group.headerClass) {
      const headerClass = typeof this.group.headerClass === 'function' 
        ? this.group.headerClass(this.getHeaderParams())
        : this.group.headerClass;
      
      if (Array.isArray(headerClass)) {
        classes.push(...headerClass);
      } else if (typeof headerClass === 'string') {
        classes.push(headerClass);
      }
    }

    return classes.join(' ');
  });

  readonly groupStyles = computed(() => {
    const styles: { [key: string]: string } = {};
    
    // Apply custom CSS properties
    if (this.group.cssProperties) {
      Object.assign(styles, this.group.cssProperties);
    }

    // Apply visual options
    if (this.group.visual) {
      const visual = this.group.visual;
      
      // Gradient background
      if (visual.gradient?.enabled) {
        const { startColor = '#f0f0f0', endColor = '#ffffff', direction = 'horizontal' } = visual.gradient;
        const gradientDirection = direction === 'vertical' ? 'to bottom' : 
                                direction === 'diagonal' ? 'to bottom right' : 'to right';
        styles['background'] = `linear-gradient(${gradientDirection}, ${startColor}, ${endColor})`;
      }

      // Shadow
      if (visual.shadow?.enabled) {
        const { color = '#000', blur = 4, spread = 0, offsetX = 0, offsetY = 2 } = visual.shadow;
        styles['box-shadow'] = `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
      }

      // Border
      if (visual.border) {
        const { width = 1, style = 'solid', color = '#ddd', radius = 0 } = visual.border;
        styles['border'] = `${width}px ${style} ${color}`;
        if (radius > 0) styles['border-radius'] = `${radius}px`;
      }
    }

    return styles;
  });

  readonly availableActions = computed(() => {
    const actions: ColumnGroupAction[] = [];
    
    if (!this.readonly) {
      // Default actions
      if (this.isExpandable()) {
        actions.push({
          id: 'toggle',
          name: this.collapsed() ? 'Expand' : 'Collapse',
          icon: this.collapsed() ? 'expand' : 'collapse',
          handler: () => this.toggleCollapsed(),
          enabled: true,
          visible: true,
          tooltip: `${this.collapsed() ? 'Expand' : 'Collapse'} this group`
        });
      }

      actions.push(
        {
          id: 'hide',
          name: 'Hide Group',
          icon: 'visibility_off',
          handler: () => this.hideGroup(),
          enabled: true,
          visible: true,
          tooltip: 'Hide this group'
        },
        {
          id: 'settings',
          name: 'Group Settings',
          icon: 'settings',
          handler: () => this.openSettings(),
          enabled: true,
          visible: true,
          tooltip: 'Configure group settings'
        }
      );

      // Custom actions from group definition
      if (this.group.advanced?.operations?.customActions) {
        actions.push(...this.group.advanced.operations.customActions);
      }
    }

    return actions.filter(action => {
      const visible = typeof action.visible === 'function' 
        ? action.visible(this.group) 
        : action.visible !== false;
      const enabled = typeof action.enabled === 'function' 
        ? action.enabled(this.group) 
        : action.enabled !== false;
      return visible && enabled;
    });
  });

  readonly headerParams = computed((): ColumnGroupHeaderParams => ({
    columnGroup: this.group,
    displayName: this.group.headerName,
    api: this.groupManager.getApi(),
    context: null,
    collapsed: this.collapsed(),
    actions: this.availableActions()
  }));

  constructor() {
    // Initialize component state from group manager
    effect(() => {
      const collapsedStates = this.groupManager.collapsedStates();
      const visibilityStates = this.groupManager.visibilityStates();
      
      this.collapsed.set(collapsedStates[this.group?.id] || false);
      this.visible.set(visibilityStates[this.group?.id] !== false);
    });

    // Setup hover debouncing
    this.hover$
      .pipe(
        debounceTime(50),
        takeUntil(this.destroy$)
      )
      .subscribe(hovered => {
        this.hovered.set(hovered);
        this.groupHovered.emit({ groupId: this.group.id, hovered });
      });
  }

  ngOnInit(): void {
    this.initializeGroupState();
    this.setupEventListeners();
    this.applyInitialStyles();
    this.trackGroupMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // Public Methods
  // ========================================

  /**
   * Toggle the collapsed state of the group
   */
  toggleCollapsed(): void {
    if (!this.isExpandable() || this.readonly) return;

    const newCollapsed = !this.collapsed();
    this.groupManager.setCollapsed(this.group.id, newCollapsed);
    this.groupToggled.emit({ groupId: this.group.id, collapsed: newCollapsed });
    
    if (this.animationsEnabled) {
      this.animateToggle(newCollapsed);
    }

    this.trackInteraction('toggle', { collapsed: newCollapsed });
  }

  /**
   * Execute a group action
   */
  executeAction(action: ColumnGroupAction): void {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = action.handler(this.group, this.getHeaderParams());
      
      if (result instanceof Promise) {
        result
          .then(() => {
            this.loading.set(false);
            this.groupAction.emit({ groupId: this.group.id, action });
            this.trackInteraction('action', { actionId: action.id });
          })
          .catch(error => {
            this.error.set(error.message || 'Action failed');
            this.loading.set(false);
          });
      } else {
        this.loading.set(false);
        this.groupAction.emit({ groupId: this.group.id, action });
        this.trackInteraction('action', { actionId: action.id });
      }
    } catch (error) {
      this.error.set((error as Error).message || 'Action failed');
      this.loading.set(false);
    }
  }

  /**
   * Handle drag start
   */
  onDragStart(event: CdkDragDrop<any>): void {
    if (!this.dragEnabled || this.readonly) return;

    this.dragActive.set(true);
    this.trackInteraction('dragStart', { groupId: this.group.id });
  }

  /**
   * Handle drag end
   */
  onDragEnd(event: CdkDragDrop<any>): void {
    this.dragActive.set(false);
    
    if (event.previousIndex !== event.currentIndex) {
      this.groupDragged.emit({
        groupId: this.group.id,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex
      });
      this.trackInteraction('dragEnd', { 
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex 
      });
    }
  }

  /**
   * Handle mouse enter
   */
  onMouseEnter(): void {
    this.hover$.next(true);
  }

  /**
   * Handle mouse leave
   */
  onMouseLeave(): void {
    this.hover$.next(false);
  }

  /**
   * Handle focus
   */
  onFocus(): void {
    this.focused.set(true);
    this.groupFocused.emit({ groupId: this.group.id, focused: true });
  }

  /**
   * Handle blur
   */
  onBlur(): void {
    this.focused.set(false);
    this.groupFocused.emit({ groupId: this.group.id, focused: false });
  }

  /**
   * Handle right click for context menu
   */
  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.groupRightClick.emit({ groupId: this.group.id, event });
    this.actionMenuOpen.set(true);
  }

  /**
   * Handle keyboard events
   */
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (this.isExpandable()) {
          event.preventDefault();
          this.toggleCollapsed();
        }
        break;
      case 'ArrowLeft':
        if (!this.collapsed() && this.isExpandable()) {
          event.preventDefault();
          this.toggleCollapsed();
        }
        break;
      case 'ArrowRight':
        if (this.collapsed() && this.isExpandable()) {
          event.preventDefault();
          this.toggleCollapsed();
        }
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstChild();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastChild();
        break;
    }
  }

  /**
   * Get the current header parameters
   */
  getHeaderParams(): ColumnGroupHeaderParams {
    return this.headerParams();
  }

  /**
   * Expand all child groups recursively
   */
  expandAll(): void {
    this.groupManager.setCollapsed(this.group.id, false);
    this.childGroups.forEach(childGroup => {
      childGroup.expandAll();
    });
  }

  /**
   * Collapse all child groups recursively
   */
  collapseAll(): void {
    this.groupManager.setCollapsed(this.group.id, true);
    this.childGroups.forEach(childGroup => {
      childGroup.collapseAll();
    });
  }

  /**
   * Hide this group
   */
  hideGroup(): void {
    this.groupManager.setGroupVisibility(this.group.id, false);
  }

  /**
   * Show this group
   */
  showGroup(): void {
    this.groupManager.setGroupVisibility(this.group.id, true);
  }

  /**
   * Open group settings
   */
  openSettings(): void {
    // Implementation would open settings dialog
    this.trackInteraction('openSettings', {});
  }

  // ========================================
  // Private Methods
  // ========================================

  private initializeGroupState(): void {
    // Set initial collapsed and visibility states
    this.collapsed.set(this.group.collapsed || false);
    this.visible.set(true);

    // Apply initial visual customizations
    if (this.group.visual) {
      this.applyVisualStyles();
    }
  }

  private setupEventListeners(): void {
    // Listen for window resize for responsive behavior
    if (this.group.advanced?.responsive?.enabled) {
      window.addEventListener('resize', this.handleResize.bind(this));
    }

    // Setup intersection observer for lazy loading
    if (this.group.performance?.lazyLoading?.enabled) {
      this.setupIntersectionObserver();
    }
  }

  private applyInitialStyles(): void {
    const element = this.elementRef.nativeElement;
    
    // Apply level-based indentation
    this.renderer.setStyle(element, 'padding-left', `${this.level * 20}px`);
    
    // Apply sticky positioning if enabled
    if (this.group.sticky) {
      this.renderer.setStyle(element, 'position', 'sticky');
      this.renderer.setStyle(element, 'top', '0');
      this.renderer.setStyle(element, 'z-index', '10');
    }

    // Apply custom height if specified
    if (this.group.headerHeight) {
      this.renderer.setStyle(element, 'height', `${this.group.headerHeight}px`);
    }
  }

  private applyVisualStyles(): void {
    const element = this.elementRef.nativeElement;
    const visual = this.group.visual!;

    // Apply progress indicator if enabled
    if (visual.progressIndicator?.enabled) {
      this.createProgressIndicator(visual.progressIndicator);
    }

    // Add badge if configured
    if (visual.badge?.visible) {
      this.createBadge(visual.badge);
    }

    // Add icon if configured
    if (visual.icon) {
      this.createIcon(visual.icon);
    }
  }

  private animateToggle(collapsed: boolean): void {
    if (!this.animationsEnabled || !this.contentElement) return;

    const content = this.contentElement.nativeElement;
    const animation = this.group.visual?.animations?.expandCollapse;

    if (animation) {
      this.animationService.animate(content, {
        type: animation.type || 'slide',
        duration: animation.duration || 300,
        easing: animation.easing || 'ease-out',
        collapsed
      });
    }
  }

  private calculateDepth(group: ColumnGroupDefinition): number {
    if (!group.children) return 0;
    const childGroups = group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
    return childGroups.length > 0 ? 1 + Math.max(...childGroups.map(child => this.calculateDepth(child))) : 0;
  }

  private trackInteraction(type: string, data: any): void {
    const event: ColumnGroupInteractionEvent = {
      type: type as any,
      groupId: this.group.id,
      timestamp: Date.now(),
      data,
      context: {
        level: this.level,
        hasChildren: this.hasChildren(),
        childrenCount: this.group.children?.length || 0
      }
    };
    
    this.groupManager.triggerAnalyticsEvent(type, event);
  }

  private trackGroupMetrics(): void {
    // Track render time
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      this.groupManager.updatePerformanceMetrics('render', startTime);
    });
  }

  private handleResize(): void {
    // Handle responsive behavior on window resize
    if (this.group.advanced?.responsive?.enabled) {
      // Implementation would adjust group behavior based on new viewport size
    }
  }

  private setupIntersectionObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load content lazily when group becomes visible
            this.loadLazyContent();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.elementRef.nativeElement);
  }

  private loadLazyContent(): void {
    // Implementation would load content lazily
  }

  private focusFirstChild(): void {
    if (this.childGroups.length > 0) {
      this.childGroups.first.elementRef.nativeElement.focus();
    }
  }

  private focusLastChild(): void {
    if (this.childGroups.length > 0) {
      this.childGroups.last.elementRef.nativeElement.focus();
    }
  }

  private createProgressIndicator(config: any): void {
    // Implementation would create visual progress indicator
  }

  private createBadge(config: any): void {
    // Implementation would create visual badge
  }

  private createIcon(config: any): void {
    // Implementation would create group icon
  }
}