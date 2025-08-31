import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Text Filter Component
 * 
 * Provides text-based filtering functionality with:
 * - Case-insensitive search
 * - Debounced input to improve performance
 * - Clear button for easy reset
 * - Keyboard accessibility
 */
@Component({
  selector: 'blg-text-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-text-filter">
      <input 
        type="text"
        class="blg-filter-input"
        [placeholder]="placeholder"
        [value]="filterValue()"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)"
        [attr.aria-label]="ariaLabel">
      
      @if (filterValue()) {
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
    .blg-text-filter {
      position: relative;
      display: flex;
      align-items: center;
    }

    .blg-filter-input {
      width: 100%;
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      outline: none;
      padding-right: 24px;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }

      &::placeholder {
        color: #999;
      }
    }

    .blg-filter-clear {
      position: absolute;
      right: 4px;
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
export class TextFilterComponent {
  @Input() placeholder = 'Filter...';
  @Input() ariaLabel = 'Text filter';
  @Input() debounceTime = 300;
  
  @Output() filterChange = new EventEmitter<string>();

  readonly filterValue = signal<string>('');
  private debounceTimeout?: number;

  /**
   * Get current filter value
   */
  get value(): string {
    return this.filterValue();
  }

  /**
   * Set filter value programmatically
   */
  setValue(value: string): void {
    this.filterValue.set(value);
    this.filterChange.emit(value);
  }

  /**
   * Handle input changes with debouncing
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    this.filterValue.set(value);

    // Clear existing timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Set new timeout for debounced emission
    this.debounceTimeout = setTimeout(() => {
      this.filterChange.emit(value);
    }, this.debounceTime);
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
    
    this.filterValue.set('');
    this.filterChange.emit('');
  }
}