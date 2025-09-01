# Example 6: Grid with Server-Side Data

## 📚 Target Audience: Library Users

This example demonstrates migrating an ag-Grid with server-side row model to BLG Grid, including lazy loading, infinite scrolling, server-side sorting/filtering, and pagination.

## ⚠️ Important Note

**Server-side row model is planned for BLG Grid v2.0**. This example shows the current workaround using client-side with pagination and the future server-side implementation.

## 🎯 What This Example Covers

- Server-side data loading
- Infinite scrolling / lazy loading
- Server-side sorting and filtering
- Pagination with server-side data
- Loading states and error handling
- Caching strategies

## 📊 Before: ag-Grid Implementation

```typescript
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-enterprise';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-server-side-grid',
  template: `
    <div class="grid-container">
      <h2>Large Dataset with Server-Side Loading</h2>
      
      <div class="info-panel">
        <p>Loading 1M+ records with server-side processing</p>
        <p>Status: <span class="status">{{ loadingStatus }}</span></p>
      </div>

      <ag-grid-angular
        class="ag-theme-alpine"
        style="width: 100%; height: 600px;"
        [columnDefs]="columnDefs"
        [gridOptions]="gridOptions">
      </ag-grid-angular>
    </div>
  `
})
export class ServerSideGridComponent implements OnInit {

  loadingStatus = 'Ready';

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Customer Name', width: 200, filter: 'agTextColumnFilter' },
    { field: 'email', headerName: 'Email', width: 250, filter: 'agTextColumnFilter' },
    { field: 'country', headerName: 'Country', width: 150, filter: 'agSetColumnFilter' },
    { field: 'city', headerName: 'City', width: 150, filter: 'agTextColumnFilter' },
    { field: 'orderCount', headerName: 'Orders', width: 120, filter: 'agNumberColumnFilter' },
    { field: 'totalSpent', headerName: 'Total Spent', width: 140, 
      valueFormatter: (params) => '$' + params.value?.toLocaleString(),
      filter: 'agNumberColumnFilter' 
    },
    { field: 'lastOrderDate', headerName: 'Last Order', width: 140,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '',
      filter: 'agDateColumnFilter'
    }
  ];

  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    rowModelType: 'serverSide',
    serverSideDatasource: {
      getRows: (params: IServerSideGetRowsRequest) => {
        this.loadingStatus = 'Loading...';
        
        const request = {
          startRow: params.request.startRow,
          endRow: params.request.endRow,
          sortModel: params.request.sortModel,
          filterModel: params.request.filterModel
        };

        this.http.post<any>('api/customers/server-side', request)
          .subscribe({
            next: (response) => {
              this.loadingStatus = `Loaded ${response.data.length} rows`;
              params.success({
                rowData: response.data,
                rowCount: response.totalCount
              });
            },
            error: (error) => {
              this.loadingStatus = 'Error loading data';
              console.error('Server side error:', error);
              params.fail();
            }
          });
      }
    },
    cacheBlockSize: 100,
    maxBlocksInCache: 10,
    purgeClosedRowNodes: true,
    animateRows: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Grid will automatically load data via server-side datasource
  }
}
```

## ✅ After: BLG Grid Implementation (Current Workaround)

```typescript
import { Component, OnInit, signal, computed } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { 
  ColumnDefinition, 
  GridConfig, 
  GridApi,
  SortChangedEvent,
  FilterChangedEvent,
  PageChangedEvent
} from '@ng-ui-lib/core';

@Component({
  selector: 'app-server-side-grid',
  standalone: true,
  imports: [Grid, CommonModule],
  template: `
    <div class="grid-container">
      <h2>Large Dataset with Server-Side Loading</h2>
      
      <div class="info-panel">
        <p>Loading 1M+ records with pagination (Server-side model coming in v2.0)</p>
        <p>Status: <span class="status">{{ loadingStatus() }}</span></p>
        <p>Total Records: {{ totalRecords() | number }}</p>
        <p>Current Page: {{ currentPage() + 1 }} of {{ totalPages() }}</p>
      </div>

      <ng-ui-lib
        class="blg-theme-default"
        style="width: 100%; height: 600px;"
        [columns]="columns"
        [data]="data"
        [config]="config"
        [loading]="isLoading()"
        (gridReady)="onGridReady($event)"
        (sortChanged)="onSortChanged($event)"
        (filterChanged)="onFilterChanged($event)"
        (pageChanged)="onPageChanged($event)">
      </ng-ui-lib>
    </div>
  `
})
export class ServerSideGridComponent implements OnInit {

  private gridApi?: GridApi;
  
  // Reactive state
  data = signal<any[]>([]);
  isLoading = signal(false);
  loadingStatus = signal('Ready');
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(100);

  // Computed values
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  // Current server request parameters
  private currentSort: any[] = [];
  private currentFilters: any = {};

  columns: ColumnDefinition[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { 
      field: 'name', 
      headerName: 'Customer Name', 
      width: 200, 
      filterable: true,
      filterType: 'text'
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 250, 
      filterable: true,
      filterType: 'text'
    },
    { 
      field: 'country', 
      headerName: 'Country', 
      width: 150, 
      filterable: true,
      filterType: 'set'
    },
    { 
      field: 'city', 
      headerName: 'City', 
      width: 150, 
      filterable: true,
      filterType: 'text'
    },
    { 
      field: 'orderCount', 
      headerName: 'Orders', 
      width: 120, 
      filterable: true,
      filterType: 'number'
    },
    { 
      field: 'totalSpent', 
      headerName: 'Total Spent', 
      width: 140,
      valueFormatter: (value) => '$' + value?.toLocaleString(),
      filterable: true,
      filterType: 'number'
    },
    { 
      field: 'lastOrderDate', 
      headerName: 'Last Order', 
      width: 140,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : '',
      filterable: true,
      filterType: 'date'
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true,
      filterable: true
    },
    pagination: true,
    paginationPageSize: 100,
    paginationAutoPageSize: false,
    enableInfiniteScroll: false, // Use pagination instead for now
    suppressRowVirtualisation: false
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  onGridReady(gridApi: GridApi) {
    this.gridApi = gridApi;
  }

  private async loadData(page: number = 0) {
    this.isLoading.set(true);
    this.loadingStatus.set('Loading...');

    try {
      const request = {
        page: page,
        pageSize: this.pageSize(),
        sortModel: this.currentSort,
        filterModel: this.currentFilters
      };

      const response = await this.http.post<any>('api/customers/paginated', request).toPromise();
      
      this.data.set(response.data);
      this.totalRecords.set(response.totalCount);
      this.currentPage.set(page);
      this.loadingStatus.set(`Loaded ${response.data.length} of ${response.totalCount} records`);
      
    } catch (error) {
      this.loadingStatus.set('Error loading data');
      console.error('Server error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSortChanged(event: SortChangedEvent) {
    this.currentSort = event.sortModel;
    this.loadData(0); // Reset to first page when sorting
  }

  onFilterChanged(event: FilterChangedEvent) {
    this.currentFilters = event.filterModel;
    this.loadData(0); // Reset to first page when filtering
  }

  onPageChanged(event: PageChangedEvent) {
    this.loadData(event.page);
  }
}
```

## 🔮 Future: BLG Grid v2.0 Server-Side Implementation

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { 
  ColumnDefinition, 
  GridConfig, 
  ServerSideDataSource,
  ServerSideRequest
} from '@ng-ui-lib/core';

@Component({
  selector: 'app-server-side-grid-v2',
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib
      class="blg-theme-default"
      style="width: 100%; height: 600px;"
      [columns]="columns"
      [config]="config">
    </ng-ui-lib>
  `
})
export class ServerSideGridV2Component implements OnInit {

  columns: ColumnDefinition[] = [
    // ... same column definitions
  ];

  config: GridConfig = {
    rowModel: 'serverSide', // 🔮 Coming in v2.0
    serverSideDataSource: {
      getRows: async (request: ServerSideRequest) => {
        const response = await this.http.post<any>('api/customers/server-side', {
          startRow: request.startRow,
          endRow: request.endRow,
          sortModel: request.sortModel,
          filterModel: request.filterModel
        }).toPromise();

        return {
          data: response.data,
          totalCount: response.totalCount
        };
      }
    },
    cacheBlockSize: 100,
    maxBlocksInCache: 10
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Grid will automatically handle server-side loading
  }
}
```

**Migration Time**: ~30 minutes for current pagination approach, ~1-2 hours when v2.0 server-side model is available.

**Key Changes**:
- Current: Use pagination instead of infinite scrolling
- v2.0: Direct server-side row model with similar API to ag-Grid
- Simplified configuration and better TypeScript support
- Reactive loading states with Angular Signals