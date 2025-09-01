import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Grid } from '../lib/grid/grid';
import { ColumnDefinition, GridConfig, GridEventType } from '@ng-ui/core';

/**
 * Test wrapper component for Grid testing
 * Provides a controlled environment for testing grid functionality
 */
@Component({
  selector: 'test-grid-wrapper',
  standalone: true,
  imports: [CommonModule, Grid],
  template: `
    <ng-ui-grid
      [data]="data"
      [columns]="columns"
      [config]="config"
      (gridEvent)="onGridEvent($event)"
      (cellClick)="onCellClick($event)"
      (rowSelect)="onRowSelect($event)"
      (columnSort)="onColumnSort($event)"
      (columnResize)="onColumnResize($event)"
    ></blg-grid>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 400px;
    }
  `]
})
export class TestGridWrapperComponent {
  @ViewChild(Grid, { static: true }) grid!: Grid;

  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() config: GridConfig = {};

  // Event tracking for tests
  events: GridEventType[] = [];
  cellClickEvents: any[] = [];
  rowSelectEvents: any[] = [];
  columnSortEvents: any[] = [];
  columnResizeEvents: any[] = [];

  onGridEvent(event: GridEventType): void {
    this.events.push(event);
  }

  onCellClick(event: any): void {
    this.cellClickEvents.push(event);
  }

  onRowSelect(event: any): void {
    this.rowSelectEvents.push(event);
  }

  onColumnSort(event: any): void {
    this.columnSortEvents.push(event);
  }

  onColumnResize(event: any): void {
    this.columnResizeEvents.push(event);
  }

  // Helper methods for tests
  clearEvents(): void {
    this.events = [];
    this.cellClickEvents = [];
    this.rowSelectEvents = [];
    this.columnSortEvents = [];
    this.columnResizeEvents = [];
  }

  getLastEvent(eventType?: string): GridEventType | undefined {
    if (eventType) {
      return this.events.filter(e => e.type === eventType).pop();
    }
    return this.events[this.events.length - 1];
  }

  getEventCount(eventType?: string): number {
    if (eventType) {
      return this.events.filter(e => e.type === eventType).length;
    }
    return this.events.length;
  }

  // Direct access to grid methods for testing
  selectRow(index: number): void {
    this.grid.toggleRowSelection(index);
  }

  clearSelection(): void {
    this.grid.clearAllSelection();
  }

  startEdit(rowIndex: number, columnId: string, value: any): void {
    this.grid.startEdit(rowIndex, columnId, value);
  }

  commitEdit(): void {
    this.grid.commitEdit();
  }

  cancelEdit(): void {
    this.grid.cancelEdit();
  }

  goToPage(page: number): void {
    this.grid.goToPage(page);
  }

  setPageSize(size: number): void {
    this.grid.onPageSizeChange(size.toString());
  }

  // Getters for state inspection
  get selectedRows(): Set<number> {
    return this.grid.selectedRows();
  }

  get sortState(): any {
    return this.grid.sortState();
  }

  get filterState(): any {
    return this.grid.filterState();
  }

  get currentPage(): number {
    return this.grid.currentPage();
  }

  get pageSize(): number {
    return this.grid.pageSize();
  }

  get totalPages(): number {
    return this.grid.totalPages();
  }

  get focusedCell(): any {
    return this.grid.focusedCell();
  }

  get editingCell(): any {
    return this.grid.editingCell();
  }

  get gridData(): any[] {
    return this.grid.gridData();
  }

  get visibleColumns(): ColumnDefinition[] {
    return this.grid.visibleColumns();
  }
}