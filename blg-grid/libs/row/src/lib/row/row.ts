import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDefinition, RowSelectEvent } from '@blg/core';

@Component({
  selector: 'blg-row',
  imports: [CommonModule],
  templateUrl: './row.html',
  styleUrl: './row.scss',
})
export class Row {
  @Input({ required: true }) columns: ColumnDefinition[] = [];
  @Input({ required: true }) rowData: any = {};
  @Input({ required: true }) rowIndex!: number;
  @Input() isSelected = false;
  @Input() isEven = false;
  @Input() rowHeight = 40;

  @Output() rowSelect = new EventEmitter<RowSelectEvent>();
  @Output() cellClick = new EventEmitter<any>();

  onRowClick(): void {
    this.rowSelect.emit({
      type: 'row-select',
      data: {
        rowIndex: this.rowIndex,
        rowData: this.rowData,
        selected: !this.isSelected
      },
      timestamp: new Date()
    });
  }

  onCellClick(columnId: string, value: any): void {
    this.cellClick.emit({
      type: 'cell-click',
      data: {
        rowIndex: this.rowIndex,
        columnId,
        value,
        rowData: this.rowData
      },
      timestamp: new Date()
    });
  }

  getCellValue(column: ColumnDefinition): any {
    return this.rowData[column.field] || '';
  }

  trackByColumn(_index: number, column: ColumnDefinition): string {
    return column.id;
  }
}
