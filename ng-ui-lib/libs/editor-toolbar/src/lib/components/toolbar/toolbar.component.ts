import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ToolbarConfig, 
  ToolbarEvents, 
  ToolbarButton, 
  ToolbarSection,
  SelectionState 
} from '../../interfaces/toolbar-config.interface';
import { ToolbarStateService } from '../../services/toolbar-state.service';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';

/**
 * Main toolbar component that orchestrates the entire toolbar system
 */
@Component({
  selector: 'ng-ui-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarButtonComponent
  ],
  template: `
    <div 
      class="blg-toolbar"
      [class]="toolbarClasses()"
      [style]="toolbarStyles()"
      [attr.role]="'toolbar'"
      [attr.aria-label]="config()?.title || 'Editor Toolbar'"
      [hidden]="!visible()"
      (keydown)="onKeyDown($event)"
    >
      <!-- Fixed/Sticky/Inline Toolbar -->
      @if (mode() !== 'floating') {
        <div class="blg-toolbar__container">
          @for (section of visibleSections(); track section.id) {
            <div 
              class="blg-toolbar__section"
              [class.blg-toolbar__section--with-separator]="section.separator"
              [attr.data-section]="section.id"
            >
              @if (section.title && showSectionTitles()) {
                <div class="blg-toolbar__section-title">
                  {{ section.title }}
                </div>
              }
              
              <div class="blg-toolbar__button-group">
                @for (button of section.buttons; track button.id) {
                  @if (button.visible !== false) {
                    <ng-ui-toolbar-button
                      [button]="button"
                      [active]="isButtonActive(button.id)"
                      [disabled]="isButtonDisabled(button.id)"
                      [value]="getButtonValue(button.id)"
                      (click)="onButtonClick(button, $event)"
                      (toggle)="onButtonToggle(button, $event)"
                      (valueChange)="onButtonValueChange(button, $event)"
                    />
                  }
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Floating Toolbar -->
      @if (mode() === 'floating' && shouldShowFloatingToolbar()) {
        <div 
          class="blg-toolbar__floating"
          [style.left.px]="floatingPosition().x"
          [style.top.px]="floatingPosition().y"
          [style.opacity]="floatingOpacity()"
        >
          @for (section of visibleSections(); track section.id) {
            <div class="blg-toolbar__floating-section">
              @for (button of section.buttons; track button.id) {
                @if (button.visible !== false) {
                  <ng-ui-toolbar-button
                    [button]="button"
                    [active]="isButtonActive(button.id)"
                    [disabled]="isButtonDisabled(button.id)"
                    [value]="getButtonValue(button.id)"
                    [compact]="true"
                    (click)="onButtonClick(button, $event)"
                    (toggle)="onButtonToggle(button, $event)"
                    (valueChange)="onButtonValueChange(button, $event)"
                  />
                }
              }
            </div>
          }
        </div>
      }

      <!-- Mobile Overlay -->
      @if (mode() === 'mobile' && mobileMenuOpen()) {
        <div class="blg-toolbar__mobile-overlay" (click)="closeMobileMenu()">
          <div class="blg-toolbar__mobile-menu" (click)="$event.stopPropagation()">
            <div class="blg-toolbar__mobile-header">
              <span>Formatting</span>
              <button 
                class="blg-toolbar__mobile-close" 
                (click)="closeMobileMenu()"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            
            @for (section of visibleSections(); track section.id) {
              <div class="blg-toolbar__mobile-section">
                @if (section.title) {
                  <div class="blg-toolbar__mobile-section-title">
                    {{ section.title }}
                  </div>
                }
                
                @for (button of section.buttons; track button.id) {
                  @if (button.visible !== false) {
                    <ng-ui-toolbar-button
                      [button]="button"
                      [active]="isButtonActive(button.id)"
                      [disabled]="isButtonDisabled(button.id)"
                      [value]="getButtonValue(button.id)"
                      [mobile]="true"
                      (click)="onButtonClick(button, $event)"
                      (toggle)="onButtonToggle(button, $event)"
                      (valueChange)="onButtonValueChange(button, $event)"
                    />
                  }
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-toolbar-host',
    '[class.blg-toolbar-host--mobile]': 'mobileMode()',
    '[class.blg-toolbar-host--floating]': 'mode() === "floating"',
    '[class.blg-toolbar-host--sticky]': 'mode() === "sticky"'
  }
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private readonly toolbarState = inject(ToolbarStateService);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  // Input configuration
  @Input() set config(value: ToolbarConfig | null) {
    if (value) {
      this.toolbarState.updateConfig(value);
    }
  }

  @Input() set visible(value: boolean) {
    this.toolbarState.setVisible(value);
  }

  // Event outputs
  @Output() buttonClick = new EventEmitter<ToolbarEvents['buttonClick']>();
  @Output() buttonToggle = new EventEmitter<ToolbarEvents['buttonToggle']>();
  @Output() dropdownSelect = new EventEmitter<ToolbarEvents['dropdownSelect']>();
  @Output() colorPick = new EventEmitter<ToolbarEvents['colorPick']>();
  @Output() fontSelect = new EventEmitter<ToolbarEvents['fontSelect']>();
  @Output() sizeSelect = new EventEmitter<ToolbarEvents['sizeSelect']>();
  @Output() modeChange = new EventEmitter<ToolbarEvents['modeChange']>();
  @Output() stateChange = new EventEmitter<ToolbarEvents['stateChange']>();

  // Internal state
  private readonly mobileMenuOpen = signal(false);
  private readonly floatingOpacity = signal(0);
  private floatingAnimationFrame: number | null = null;

  // Computed state from service
  readonly config = this.toolbarState.config;
  readonly visible = this.toolbarState.visible;
  readonly mobileMode = this.toolbarState.mobileMode;
  readonly selectionState = this.toolbarState.selectionState;
  readonly activeButtons = this.toolbarState.activeButtons;
  readonly disabledButtons = this.toolbarState.disabledButtons;
  readonly buttonValues = this.toolbarState.buttonValues;

  // Computed properties
  readonly mode = computed(() => this.config()?.mode || 'fixed');
  
  readonly visibleSections = computed(() => {
    const config = this.config();
    if (!config) return [];
    
    return config.sections.filter(section => section.visible !== false);
  });

  readonly shouldShowFloatingToolbar = computed(() => {
    return this.toolbarState.shouldShowFloatingToolbar();
  });

  readonly showSectionTitles = computed(() => {
    const mode = this.mode();
    return mode === 'fixed' || mode === 'sticky';
  });

  readonly toolbarClasses = computed(() => {
    const config = this.config();
    const mode = this.mode();
    const classes = [
      'blg-toolbar',
      `blg-toolbar--${mode}`,
      this.mobileMode() ? 'blg-toolbar--mobile' : 'blg-toolbar--desktop'
    ];

    if (config?.cssClasses) {
      classes.push(...config.cssClasses);
    }

    return classes.join(' ');
  });

  readonly toolbarStyles = computed(() => {
    const config = this.config();
    const theme = config?.theme;
    if (!theme) return {};

    return {
      '--toolbar-background': theme.background,
      '--toolbar-text-color': theme.textColor,
      '--toolbar-border-color': theme.borderColor,
      '--toolbar-hover-color': theme.hoverColor,
      '--toolbar-active-color': theme.activeColor,
      '--toolbar-disabled-color': theme.disabledColor,
      '--toolbar-shadow': theme.shadow,
      '--toolbar-border-radius': theme.borderRadius,
      '--toolbar-icon-size': theme.iconSize
    };
  });

  readonly floatingPosition = computed(() => {
    const selection = this.selectionState();
    if (!selection?.bounds) {
      return { x: 0, y: 0 };
    }

    const bounds = selection.bounds;
    const toolbarHeight = 40; // Approximate toolbar height
    const x = Math.max(0, bounds.left + bounds.width / 2 - 100); // Center horizontally
    const y = Math.max(0, bounds.top - toolbarHeight - 10); // Position above selection

    return { x, y };
  });

  constructor() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Handle floating toolbar animations
    effect(() => {
      if (this.shouldShowFloatingToolbar()) {
        this.animateFloatingIn();
      } else {
        this.animateFloatingOut();
      }
    });
  }

  ngOnInit(): void {
    // Initialize sticky toolbar behavior if needed
    if (this.mode() === 'sticky') {
      this.setupStickyBehavior();
    }
  }

  ngOnDestroy(): void {
    if (this.floatingAnimationFrame) {
      cancelAnimationFrame(this.floatingAnimationFrame);
    }
  }

  /**
   * Check if button is active
   */
  isButtonActive(buttonId: string): boolean {
    return this.activeButtons().has(buttonId);
  }

  /**
   * Check if button is disabled
   */
  isButtonDisabled(buttonId: string): boolean {
    return this.disabledButtons().has(buttonId);
  }

  /**
   * Get button value
   */
  getButtonValue(buttonId: string): any {
    return this.buttonValues().get(buttonId);
  }

  /**
   * Handle button click
   */
  onButtonClick(button: ToolbarButton, event: Event): void {
    this.toolbarState.executeButton(button.id, event);
  }

  /**
   * Handle button toggle
   */
  onButtonToggle(button: ToolbarButton, active: boolean): void {
    this.toolbarState.setButtonActive(button.id, active);
  }

  /**
   * Handle button value change
   */
  onButtonValueChange(button: ToolbarButton, value: any): void {
    this.toolbarState.setButtonValue(button.id, value);
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    const config = this.config();
    if (!config?.keyboardNavigation) return;

    switch (event.key) {
      case 'Escape':
        if (this.mobileMenuOpen()) {
          this.closeMobileMenu();
          event.preventDefault();
        }
        break;
        
      case 'Tab':
        // Handle tab navigation within toolbar
        break;
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /**
   * Set up event listeners for toolbar events
   */
  private setupEventListeners(): void {
    this.toolbarState.addEventListener('buttonClick', event => {
      this.buttonClick.emit(event);
    });

    this.toolbarState.addEventListener('buttonToggle', event => {
      this.buttonToggle.emit(event);
    });

    this.toolbarState.addEventListener('dropdownSelect', event => {
      this.dropdownSelect.emit(event);
    });

    this.toolbarState.addEventListener('colorPick', event => {
      this.colorPick.emit(event);
    });

    this.toolbarState.addEventListener('fontSelect', event => {
      this.fontSelect.emit(event);
    });

    this.toolbarState.addEventListener('sizeSelect', event => {
      this.sizeSelect.emit(event);
    });

    this.toolbarState.addEventListener('modeChange', event => {
      this.modeChange.emit(event);
    });

    this.toolbarState.addEventListener('stateChange', event => {
      this.stateChange.emit(event);
    });
  }

  /**
   * Set up sticky toolbar behavior
   */
  private setupStickyBehavior(): void {
    // Implementation for sticky positioning
    // This would involve scroll event listeners and position calculations
  }

  /**
   * Animate floating toolbar in
   */
  private animateFloatingIn(): void {
    if (this.floatingAnimationFrame) {
      cancelAnimationFrame(this.floatingAnimationFrame);
    }

    const startTime = performance.now();
    const duration = this.config()?.animations?.duration || 200;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      this.floatingOpacity.set(progress);

      if (progress < 1) {
        this.floatingAnimationFrame = requestAnimationFrame(animate);
      }
    };

    this.floatingAnimationFrame = requestAnimationFrame(animate);
  }

  /**
   * Animate floating toolbar out
   */
  private animateFloatingOut(): void {
    if (this.floatingAnimationFrame) {
      cancelAnimationFrame(this.floatingAnimationFrame);
    }

    const startOpacity = this.floatingOpacity();
    const startTime = performance.now();
    const duration = this.config()?.animations?.duration || 200;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      this.floatingOpacity.set(startOpacity * (1 - progress));

      if (progress < 1) {
        this.floatingAnimationFrame = requestAnimationFrame(animate);
      }
    };

    this.floatingAnimationFrame = requestAnimationFrame(animate);
  }
}