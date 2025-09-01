import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarButton } from '../../interfaces/toolbar-config.interface';
import { COLOR_PALETTES } from '../../types/toolbar.types';

/**
 * Color picker component for toolbar
 * Supports predefined palettes and custom color input
 */
@Component({
  selector: 'ng-ui-toolbar-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-toolbar-color-picker" [class]="colorPickerClasses()">
      <!-- Color picker trigger -->
      <button
        type="button"
        class="blg-toolbar-color-picker__trigger"
        [disabled]="disabled"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'dialog'"
        [attr.aria-label]="button.tooltip || 'Choose color'"
        [title]="tooltipText()"
        (click)="togglePicker()"
        (keydown)="onTriggerKeyDown($event)"
      >
        <div class="blg-toolbar-color-picker__trigger-content">
          @if (button.icon) {
            <span class="blg-toolbar-color-picker__icon" [innerHTML]="getIcon()"></span>
          }
          
          @if (showLabel()) {
            <span class="blg-toolbar-color-picker__label">{{ button.label || 'Color' }}</span>
          }
          
          <!-- Current color indicator -->
          <span 
            class="blg-toolbar-color-picker__current"
            [style.background-color]="currentColor()"
            [attr.aria-label]="'Current color: ' + currentColor()"
          ></span>
          
          @if (!compact) {
            <span class="blg-toolbar-color-picker__arrow">
              <span class="material-icons">{{ isOpen() ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</span>
            </span>
          }
        </div>
      </button>

      <!-- Color picker panel -->
      @if (isOpen()) {
        <div 
          class="blg-toolbar-color-picker__panel"
          [style]="panelStyles()"
          role="dialog"
          [attr.aria-label]="'Color picker'"
          (keydown)="onPanelKeyDown($event)"
        >
          <!-- Predefined color palette -->
          @if (showPalette()) {
            <div class="blg-toolbar-color-picker__palette">
              <div class="blg-toolbar-color-picker__palette-title">Colors</div>
              
              <div class="blg-toolbar-color-picker__palette-grid">
                @for (color of paletteColors(); track color) {
                  <button
                    type="button"
                    class="blg-toolbar-color-picker__palette-color"
                    [class.blg-toolbar-color-picker__palette-color--selected]="color === currentColor()"
                    [style.background-color]="color"
                    [attr.aria-label]="'Color ' + color"
                    [attr.title]="color"
                    (click)="selectColor(color, $event)"
                    (keydown)="onColorKeyDown($event, color)"
                  >
                    @if (color === currentColor()) {
                      <span class="blg-toolbar-color-picker__palette-check">
                        <span class="material-icons">check</span>
                      </span>
                    }
                  </button>
                }
              </div>
            </div>
          }

          <!-- Recent colors -->
          @if (recentColors().length > 0) {
            <div class="blg-toolbar-color-picker__recent">
              <div class="blg-toolbar-color-picker__recent-title">Recent</div>
              
              <div class="blg-toolbar-color-picker__recent-grid">
                @for (color of recentColors(); track color) {
                  <button
                    type="button"
                    class="blg-toolbar-color-picker__recent-color"
                    [class.blg-toolbar-color-picker__recent-color--selected]="color === currentColor()"
                    [style.background-color]="color"
                    [attr.aria-label]="'Recent color ' + color"
                    [attr.title]="color"
                    (click)="selectColor(color, $event)"
                  >
                    @if (color === currentColor()) {
                      <span class="blg-toolbar-color-picker__recent-check">
                        <span class="material-icons">check</span>
                      </span>
                    }
                  </button>
                }
              </div>
            </div>
          }

          <!-- Custom color input -->
          @if (showCustomInput()) {
            <div class="blg-toolbar-color-picker__custom">
              <div class="blg-toolbar-color-picker__custom-title">Custom</div>
              
              <div class="blg-toolbar-color-picker__custom-inputs">
                <!-- Color input -->
                <div class="blg-toolbar-color-picker__input-group">
                  <label class="blg-toolbar-color-picker__input-label" for="color-input-{{button.id}}">
                    Hex
                  </label>
                  <input
                    type="text"
                    class="blg-toolbar-color-picker__hex-input"
                    [id]="'color-input-' + button.id"
                    [value]="hexInput()"
                    [placeholder]="'#000000'"
                    (input)="onHexInput($event)"
                    (keydown)="onHexKeyDown($event)"
                    (blur)="validateHexInput()"
                    maxlength="7"
                  />
                </div>
                
                <!-- Native color picker -->
                <div class="blg-toolbar-color-picker__input-group">
                  <input
                    type="color"
                    class="blg-toolbar-color-picker__native-input"
                    [value]="currentColor()"
                    [attr.aria-label]="'Color picker'"
                    (input)="onNativeColorChange($event)"
                  />
                </div>
              </div>
              
              <!-- RGB/HSL values (optional) -->
              @if (showAdvancedInputs()) {
                <div class="blg-toolbar-color-picker__advanced">
                  <div class="blg-toolbar-color-picker__rgb">
                    <span class="blg-toolbar-color-picker__rgb-label">RGB:</span>
                    <span class="blg-toolbar-color-picker__rgb-value">{{ getRgbValues() }}</span>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Actions -->
          <div class="blg-toolbar-color-picker__actions">
            <button
              type="button"
              class="blg-toolbar-color-picker__action blg-toolbar-color-picker__action--cancel"
              (click)="closePicker()"
            >
              Cancel
            </button>
            
            <button
              type="button"
              class="blg-toolbar-color-picker__action blg-toolbar-color-picker__action--apply"
              (click)="applyColor()"
              [disabled]="!isValidColor()"
            >
              Apply
            </button>
          </div>
        </div>
      }

      <!-- Mobile backdrop -->
      @if (isOpen() && mobile) {
        <div class="blg-toolbar-color-picker__backdrop" (click)="closePicker()"></div>
      }
    </div>
  `,
  styleUrls: ['./toolbar-color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-toolbar-color-picker-host',
    '[class.blg-toolbar-color-picker-host--open]': 'isOpen()',
    '[class.blg-toolbar-color-picker-host--disabled]': 'disabled',
    '[class.blg-toolbar-color-picker-host--compact]': 'compact',
    '[class.blg-toolbar-color-picker-host--mobile]': 'mobile',
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class ToolbarColorPickerComponent {
  @Input({ required: true }) button!: ToolbarButton;
  @Input() value = '#000000';
  @Input() disabled = false;
  @Input() compact = false;
  @Input() mobile = false;
  @Input() showPalette = true;
  @Input() showCustomInput = true;
  @Input() showAdvancedInputs = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() colorPick = new EventEmitter<string>();

  private readonly elementRef = inject(ElementRef);

  // Internal state
  private readonly isOpen = signal(false);
  private readonly hexInput = signal('');
  private readonly recentColors = signal<string[]>([]);
  private readonly pendingColor = signal<string>('');

  // Computed properties
  readonly currentColor = computed(() => {
    return this.isValidColor(this.value) ? this.value : '#000000';
  });

  readonly paletteColors = computed(() => {
    const palette = this.button.properties?.['palette'];
    if (Array.isArray(palette)) {
      return palette;
    }
    return COLOR_PALETTES.MATERIAL;
  });

  readonly colorPickerClasses = computed(() => {
    const classes = ['blg-toolbar-color-picker'];
    
    if (this.isOpen()) {
      classes.push('blg-toolbar-color-picker--open');
    }
    
    if (this.disabled) {
      classes.push('blg-toolbar-color-picker--disabled');
    }
    
    if (this.compact) {
      classes.push('blg-toolbar-color-picker--compact');
    }
    
    if (this.mobile) {
      classes.push('blg-toolbar-color-picker--mobile');
    }
    
    return classes.join(' ');
  });

  readonly showLabel = computed(() => {
    return this.mobile || (!this.compact && this.button.label);
  });

  readonly tooltipText = computed(() => {
    let tooltip = this.button.tooltip || this.button.label || 'Choose color';
    tooltip += `: ${this.currentColor()}`;
    return tooltip;
  });

  readonly panelStyles = computed(() => {
    if (!this.mobile) return {};
    
    return {
      'position': 'fixed',
      'bottom': '0',
      'left': '0',
      'right': '0',
      'max-height': '70vh'
    };
  });

  constructor() {
    // Initialize hex input with current value
    this.hexInput.set(this.currentColor());
    
    // Load recent colors from localStorage
    this.loadRecentColors();
  }

  /**
   * Toggle color picker open/closed
   */
  togglePicker(): void {
    if (this.disabled) return;
    
    this.isOpen.update(open => !open);
    
    if (this.isOpen()) {
      this.onPickerOpen();
    } else {
      this.onPickerClose();
    }
  }

  /**
   * Close color picker
   */
  closePicker(): void {
    this.isOpen.set(false);
    this.onPickerClose();
  }

  /**
   * Select a color from palette or recent
   */
  selectColor(color: string, event?: Event): void {
    if (!this.isValidColor(color)) return;
    
    this.pendingColor.set(color);
    this.hexInput.set(color);
    
    if (event && !this.mobile) {
      // Auto-apply on desktop for palette colors
      this.applyColor();
    }
  }

  /**
   * Apply the selected color
   */
  applyColor(): void {
    const color = this.pendingColor() || this.hexInput();
    if (!this.isValidColor(color)) return;
    
    this.addToRecentColors(color);
    this.valueChange.emit(color);
    this.colorPick.emit(color);
    this.closePicker();
  }

  /**
   * Handle trigger keydown
   */
  onTriggerKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.togglePicker();
        break;
    }
  }

  /**
   * Handle panel keydown
   */
  onPanelKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closePicker();
        break;
    }
  }

  /**
   * Handle color button keydown
   */
  onColorKeyDown(event: KeyboardEvent, color: string): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.selectColor(color, event);
        break;
    }
  }

  /**
   * Handle hex input changes
   */
  onHexInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value;
    
    // Ensure it starts with #
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    
    this.hexInput.set(value);
    this.pendingColor.set(value);
  }

  /**
   * Handle hex input keydown
   */
  onHexKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.validateHexInput();
        this.applyColor();
        break;
        
      case 'Escape':
        event.preventDefault();
        this.closePicker();
        break;
    }
  }

  /**
   * Handle native color picker change
   */
  onNativeColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const color = target.value;
    
    this.hexInput.set(color);
    this.pendingColor.set(color);
    
    if (!this.mobile) {
      // Auto-apply on desktop
      this.applyColor();
    }
  }

  /**
   * Validate and normalize hex input
   */
  validateHexInput(): void {
    let value = this.hexInput();
    
    // Basic validation and normalization
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    
    if (value.length === 4) {
      // Convert #RGB to #RRGGBB
      const r = value[1];
      const g = value[2];
      const b = value[3];
      value = `#${r}${r}${g}${g}${b}${b}`;
    }
    
    if (this.isValidColor(value)) {
      this.hexInput.set(value);
      this.pendingColor.set(value);
    } else {
      // Reset to current color if invalid
      this.hexInput.set(this.currentColor());
      this.pendingColor.set(this.currentColor());
    }
  }

  /**
   * Handle document click to close picker
   */
  onDocumentClick(event: Event): void {
    if (!this.isOpen()) return;
    
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closePicker();
    }
  }

  /**
   * Get button icon HTML
   */
  getIcon(): string {
    if (!this.button.icon) return '';
    
    if (this.button.icon.startsWith('<')) {
      return this.button.icon;
    }
    
    return `<span class="material-icons">${this.button.icon}</span>`;
  }

  /**
   * Check if color is valid hex
   */
  isValidColor(color?: string): boolean {
    if (!color) return false;
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Get RGB values for display
   */
  getRgbValues(): string {
    const color = this.pendingColor() || this.currentColor();
    if (!this.isValidColor(color)) return '';
    
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    return `${r}, ${g}, ${b}`;
  }

  /**
   * Handle picker open
   */
  private onPickerOpen(): void {
    this.hexInput.set(this.currentColor());
    this.pendingColor.set(this.currentColor());
  }

  /**
   * Handle picker close
   */
  private onPickerClose(): void {
    this.pendingColor.set('');
    
    // Return focus to trigger
    const trigger = this.elementRef.nativeElement.querySelector('.blg-toolbar-color-picker__trigger');
    if (trigger) {
      trigger.focus();
    }
  }

  /**
   * Add color to recent colors
   */
  private addToRecentColors(color: string): void {
    const recent = this.recentColors();
    const filtered = recent.filter(c => c !== color);
    const updated = [color, ...filtered].slice(0, 8); // Keep last 8 colors
    
    this.recentColors.set(updated);
    this.saveRecentColors(updated);
  }

  /**
   * Load recent colors from localStorage
   */
  private loadRecentColors(): void {
    try {
      const stored = localStorage.getItem('blg-toolbar-recent-colors');
      if (stored) {
        const colors = JSON.parse(stored);
        if (Array.isArray(colors)) {
          this.recentColors.set(colors.slice(0, 8));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Save recent colors to localStorage
   */
  private saveRecentColors(colors: string[]): void {
    try {
      localStorage.setItem('blg-toolbar-recent-colors', JSON.stringify(colors));
    } catch {
      // Ignore localStorage errors
    }
  }
}