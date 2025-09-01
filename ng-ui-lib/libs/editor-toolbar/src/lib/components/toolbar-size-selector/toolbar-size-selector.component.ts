import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarButton, ToolbarButtonOption } from '../../interfaces/toolbar-config.interface';
import { ToolbarDropdownComponent } from '../toolbar-dropdown/toolbar-dropdown.component';
import { FONT_SIZES } from '../../types/toolbar.types';

/**
 * Size selector component for toolbar
 * Extends dropdown with size-specific features
 */
@Component({
  selector: 'ng-ui-toolbar-size-selector',
  standalone: true,
  imports: [CommonModule, ToolbarDropdownComponent],
  template: `
    <ng-ui-toolbar-dropdown
      [button]="sizeButton()"
      [value]="value"
      [disabled]="disabled"
      [compact]="compact"
      [mobile]="mobile"
      [searchable]="false"
      (valueChange)="onValueChange($event)"
      (optionSelect)="onOptionSelect($event)"
    />
  `,
  styleUrls: ['./toolbar-size-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-toolbar-size-selector-host',
    '[class.blg-toolbar-size-selector-host--disabled]': 'disabled',
    '[class.blg-toolbar-size-selector-host--compact]': 'compact',
    '[class.blg-toolbar-size-selector-host--mobile]': 'mobile'
  }
})
export class ToolbarSizeSelectorComponent {
  @Input({ required: true }) button!: ToolbarButton;
  @Input() value: string = '14px';
  @Input() disabled = false;
  @Input() compact = false;
  @Input() mobile = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() sizeSelect = new EventEmitter<{ size: string; unit: string }>();

  // Computed properties
  readonly sizeButton = computed(() => {
    const options = this.button.options || FONT_SIZES;
    
    return {
      ...this.button,
      icon: this.button.icon || 'format_size',
      label: this.button.label || 'Size',
      tooltip: this.button.tooltip || 'Select font size',
      options
    } as ToolbarButton;
  });

  /**
   * Handle value change
   */
  onValueChange(value: string): void {
    this.valueChange.emit(value);
    
    // Extract size and unit
    const { size, unit } = this.parseSize(value);
    this.sizeSelect.emit({ size, unit });
  }

  /**
   * Handle option selection
   */
  onOptionSelect(option: ToolbarButtonOption): void {
    this.onValueChange(option.value);
  }

  /**
   * Parse size value into number and unit
   */
  private parseSize(value: string): { size: string; unit: string } {
    const match = value.match(/^(\d+(?:\.\d+)?)(.*?)$/);
    if (match) {
      return {
        size: match[1],
        unit: match[2] || 'px'
      };
    }
    
    return { size: value, unit: '' };
  }
}