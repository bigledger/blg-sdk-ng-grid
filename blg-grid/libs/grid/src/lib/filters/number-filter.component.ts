import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NumberFilterValue {
  operator: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' | 'between';
  value: number | null;
  value2?: number | null | undefined; // For 'between' operator
}

/**
 * Number Filter Component
 * 
 * Provides number-based filtering functionality with:
 * - Multiple comparison operators (equals, not equals, less than, etc.)
 * - Between range filtering
 * - Input validation
 * - Keyboard accessibility
 */
@Component({
  selector: 'blg-number-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-number-filter">
      <select 
        class="blg-filter-operator"
        [value]="filterValue().operator"
        (change)="onOperatorChange($event)"
        [attr.aria-label]="'Filter operator for ' + ariaLabel">
        <option value="eq">Equals</option>
        <option value="ne">Not equals</option>
        <option value="lt">Less than</option>
        <option value="le">Less or equal</option>
        <option value="gt">Greater than</option>
        <option value="ge">Greater or equal</option>
        <option value="between">Between</option>
      </select>

      <div class="blg-filter-inputs">
        <input 
          type="number"
          class="blg-filter-input"
          [placeholder]="placeholder"
          [value]="filterValue().value || ''"
          (input)="onValueChange($event)"
          (keydown)="onKeyDown($event)"
          [attr.aria-label]="ariaLabel">

        @if (filterValue().operator === 'between') {
          <span class="blg-filter-separator">and</span>
          <input 
            type="number"
            class="blg-filter-input"
            placeholder="Max value"
            [value]="filterValue().value2 || ''"
            (input)="onValue2Change($event)"
            (keydown)="onKeyDown($event)"
            [attr.aria-label]="ariaLabel + ' maximum value'">
        }
      </div>

      @if (hasValue()) {
        <button 
          type="button"
          class="blg-filter-clear"
          (click)="clearFilter()"
          aria-label="Clear filter"
          title="Clear filter">
          ✕
        </button>
      }
    </div>
  `,
  styles: [`
    .blg-number-filter {
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
    }

    .blg-filter-operator {
      padding: 4px 6px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 11px;
      background: white;
      min-width: 80px;

      &:focus {
        border-color: #1976d2;
        outline: none;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .blg-filter-inputs {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .blg-filter-input {
      flex: 1;
      padding: 4px 6px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      outline: none;
      min-width: 60px;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }

      &::placeholder {
        color: #999;
      }
    }

    .blg-filter-separator {
      font-size: 11px;
      color: #666;
      white-space: nowrap;
    }

    .blg-filter-clear {
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
      font-size: 12px;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;

      &:hover {
        background-color: #f0f0f0;
        color: #333;
      }

      &:focus {
        outline: 1px solid #1976d2;
        outline-offset: 1px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFilterComponent {
  @Input() placeholder = 'Value';
  @Input() ariaLabel = 'Number filter';
  @Input() debounceTime = 300;
  
  @Output() filterChange = new EventEmitter<NumberFilterValue | null>();

  readonly filterValue = signal<NumberFilterValue>({
    operator: 'eq',
    value: null,
    value2: null
  });

  private debounceTimeout?: number;

  /**
   * Get current filter value
   */
  get value(): NumberFilterValue {
    return this.filterValue();
  }

  /**
   * Set filter value programmatically
   */
  setValue(value: NumberFilterValue): void {
    this.filterValue.set(value);
    this.emitFilterChange();
  }

  /**
   * Check if filter has any value
   */
  hasValue(): boolean {
    const current = this.filterValue();
    return current.value !== null || current.value2 !== null;
  }

  /**
   * Handle operator change
   */
  onOperatorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const operator = target.value as NumberFilterValue['operator'];
    
    this.filterValue.update(current => ({
      ...current,
      operator,
      // Clear value2 when not using 'between'
      value2: operator === 'between' ? current.value2 : null
    }));

    this.emitFilterChange();
  }

  /**
   * Handle first value change
   */
  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : null;
    
    this.filterValue.update(current => ({
      ...current,
      value: isNaN(value!) ? null : value
    }));

    this.debouncedEmit();
  }

  /**
   * Handle second value change (for 'between' operator)
   */
  onValue2Change(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value2 = target.value ? parseFloat(target.value) : null;
    
    this.filterValue.update(current => ({
      ...current,
      value2: isNaN(value2!) ? null : value2
    }));

    this.debouncedEmit();
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearFilter();
      event.preventDefault();
    }
  }

  /**
   * Clear the filter
   */
  clearFilter(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.filterValue.update(current => ({
      ...current,
      value: null,
      value2: null
    }));

    this.filterChange.emit(null);
  }

  /**
   * Emit filter change with debouncing
   */
  private debouncedEmit(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.emitFilterChange();
    }, this.debounceTime);
  }

  /**
   * Emit filter change immediately
   */
  private emitFilterChange(): void {
    const current = this.filterValue();
    const hasValidValue = current.value !== null || 
                         (current.operator === 'between' && current.value2 !== null);
    
    this.filterChange.emit(hasValidValue ? current : null);
  }
}