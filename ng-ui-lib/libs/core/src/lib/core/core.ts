import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { GridConfig } from '../interfaces/grid-config.interface';
import { GridEventType } from '../interfaces/grid-event.interface';
import { GridStateService } from '../services/grid-state.service';

@Component({
  selector: 'ng-ui-core',
  imports: [CommonModule],
  templateUrl: './core.html',
  styleUrl: './core.scss',
})
export class Core implements OnInit {
  private gridState = inject(GridStateService);

  @Input() columns: ColumnDefinition[] = [];
  @Input() config: GridConfig = {};
  @Input() data: any[] = [];

  @Output() gridEvent = new EventEmitter<GridEventType>();

  ngOnInit(): void {
    this.initializeGrid();
  }

  private initializeGrid(): void {
    // Update grid state with initial configuration
    this.gridState.updateColumns(this.columns);
    this.gridState.updateConfig({
      totalRows: this.data.length,
      rowHeight: 40,
      virtualScrolling: true,
      sortable: true,
      filterable: true,
      selectable: true,
      selectionMode: 'single',
      resizable: true,
      reorderable: false,
      theme: 'default',
      ...this.config
    });
  }

  onGridEvent(event: GridEventType): void {
    this.gridEvent.emit(event);
  }

  // Getter for reactive state access
  get gridColumns() {
    return this.gridState.columns();
  }

  get gridConfig() {
    return this.gridState.config();
  }

  get selectedRows() {
    return this.gridState.selectedRows();
  }

  get sortState() {
    return this.gridState.sortState();
  }

  get filterState() {
    return this.gridState.filterState();
  }
}
