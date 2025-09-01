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
import { FONT_FAMILIES } from '../../types/toolbar.types';

/**
 * Font selector component for toolbar
 * Extends dropdown with font-specific features
 */
@Component({
  selector: 'ng-ui-toolbar-font-selector',
  standalone: true,
  imports: [CommonModule, ToolbarDropdownComponent],
  template: `
    <ng-ui-toolbar-dropdown
      [button]="fontButton()"
      [value]="value"
      [disabled]="disabled"
      [compact]="compact"
      [mobile]="mobile"
      [searchable]="true"
      (valueChange)="onValueChange($event)"
      (optionSelect)="onOptionSelect($event)"
    />
  `,
  styleUrls: ['./toolbar-font-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-toolbar-font-selector-host',
    '[class.blg-toolbar-font-selector-host--disabled]': 'disabled',
    '[class.blg-toolbar-font-selector-host--compact]': 'compact',
    '[class.blg-toolbar-font-selector-host--mobile]': 'mobile'
  }
})
export class ToolbarFontSelectorComponent {
  @Input({ required: true }) button!: ToolbarButton;
  @Input() value: string = 'Arial, sans-serif';
  @Input() disabled = false;
  @Input() compact = false;
  @Input() mobile = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() fontSelect = new EventEmitter<{ font: string; family: string }>();

  // Computed properties
  readonly fontButton = computed(() => {
    const options = this.button.options || FONT_FAMILIES;
    
    return {
      ...this.button,
      icon: this.button.icon || 'font_download',
      label: this.button.label || 'Font',
      tooltip: this.button.tooltip || 'Select font family',
      options: options.map(option => ({
        ...option,
        // Add preview style to each option
        style: { 'font-family': option.value }
      }))
    } as ToolbarButton;
  });

  /**
   * Handle value change
   */
  onValueChange(value: string): void {
    this.valueChange.emit(value);
    
    // Extract family name from CSS value
    const family = this.extractFamilyName(value);
    this.fontSelect.emit({ font: value, family });
  }

  /**
   * Handle option selection
   */
  onOptionSelect(option: ToolbarButtonOption): void {
    this.onValueChange(option.value);
  }

  /**
   * Extract font family name from CSS value
   */
  private extractFamilyName(cssValue: string): string {
    // Remove fallbacks and quotes
    const parts = cssValue.split(',');
    let family = parts[0].trim();
    
    // Remove quotes
    if (family.startsWith('"') || family.startsWith("'")) {
      family = family.slice(1, -1);
    }
    
    return family;
  }
}