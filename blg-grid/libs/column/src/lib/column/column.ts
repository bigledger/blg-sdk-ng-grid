import { Component, Input, Output, EventEmitter, HostListener, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDefinition, ColumnSortEvent, ColumnResizeEvent } from '@blg/core';

@Component({
  selector: 'blg-column',
  imports: [CommonModule],
  templateUrl: './column.html',
  styleUrl: './column.scss',
})
export class Column {
  // private readonly _elementRef = inject(ElementRef); // Reserved for future use

  @Input({ required: true }) column!: ColumnDefinition;
  @Input() sortDirection: 'asc' | 'desc' | null = null;
  @Input() isResizing = false;

  @Output() sort = new EventEmitter<ColumnSortEvent>();
  @Output() resize = new EventEmitter<ColumnResizeEvent>();
  @Output() reorder = new EventEmitter<{ fromIndex: number; toIndex: number }>();

  private isResizeMode = signal(false);
  private startX = signal(0);
  private startWidth = signal(0);

  readonly canSort = computed(() => this.column?.sortable ?? true);
  readonly canResize = computed(() => this.column?.resizable ?? true);
  readonly columnWidth = computed(() => `${this.column?.width || 150}px`);
  readonly columnStyle = computed(() => ({
    width: this.columnWidth(),
    minWidth: this.column?.minWidth ? `${this.column.minWidth}px` : '50px',
    maxWidth: this.column?.maxWidth ? `${this.column.maxWidth}px` : 'none',
    textAlign: this.column?.align || 'left'
  }));

  onHeaderClick(): void {
    if (!this.canSort()) return;

    let newDirection: 'asc' | 'desc' | null = 'asc';
    if (this.sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (this.sortDirection === 'desc') {
      newDirection = null;
    }

    this.sort.emit({
      type: 'column-sort',
      data: {
        columnId: this.column.id,
        direction: newDirection
      },
      timestamp: new Date()
    });
  }

  onResizeStart(event: MouseEvent): void {
    if (!this.canResize()) return;

    event.preventDefault();
    event.stopPropagation();

    this.isResizeMode.set(true);
    this.startX.set(event.clientX);
    this.startWidth.set(this.column.width || 150);

    document.addEventListener('mousemove', this.onResizeMove.bind(this));
    document.addEventListener('mouseup', this.onResizeEnd.bind(this));
  }

  private onResizeMove(event: MouseEvent): void {
    if (!this.isResizeMode()) return;

    const deltaX = event.clientX - this.startX();
    const newWidth = Math.max(this.column.minWidth || 50, this.startWidth() + deltaX);
    
    if (this.column.maxWidth) {
      const finalWidth = Math.min(newWidth, this.column.maxWidth);
      this.updateColumnWidth(finalWidth);
    } else {
      this.updateColumnWidth(newWidth);
    }
  }

  private onResizeEnd(): void {
    if (!this.isResizeMode()) return;

    this.isResizeMode.set(false);
    
    document.removeEventListener('mousemove', this.onResizeMove.bind(this));
    document.removeEventListener('mouseup', this.onResizeEnd.bind(this));

    this.resize.emit({
      type: 'column-resize',
      data: {
        columnId: this.column.id,
        width: this.column.width || 150,
        oldWidth: this.startWidth()
      },
      timestamp: new Date()
    });
  }

  private updateColumnWidth(width: number): void {
    // This would typically update the column definition through a service
    // For now, we'll emit the resize event
    if (this.column) {
      this.column.width = width;
    }
  }

  getSortIcon(): string {
    if (!this.canSort()) return '';
    
    switch (this.sortDirection) {
      case 'asc': return '▲';
      case 'desc': return '▼';
      default: return '⇅';
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (this.isResizeMode()) {
      this.onResizeMove(event);
    }
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    if (this.isResizeMode()) {
      this.onResizeEnd();
    }
  }
}
