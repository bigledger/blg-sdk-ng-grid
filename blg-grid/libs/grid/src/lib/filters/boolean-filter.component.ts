import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Boolean Filter Component
 * 
 * Provides boolean-based filtering functionality with:
 * - True/False/All options
 * - Custom labels for true/false values
 * - Keyboard accessibility
 */
@Component({
  selector: 'blg-boolean-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-boolean-filter">
      <select 
        class="blg-filter-select"
        [value]="filterValue() ?? 'all'"
        (change)="onValueChange($event)"
        [attr.aria-label]="ariaLabel">
        <option value="all">All</option>
        <option value="true">{{ trueLabel }}</option>
        <option value="false">{{ falseLabel }}</option>
      </select>

      @if (filterValue() !== null) {
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
    .blg-boolean-filter {
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
    }

    .blg-filter-select {
      flex: 1;
      padding: 4px 6px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      background: white;
      outline: none;
      min-width: 80px;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
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
export class BooleanFilterComponent {
  @Input() trueLabel = 'Yes';
  @Input() falseLabel = 'No';
  @Input() ariaLabel = 'Boolean filter';
  
  @Output() filterChange = new EventEmitter<boolean | null>();

  readonly filterValue = signal<boolean | null>(null);

  /**
   * Get current filter value
   */
  get value(): boolean | null {
    return this.filterValue();
  }

  /**
   * Set filter value programmatically
   */
  setValue(value: boolean | null): void {
    this.filterValue.set(value);
    this.filterChange.emit(value);
  }

  /**
   * Handle value change
   */
  onValueChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    
    let filterValue: boolean | null;
    switch (value) {
      case 'true':
        filterValue = true;
        break;
      case 'false':
        filterValue = false;
        break;
      default:
        filterValue = null;
        break;
    }
    
    this.filterValue.set(filterValue);
    this.filterChange.emit(filterValue);
  }

  /**
   * Clear the filter
   */
  clearFilter(): void {
    this.filterValue.set(null);
    this.filterChange.emit(null);
  }
}