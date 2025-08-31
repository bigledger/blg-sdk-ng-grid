import { Injectable, signal, computed } from '@angular/core';
import { ColumnDefinition } from '@blg/core';

export interface DataSource {
  data: any[];
  totalCount: number;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _dataSource = signal<DataSource>({
    data: [],
    totalCount: 0,
    loading: false
  });

  readonly dataSource = computed(() => this._dataSource());
  readonly data = computed(() => this._dataSource().data);
  readonly totalCount = computed(() => this._dataSource().totalCount);
  readonly loading = computed(() => this._dataSource().loading);

  setData(data: any[], totalCount?: number): void {
    this._dataSource.update(source => ({
      ...source,
      data: [...data],
      totalCount: totalCount ?? data.length,
      loading: false
    }));
  }

  setLoading(loading: boolean): void {
    this._dataSource.update(source => ({
      ...source,
      loading
    }));
  }

  sortData(columnId: string, direction: 'asc' | 'desc', columns: ColumnDefinition[]): any[] {
    const column = columns.find(col => col.id === columnId);
    if (!column) return this.data();

    const sorted = [...this.data()].sort((a, b) => {
      const aVal = a[column.field];
      const bVal = b[column.field];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (column.type === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      } else if (column.type === 'date') {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      } else {
        const aStr = aVal.toString().toLowerCase();
        const bStr = bVal.toString().toLowerCase();
        return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      }
    });

    this.setData(sorted, this.totalCount());
    return sorted;
  }

  filterData(filters: Record<string, any>, columns: ColumnDefinition[]): any[] {
    let filtered = [...this.data()];

    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (!filterValue) return;
      
      const column = columns.find(col => col.id === columnId);
      if (!column) return;

      filtered = filtered.filter(item => {
        const cellValue = item[column.field];
        if (cellValue === null || cellValue === undefined) return false;

        if (column.type === 'string') {
          return cellValue.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
        } else if (column.type === 'number') {
          return cellValue === filterValue;
        } else if (column.type === 'boolean') {
          return cellValue === filterValue;
        } else {
          return cellValue.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
        }
      });
    });

    return filtered;
  }

  getVirtualRows(startIndex: number, endIndex: number): any[] {
    return this.data().slice(startIndex, endIndex + 1);
  }

  clear(): void {
    this._dataSource.set({
      data: [],
      totalCount: 0,
      loading: false
    });
  }
}

// Export both the service and a component for compatibility
export const Data = DataService;
