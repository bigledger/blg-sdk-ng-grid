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
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ToolbarButton, 
  ToolbarButtonOption 
} from '../../interfaces/toolbar-config.interface';

/**
 * Dropdown component for toolbar buttons
 * Supports grouped options and keyboard navigation
 */
@Component({
  selector: 'ng-ui-toolbar-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blg-toolbar-dropdown" [class]="dropdownClasses()">
      <!-- Dropdown trigger button -->
      <button
        type="button"
        class="blg-toolbar-dropdown__trigger"
        [disabled]="disabled"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-label]="button.tooltip || button.label"
        [title]="tooltipText()"
        (click)="toggleDropdown()"
        (keydown)="onTriggerKeyDown($event)"
        #trigger
      >
        <div class="blg-toolbar-dropdown__trigger-content">
          @if (button.icon) {
            <span class="blg-toolbar-dropdown__icon" [innerHTML]="getIcon()"></span>
          }
          
          @if (showCurrentValue() && currentOption()) {
            <span class="blg-toolbar-dropdown__current">
              @if (currentOption()?.icon) {
                <span class="blg-toolbar-dropdown__current-icon" [innerHTML]="getCurrentIcon()"></span>
              }
              <span class="blg-toolbar-dropdown__current-label">{{ currentOption()?.label }}</span>
            </span>
          } @else if (button.label && showLabel()) {
            <span class="blg-toolbar-dropdown__label">{{ button.label }}</span>
          }
          
          <span class="blg-toolbar-dropdown__arrow">
            <span class="material-icons">{{ isOpen() ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</span>
          </span>
        </div>
      </button>

      <!-- Dropdown menu -->
      @if (isOpen()) {
        <div 
          class="blg-toolbar-dropdown__menu"
          [style]="menuStyles()"
          role="listbox"
          [attr.aria-activedescendant]="activeOptionId()"
          (keydown)="onMenuKeyDown($event)"
          #menu
        >
          @if (filteredOptions().length === 0) {
            <div class="blg-toolbar-dropdown__empty">No options available</div>
          } @else {
            @for (group of groupedOptions(); track group.name) {
              @if (group.name) {
                <div class="blg-toolbar-dropdown__group-label">{{ group.name }}</div>
              }
              
              @for (option of group.options; track option.value; let i = $index) {
                <div
                  class="blg-toolbar-dropdown__option"
                  [class.blg-toolbar-dropdown__option--active]="isOptionActive(option)"
                  [class.blg-toolbar-dropdown__option--selected]="isOptionSelected(option)"
                  [class.blg-toolbar-dropdown__option--disabled]="option.enabled === false"
                  [attr.id]="getOptionId(option)"
                  [attr.role]="'option'"
                  [attr.aria-selected]="isOptionSelected(option)"
                  [attr.aria-disabled]="option.enabled === false"
                  (click)="selectOption(option, $event)"
                  (mouseenter)="setActiveOption(option)"
                >
                  @if (option.icon) {
                    <span class="blg-toolbar-dropdown__option-icon" [innerHTML]="getOptionIcon(option)"></span>
                  }
                  
                  <span class="blg-toolbar-dropdown__option-label">{{ option.label }}</span>
                  
                  @if (isOptionSelected(option)) {
                    <span class="blg-toolbar-dropdown__option-check">
                      <span class="material-icons">check</span>
                    </span>
                  }
                </div>
              }
            }
          }
        </div>
      }

      <!-- Backdrop for mobile -->
      @if (isOpen() && mobile) {
        <div class="blg-toolbar-dropdown__backdrop" (click)="closeDropdown()"></div>
      }
    </div>
  `,
  styleUrls: ['./toolbar-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-toolbar-dropdown-host',
    '[class.blg-toolbar-dropdown-host--open]': 'isOpen()',
    '[class.blg-toolbar-dropdown-host--disabled]': 'disabled',
    '[class.blg-toolbar-dropdown-host--compact]': 'compact',
    '[class.blg-toolbar-dropdown-host--mobile]': 'mobile',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown)': 'onDocumentKeyDown($event)'
  }
})
export class ToolbarDropdownComponent {
  @Input({ required: true }) button!: ToolbarButton;
  @Input() value: any;
  @Input() disabled = false;
  @Input() compact = false;
  @Input() mobile = false;
  @Input() searchable = false;

  @Output() valueChange = new EventEmitter<any>();
  @Output() optionSelect = new EventEmitter<ToolbarButtonOption>();

  private readonly elementRef = inject(ElementRef);

  // Internal state
  private readonly isOpen = signal(false);
  private readonly activeOption = signal<ToolbarButtonOption | null>(null);
  private readonly searchQuery = signal('');

  // Computed properties
  readonly options = computed(() => this.button.options || []);

  readonly currentOption = computed(() => {
    const options = this.options();
    return options.find(opt => opt.value === this.value) || null;
  });

  readonly filteredOptions = computed(() => {
    const options = this.options();
    const query = this.searchQuery().toLowerCase();
    
    if (!query) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      (option.value && option.value.toString().toLowerCase().includes(query))
    );
  });

  readonly groupedOptions = computed(() => {
    const options = this.filteredOptions();
    const groups = new Map<string, ToolbarButtonOption[]>();
    
    options.forEach(option => {
      const groupName = option.group || '';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(option);
    });
    
    return Array.from(groups.entries()).map(([name, options]) => ({
      name,
      options
    }));
  });

  readonly dropdownClasses = computed(() => {
    const classes = ['blg-toolbar-dropdown'];
    
    if (this.isOpen()) {
      classes.push('blg-toolbar-dropdown--open');
    }
    
    if (this.disabled) {
      classes.push('blg-toolbar-dropdown--disabled');
    }
    
    if (this.compact) {
      classes.push('blg-toolbar-dropdown--compact');
    }
    
    if (this.mobile) {
      classes.push('blg-toolbar-dropdown--mobile');
    }
    
    return classes.join(' ');
  });

  readonly showLabel = computed(() => {
    return this.mobile || (!this.compact && this.button.label);
  });

  readonly showCurrentValue = computed(() => {
    return !this.mobile && this.currentOption();
  });

  readonly tooltipText = computed(() => {
    let tooltip = this.button.tooltip || this.button.label || '';
    const current = this.currentOption();
    
    if (current) {
      tooltip += `: ${current.label}`;
    }
    
    return tooltip;
  });

  readonly activeOptionId = computed(() => {
    const active = this.activeOption();
    return active ? this.getOptionId(active) : null;
  });

  readonly menuStyles = computed(() => {
    if (!this.mobile) return {};
    
    // Mobile menu positioning
    return {
      'position': 'fixed',
      'bottom': '0',
      'left': '0',
      'right': '0',
      'max-height': '50vh'
    };
  });

  constructor() {
    // Set initial active option to current selection
    effect(() => {
      const current = this.currentOption();
      if (current && !this.activeOption()) {
        this.activeOption.set(current);
      }
    });
  }

  /**
   * Toggle dropdown open/closed
   */
  toggleDropdown(): void {
    if (this.disabled) return;
    
    this.isOpen.update(open => !open);
    
    if (this.isOpen()) {
      this.onDropdownOpen();
    } else {
      this.onDropdownClose();
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    this.isOpen.set(false);
    this.onDropdownClose();
  }

  /**
   * Select an option
   */
  selectOption(option: ToolbarButtonOption, event?: Event): void {
    if (option.enabled === false) {
      event?.preventDefault();
      return;
    }

    this.valueChange.emit(option.value);
    this.optionSelect.emit(option);
    this.closeDropdown();
  }

  /**
   * Set active option for keyboard navigation
   */
  setActiveOption(option: ToolbarButtonOption): void {
    if (option.enabled !== false) {
      this.activeOption.set(option);
    }
  }

  /**
   * Check if option is currently active
   */
  isOptionActive(option: ToolbarButtonOption): boolean {
    return this.activeOption() === option;
  }

  /**
   * Check if option is currently selected
   */
  isOptionSelected(option: ToolbarButtonOption): boolean {
    return option.value === this.value;
  }

  /**
   * Handle trigger button keydown
   */
  onTriggerKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
      case 'Enter':
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        }
        break;
    }
  }

  /**
   * Handle menu keydown for navigation
   */
  onMenuKeyDown(event: KeyboardEvent): void {
    const options = this.filteredOptions().filter(opt => opt.enabled !== false);
    const activeOption = this.activeOption();
    const currentIndex = activeOption ? options.indexOf(activeOption) : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(options, currentIndex, 1);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(options, currentIndex, -1);
        break;
        
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (activeOption) {
          this.selectOption(activeOption);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
        
      case 'Home':
        event.preventDefault();
        if (options.length > 0) {
          this.setActiveOption(options[0]);
        }
        break;
        
      case 'End':
        event.preventDefault();
        if (options.length > 0) {
          this.setActiveOption(options[options.length - 1]);
        }
        break;
        
      default:
        // Handle typing for search
        if (this.searchable && event.key.length === 1) {
          this.handleSearch(event.key);
        }
        break;
    }
  }

  /**
   * Handle document click to close dropdown
   */
  onDocumentClick(event: Event): void {
    if (!this.isOpen()) return;
    
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  /**
   * Handle document keydown
   */
  onDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeDropdown();
    }
  }

  /**
   * Navigate through options with keyboard
   */
  private navigateOptions(options: ToolbarButtonOption[], currentIndex: number, direction: number): void {
    if (options.length === 0) return;
    
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) {
      newIndex = options.length - 1;
    } else if (newIndex >= options.length) {
      newIndex = 0;
    }
    
    this.setActiveOption(options[newIndex]);
  }

  /**
   * Handle search typing
   */
  private handleSearch(char: string): void {
    // Simple search implementation
    const query = this.searchQuery() + char;
    this.searchQuery.set(query);
    
    // Find first matching option
    const options = this.filteredOptions().filter(opt => opt.enabled !== false);
    if (options.length > 0) {
      this.setActiveOption(options[0]);
    }
    
    // Clear search after delay
    setTimeout(() => {
      this.searchQuery.set('');
    }, 1000);
  }

  /**
   * Handle dropdown open
   */
  private onDropdownOpen(): void {
    // Set active option to current selection or first option
    const current = this.currentOption();
    const options = this.filteredOptions().filter(opt => opt.enabled !== false);
    
    if (current) {
      this.setActiveOption(current);
    } else if (options.length > 0) {
      this.setActiveOption(options[0]);
    }
    
    // Focus management
    setTimeout(() => {
      const menu = this.elementRef.nativeElement.querySelector('.blg-toolbar-dropdown__menu');
      if (menu) {
        menu.focus();
      }
    });
  }

  /**
   * Handle dropdown close
   */
  private onDropdownClose(): void {
    this.searchQuery.set('');
    
    // Return focus to trigger
    const trigger = this.elementRef.nativeElement.querySelector('.blg-toolbar-dropdown__trigger');
    if (trigger) {
      trigger.focus();
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
   * Get current option icon HTML
   */
  getCurrentIcon(): string {
    const current = this.currentOption();
    if (!current?.icon) return '';
    
    if (current.icon.startsWith('<')) {
      return current.icon;
    }
    
    return `<span class="material-icons">${current.icon}</span>`;
  }

  /**
   * Get option icon HTML
   */
  getOptionIcon(option: ToolbarButtonOption): string {
    if (!option.icon) return '';
    
    if (option.icon.startsWith('<')) {
      return option.icon;
    }
    
    return `<span class="material-icons">${option.icon}</span>`;
  }

  /**
   * Get unique ID for option
   */
  getOptionId(option: ToolbarButtonOption): string {
    return `option-${this.button.id}-${option.value}`;
  }
}