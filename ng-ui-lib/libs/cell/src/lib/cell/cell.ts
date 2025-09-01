import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDefinition } from '@ng-ui/core';

@Component({
  selector: 'ng-ui-cell',
  imports: [CommonModule],
  templateUrl: './cell.html',
  styleUrl: './cell.scss',
})
export class Cell {
  @Input({ required: true }) column!: ColumnDefinition;
  @Input({ required: true }) value: any;
  @Input({ required: true }) rowData: any;
  @Input({ required: true }) rowIndex!: number;
  @Input() isEditing = false;

  @Output() cellChange = new EventEmitter<any>();
  @Output() editStart = new EventEmitter<void>();
  @Output() editEnd = new EventEmitter<void>();

  onCellEdit(newValue: any): void {
    this.cellChange.emit({
      columnId: this.column.id,
      rowIndex: this.rowIndex,
      oldValue: this.value,
      newValue,
      rowData: this.rowData
    });
  }

  startEdit(): void {
    this.editStart.emit();
  }

  endEdit(): void {
    this.editEnd.emit();
  }

  getDisplayValue(): string {
    if (this.value === null || this.value === undefined) {
      return '';
    }
    
    switch (this.column.type) {
      case 'date':
        return this.value instanceof Date ? this.value.toLocaleDateString() : new Date(this.value).toLocaleDateString();
      case 'number':
        return typeof this.value === 'number' ? this.value.toString() : this.value;
      case 'boolean':
        return this.value ? 'Yes' : 'No';
      default:
        return this.value.toString();
    }
  }
}
