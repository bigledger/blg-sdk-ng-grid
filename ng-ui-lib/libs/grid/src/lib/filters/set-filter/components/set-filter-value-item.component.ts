import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
  ElementRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetFilterValue } from '../set-filter.interface';

/**
 * Individual Set Filter Value Item Component
 * 
 * Renders a single value in the set filter with:
 * - Checkbox for selection
 * - Value display with formatting
 * - Count and percentage display
 * - Mini distribution chart
 * - Color coding by frequency
 * - Custom icons and badges
 * - Accessibility support
 */
@Component({
  selector: 'blg-set-filter-value-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blg-set-filter-value-item"
         [class]="itemClasses()"
         [style.background-color]="backgroundColorStyle()"
         [attr.aria-selected]="isSelected"
         [attr.aria-label]="ariaLabel()"
         (click)="onItemClick()"
         (dblclick)="onItemDoubleClick()"
         (contextmenu)="onItemContextMenu($event)">
      
      <!-- Selection checkbox -->
      <div class="blg-set-filter-value-item__checkbox">
        <input
          type="checkbox"
          class="blg-set-filter-value-item__checkbox-input"
          [checked]="isSelected"
          [indeterminate]="isPartiallySelected"
          [id]="checkboxId()"
          (change)="onSelectionChange($event)"
          (click)="$event.stopPropagation()"
          [attr.aria-describedby]="ariaDescribedBy()">
        
        <label 
          class="blg-set-filter-value-item__checkbox-label"
          [for]="checkboxId()">
          <span class="blg-set-filter-value-item__checkbox-indicator"
                [style.border-color]="checkboxBorderColor()"
                [style.background-color]="checkboxBackgroundColor()">
            <i class="blg-set-filter-value-item__checkbox-icon" 
               [class]="checkboxIconClass()"
               aria-hidden="true"></i>
          </span>
        </label>
      </div>

      <!-- Value icon -->
      <div class="blg-set-filter-value-item__icon" 
           *ngIf="showIcon && (value.icon || defaultIcon())">
        <i class="{{value.icon || defaultIcon()}}" 
           [style.color]="iconColor()"
           [title]="iconTitle()"
           aria-hidden="true"></i>
      </div>

      <!-- Main content area -->
      <div class="blg-set-filter-value-item__content">
        <!-- Value display -->
        <div class="blg-set-filter-value-item__value">
          <!-- Custom renderer support -->
          <div *ngIf="value.customRenderer" 
               [innerHTML]="renderCustomValue()"
               class="blg-set-filter-value-item__custom">
          </div>
          
          <!-- Standard value display -->
          <span *ngIf="!value.customRenderer"
                class="blg-set-filter-value-item__text"
                [title]="value.tooltip || value.displayValue">
            {{ value.displayValue }}
          </span>

          <!-- Value badge -->
          <span class="blg-set-filter-value-item__badge" 
                *ngIf="value.badge"
                [style.background-color]="badgeColor()">
            {{ value.badge }}
          </span>
        </div>

        <!-- Metadata line -->
        <div class="blg-set-filter-value-item__metadata" 
             *ngIf="showCount || showChart">
          
          <!-- Count and percentage -->
          <div class="blg-set-filter-value-item__stats" *ngIf="showCount">
            <span class="blg-set-filter-value-item__count">
              {{ formatCount(value.count) }}
            </span>
            <span class="blg-set-filter-value-item__percentage">
              ({{ formatPercentage(value.percentage) }}%)
            </span>
            <span class="blg-set-filter-value-item__frequency"
                  *ngIf="value.frequency !== undefined">
              • {{ formatFrequency(value.frequency) }}
            </span>
          </div>

          <!-- Mini distribution chart -->
          <div class="blg-set-filter-value-item__chart" 
               *ngIf="showChart && value.percentage > 0">
            <div class="blg-set-filter-value-item__chart-bar"
                 [style.width.%]="chartWidth()"
                 [style.background-color]="chartColor()"
                 [title]="chartTooltip()">
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="blg-set-filter-value-item__actions" 
           *ngIf="showActions">
        <button class="blg-set-filter-value-item__action-btn"
                (click)="onCopyValue($event)"
                title="Copy value"
                aria-label="Copy value to clipboard">
          <i class="icon-copy" aria-hidden="true"></i>
        </button>
        
        <button class="blg-set-filter-value-item__action-btn"
                (click)="onTogglePin($event)"
                [class.active]="isPinned"
                title="Pin value"
                aria-label="Pin/unpin value">
          <i class="icon-pin" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Selection indicator -->
      <div class="blg-set-filter-value-item__selection-indicator"
           *ngIf="isSelected"
           [style.background-color]="selectionColor()">
      </div>

      <!-- Drag handle -->
      <div class="blg-set-filter-value-item__drag-handle"
           *ngIf="enableDrag"
           [attr.aria-label]="'Drag to reorder ' + value.displayValue">
        <i class="icon-drag-handle" aria-hidden="true"></i>
      </div>
    </div>
  `,
  styleUrls: ['./set-filter-value-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'blg-set-filter-value-item-host',
    '[class.selected]': 'isSelected',
    '[class.compact]': 'compactMode',
    '[class.focused]': 'isFocused',
    '[class.highlighted]': 'isHighlighted',
    'role': 'option',
    '[attr.aria-selected]': 'isSelected',
    '[attr.tabindex]': 'tabIndex()'
  }
})
export class SetFilterValueItemComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  @Input() value!: SetFilterValue;
  @Input() index = 0;
  @Input() isSelected = false;
  @Input() isPartiallySelected = false;
  @Input() isFocused = false;
  @Input() isHighlighted = false;
  @Input() isPinned = false;
  
  // Display options
  @Input() showCount = true;
  @Input() showChart = true;
  @Input() showColorCoding = true;
  @Input() showIcon = true;
  @Input() showActions = false;
  @Input() compactMode = false;
  @Input() enableDrag = false;
  
  // Theming and styling
  @Input() maxChartWidth = 100;
  @Input() selectionColorIntensity = 0.8;
  @Input() customRenderer?: string;

  // Outputs
  @Output() selectionChanged = new EventEmitter<boolean>();
  @Output() doubleClick = new EventEmitter<void>();
  @Output() contextMenu = new EventEmitter<MouseEvent>();
  @Output() valueAction = new EventEmitter<{action: string; value: SetFilterValue}>();

  // Computed properties
  readonly checkboxId = computed(() => `checkbox-${this.index}`);
  readonly ariaDescribedBy = computed(() => `value-${this.index}-desc`);
  readonly tabIndex = computed(() => this.isFocused ? 0 : -1);
  
  readonly itemClasses = computed(() => ({
    'blg-set-filter-value-item--selected': this.isSelected,
    'blg-set-filter-value-item--partial': this.isPartiallySelected,
    'blg-set-filter-value-item--focused': this.isFocused,
    'blg-set-filter-value-item--highlighted': this.isHighlighted,
    'blg-set-filter-value-item--pinned': this.isPinned,
    'blg-set-filter-value-item--compact': this.compactMode,
    'blg-set-filter-value-item--has-icon': this.showIcon && (this.value.icon || this.defaultIcon()),
    'blg-set-filter-value-item--has-badge': !!this.value.badge,
    'blg-set-filter-value-item--has-chart': this.showChart,
    'blg-set-filter-value-item--high-frequency': this.value.percentage > 10,
    'blg-set-filter-value-item--low-frequency': this.value.percentage < 1,
    'blg-set-filter-value-item--custom-renderer': !!this.value.customRenderer
  }));

  readonly ariaLabel = computed(() => {
    let label = this.value.displayValue;
    
    if (this.showCount) {
      label += `, ${this.value.count} occurrences, ${this.formatPercentage(this.value.percentage)}%`;
    }
    
    if (this.isSelected) {
      label += ', selected';
    }
    
    if (this.isPinned) {
      label += ', pinned';
    }
    
    return label;
  });

  readonly backgroundColorStyle = computed(() => {
    if (!this.showColorCoding) return '';
    
    if (this.isSelected) {
      return this.selectionColor();
    }
    
    if (this.value.color) {
      return this.value.color;
    }
    
    // Frequency-based coloring
    return this.getFrequencyColor(this.value.percentage);
  });

  readonly chartWidth = computed(() => {
    if (!this.showChart || this.value.percentage === 0) return 0;
    
    // Scale chart width relative to the highest percentage in the dataset
    // This would ideally be provided by the parent component
    const normalizedPercentage = Math.min(this.value.percentage, this.maxChartWidth);
    return (normalizedPercentage / this.maxChartWidth) * 100;
  });

  readonly chartColor = computed(() => {
    if (this.value.color) {
      return this.value.color;
    }
    
    return this.getFrequencyColor(this.value.percentage, 0.6);
  });

  readonly chartTooltip = computed(() => {
    return `${this.value.displayValue}: ${this.value.count} (${this.formatPercentage(this.value.percentage)}%)`;
  });

  // ============================================
  // Event Handlers
  // ============================================

  onItemClick() {
    this.toggleSelection();
  }

  onItemDoubleClick() {
    this.doubleClick.emit();
  }

  onItemContextMenu(event: MouseEvent) {
    this.contextMenu.emit(event);
  }

  onSelectionChange(event: Event) {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    this.selectionChanged.emit(checkbox.checked);
  }

  onCopyValue(event: Event) {
    event.stopPropagation();
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.value.displayValue);
    }
    
    this.valueAction.emit({
      action: 'copy',
      value: this.value
    });
  }

  onTogglePin(event: Event) {
    event.stopPropagation();
    
    this.valueAction.emit({
      action: 'togglePin',
      value: this.value
    });
  }

  // ============================================
  // Selection Management
  // ============================================

  private toggleSelection() {
    this.selectionChanged.emit(!this.isSelected);
  }

  // ============================================
  // Styling Methods
  // ============================================

  defaultIcon(): string {
    // Determine icon based on value type
    const value = this.value.value;
    
    if (typeof value === 'number') {
      return 'icon-number';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'icon-check' : 'icon-x';
    }
    
    if (value instanceof Date || this.couldBeDate(value)) {
      return 'icon-calendar';
    }
    
    if (typeof value === 'string') {
      if (value.includes('@')) {
        return 'icon-email';
      }
      
      if (value.startsWith('http')) {
        return 'icon-link';
      }
      
      if (/^\d+$/.test(value)) {
        return 'icon-hash';
      }
      
      return 'icon-text';
    }
    
    return 'icon-value';
  }

  iconColor(): string {
    if (this.value.color) {
      return this.value.color;
    }
    
    if (this.showColorCoding) {
      return this.getFrequencyColor(this.value.percentage, 0.8);
    }
    
    return 'var(--blg-set-filter-text-secondary)';
  }

  iconTitle(): string {
    const type = typeof this.value.value;
    return `${type} value`;
  }

  checkboxBorderColor(): string {
    if (this.isSelected || this.isPartiallySelected) {
      return 'var(--blg-set-filter-accent)';
    }
    
    return 'var(--blg-set-filter-border)';
  }

  checkboxBackgroundColor(): string {
    if (this.isSelected) {
      return 'var(--blg-set-filter-accent)';
    }
    
    if (this.isPartiallySelected) {
      return 'var(--blg-set-filter-accent)';
    }
    
    return 'transparent';
  }

  checkboxIconClass(): string {
    if (this.isSelected) {
      return 'icon-check';
    }
    
    if (this.isPartiallySelected) {
      return 'icon-minus';
    }
    
    return '';
  }

  badgeColor(): string {
    // Badge color based on category or custom color
    if (this.value.category) {
      return this.getCategoryColor(this.value.category);
    }
    
    return 'var(--blg-set-filter-accent)';
  }

  selectionColor(): string {
    const baseColor = this.value.color || 'var(--blg-set-filter-accent)';
    
    // Add transparency for selection
    if (baseColor.startsWith('#')) {
      const rgb = this.hexToRgb(baseColor);
      if (rgb) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.selectionColorIntensity})`;
      }
    }
    
    if (baseColor.startsWith('rgb')) {
      // Extract RGB values and add alpha
      const match = baseColor.match(/\d+/g);
      if (match && match.length >= 3) {
        return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${this.selectionColorIntensity})`;
      }
    }
    
    return baseColor;
  }

  private getFrequencyColor(percentage: number, alpha = 0.3): string {
    // Create a color gradient from low frequency (light) to high frequency (dark)
    const intensity = Math.min(percentage / 20, 1); // Normalize to 20% max
    
    // Use HSL for better color control
    const hue = 210; // Blue hue
    const saturation = 70;
    const lightness = 85 - (intensity * 40); // From light to medium
    
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }

  private getCategoryColor(category: string): string {
    // Simple hash-based color generation for categories
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // ============================================
  // Formatting Methods
  // ============================================

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    
    return count.toLocaleString();
  }

  formatPercentage(percentage: number): string {
    if (percentage < 0.1) {
      return '<0.1';
    }
    
    if (percentage >= 10) {
      return percentage.toFixed(0);
    }
    
    return percentage.toFixed(1);
  }

  formatFrequency(frequency: number): string {
    return `${(frequency * 100).toFixed(1)}%`;
  }

  // ============================================
  // Custom Rendering
  // ============================================

  renderCustomValue(): string {
    if (!this.value.customRenderer) {
      return this.value.displayValue;
    }
    
    // In a real implementation, this would support template engines
    // or custom renderer functions
    try {
      // Simple template substitution
      return this.value.customRenderer
        .replace(/\{\{value\}\}/g, this.value.displayValue)
        .replace(/\{\{count\}\}/g, String(this.value.count))
        .replace(/\{\{percentage\}\}/g, String(this.value.percentage));
    } catch (error) {
      console.warn('Custom renderer error:', error);
      return this.value.displayValue;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private couldBeDate(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    // Basic date pattern detection
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
    ];
    
    return datePatterns.some(pattern => pattern.test(value));
  }

  // ============================================
  // Public Methods
  // ============================================

  focus() {
    this.elementRef.nativeElement.focus();
  }

  scrollIntoView() {
    this.elementRef.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  highlight() {
    // Add temporary highlight animation
    this.elementRef.nativeElement.classList.add('blg-set-filter-value-item--highlight-flash');
    
    setTimeout(() => {
      this.elementRef.nativeElement.classList.remove('blg-set-filter-value-item--highlight-flash');
    }, 1000);
  }
}