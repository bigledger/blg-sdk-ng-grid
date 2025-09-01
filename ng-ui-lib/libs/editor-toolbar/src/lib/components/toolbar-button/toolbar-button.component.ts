import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarButton, ToolbarButtonOption } from '../../interfaces/toolbar-config.interface';
import { ToolbarDropdownComponent } from '../toolbar-dropdown/toolbar-dropdown.component';
import { ToolbarColorPickerComponent } from '../toolbar-color-picker/toolbar-color-picker.component';
import { ToolbarFontSelectorComponent } from '../toolbar-font-selector/toolbar-font-selector.component';
import { ToolbarSizeSelectorComponent } from '../toolbar-size-selector/toolbar-size-selector.component';

/**
 * Individual toolbar button component
 * Handles different button types and states
 */
@Component({
  selector: 'ng-ui-toolbar-button',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarDropdownComponent,
    ToolbarColorPickerComponent,
    ToolbarFontSelectorComponent,
    ToolbarSizeSelectorComponent
  ],
  template: `
    <!-- Regular Button -->
    @if (button.type === 'button' || button.type === 'toggle') {
      <button
        type="button"
        class="blg-toolbar-button"
        [class]="buttonClasses()"
        [disabled]="disabled"
        [attr.aria-pressed]="button.type === 'toggle' ? active : null"
        [attr.aria-label]="button.tooltip || button.label"
        [title]="tooltipText()"
        (click)="onButtonClick($event)"
        (keydown)="onKeyDown($event)"
      >
        @if (button.icon) {
          <span class="blg-toolbar-button__icon" [innerHTML]="getIcon()"></span>
        }
        @if (button.label && showLabel()) {
          <span class="blg-toolbar-button__label">{{ button.label }}</span>
        }
        @if (button.shortcut && showShortcut()) {
          <span class="blg-toolbar-button__shortcut">{{ button.shortcut }}</span>
        }
      </button>
    }

    <!-- Dropdown Button -->
    @if (button.type === 'dropdown') {
      <ng-ui-toolbar-dropdown
        [button]="button"
        [value]="value"
        [disabled]="disabled"
        [compact]="compact"
        [mobile]="mobile"
        (valueChange)="onValueChange($event)"
        (optionSelect)="onOptionSelect($event)"
      />
    }

    <!-- Color Picker -->
    @if (button.type === 'color-picker') {
      <ng-ui-toolbar-color-picker
        [button]="button"
        [value]="value || '#000000'"
        [disabled]="disabled"
        [compact]="compact"
        [mobile]="mobile"
        (valueChange)="onValueChange($event)"
        (colorPick)="onColorPick($event)"
      />
    }

    <!-- Font Selector -->
    @if (button.type === 'font-selector') {
      <ng-ui-toolbar-font-selector
        [button]="button"
        [value]="value"
        [disabled]="disabled"
        [compact]="compact"
        [mobile]="mobile"
        (valueChange)="onValueChange($event)"
        (fontSelect)="onFontSelect($event)"
      />
    }

    <!-- Size Selector -->
    @if (button.type === 'size-selector') {
      <ng-ui-toolbar-size-selector
        [button]="button"
        [value]="value"
        [disabled]="disabled"
        [compact]="compact"
        [mobile]="mobile"
        (valueChange)="onValueChange($event)"
        (sizeSelect)="onSizeSelect($event)"
      />
    }

    <!-- Separator -->
    @if (button.type === 'separator') {
      <div class="blg-toolbar-button__separator" [class.blg-toolbar-button__separator--vertical]="!mobile"></div>
    }

    <!-- Button Group -->
    @if (button.type === 'group') {
      <div class="blg-toolbar-button__group" [class.blg-toolbar-button__group--mobile]="mobile">
        <!-- Group buttons would be rendered here if implemented -->
      </div>
    }
  `,
  styleUrls: ['./toolbar-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-toolbar-button-host',
    '[class.blg-toolbar-button-host--active]': 'active',
    '[class.blg-toolbar-button-host--disabled]': 'disabled',
    '[class.blg-toolbar-button-host--compact]': 'compact',
    '[class.blg-toolbar-button-host--mobile]': 'mobile'
  }
})
export class ToolbarButtonComponent {
  @Input({ required: true }) button!: ToolbarButton;
  @Input() active = false;
  @Input() disabled = false;
  @Input() value: any;
  @Input() compact = false;
  @Input() mobile = false;

  @Output() click = new EventEmitter<Event>();
  @Output() toggle = new EventEmitter<boolean>();
  @Output() valueChange = new EventEmitter<any>();
  @Output() optionSelect = new EventEmitter<ToolbarButtonOption>();
  @Output() colorPick = new EventEmitter<string>();
  @Output() fontSelect = new EventEmitter<{ font: string; family: string }>();
  @Output() sizeSelect = new EventEmitter<{ size: string; unit: string }>();

  // Internal state
  private readonly isPressed = signal(false);

  // Computed properties
  readonly buttonClasses = computed(() => {
    const classes = ['blg-toolbar-button'];
    
    if (this.button.type === 'toggle' && this.active) {
      classes.push('blg-toolbar-button--active');
    }
    
    if (this.disabled) {
      classes.push('blg-toolbar-button--disabled');
    }
    
    if (this.compact) {
      classes.push('blg-toolbar-button--compact');
    }
    
    if (this.mobile) {
      classes.push('blg-toolbar-button--mobile');
    }
    
    if (this.isPressed()) {
      classes.push('blg-toolbar-button--pressed');
    }

    return classes.join(' ');
  });

  readonly showLabel = computed(() => {
    return this.mobile || (!this.compact && this.button.label);
  });

  readonly showShortcut = computed(() => {
    return !this.mobile && !this.compact && this.button.shortcut;
  });

  readonly tooltipText = computed(() => {
    let tooltip = this.button.tooltip || this.button.label || '';
    
    if (this.button.shortcut && !this.showShortcut()) {
      tooltip += ` (${this.button.shortcut})`;
    }
    
    return tooltip;
  });

  /**
   * Handle button click
   */
  onButtonClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.click.emit(event);

    if (this.button.type === 'toggle') {
      const newActive = !this.active;
      this.toggle.emit(newActive);
    }
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onButtonClick(event);
        break;
    }
  }

  /**
   * Handle value changes from complex components
   */
  onValueChange(value: any): void {
    this.valueChange.emit(value);
  }

  /**
   * Handle option selection from dropdown
   */
  onOptionSelect(option: ToolbarButtonOption): void {
    this.optionSelect.emit(option);
    this.valueChange.emit(option.value);
  }

  /**
   * Handle color picking
   */
  onColorPick(color: string): void {
    this.colorPick.emit(color);
    this.valueChange.emit(color);
  }

  /**
   * Handle font selection
   */
  onFontSelect(font: { font: string; family: string }): void {
    this.fontSelect.emit(font);
    this.valueChange.emit(font.font);
  }

  /**
   * Handle size selection
   */
  onSizeSelect(size: { size: string; unit: string }): void {
    this.sizeSelect.emit(size);
    this.valueChange.emit(size.size);
  }

  /**
   * Get button icon (HTML or Material icon name)
   */
  getIcon(): string {
    if (!this.button.icon) return '';
    
    // If it's HTML (starts with <), return as-is
    if (this.button.icon.startsWith('<')) {
      return this.button.icon;
    }
    
    // Otherwise, treat as Material icon name
    return `<span class="material-icons">${this.button.icon}</span>`;
  }
}