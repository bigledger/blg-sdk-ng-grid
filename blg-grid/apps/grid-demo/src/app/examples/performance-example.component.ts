import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grid } from '@blg/grid';
import { ColumnDefinition, GridConfig } from '@blg/core';

/**
 * Performance Grid Example Component
 * 
 * Demonstrates:
 * - Handling very large datasets (100k+ rows)
 * - Virtual scrolling performance optimization
 * - Memory efficient data handling
 * - Performance metrics tracking
 */
@Component({
  selector: 'app-performance-example',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid],
  template: `
    <div class="example-container">
      <h2>Performance Grid Example</h2>
      <p>Grid optimized for handling large datasets with virtual scrolling.</p>
      
      <div class="controls">
        <div class="row-size-control">
          <label for="rowCount">Number of rows:</label>
          <select id="rowCount" [(ngModel)]="selectedRowCount" (change)="onRowCountChange()">
            <option value="1000">1,000</option>
            <option value="10000">10,000</option>
            <option value="50000">50,000</option>
            <option value="100000">100,000</option>
            <option value="500000">500,000</option>
          </select>
          <button (click)="generateData()" class="btn-primary">Generate Data</button>
        </div>

        <div class="performance-metrics">
          <div class="metric">
            <label>Data Generation Time:</label>
            <span class="metric-value">{{ generationTime() }}ms</span>
          </div>
          <div class="metric">
            <label>Render Time:</label>
            <span class="metric-value">{{ renderTime() }}ms</span>
          </div>
          <div class="metric">
            <label>Memory Usage:</label>
            <span class="metric-value">{{ memoryUsage() }}</span>
          </div>
          <div class="metric">
            <label>Filtered Rows:</label>
            <span class="metric-value">{{ filteredRowCount() }}</span>
          </div>
        </div>

        <div class="virtual-scroll-info">
          <label>
            <input type="checkbox" [(ngModel)]="useVirtualScrolling" (change)="updateVirtualScrolling()">
            Enable Virtual Scrolling (recommended for 1000+ rows)
          </label>
          <label>
            <input type="checkbox" [(ngModel)]="usePagination" (change)="updatePagination()">
            Enable Pagination (alternative to virtual scrolling)
          </label>
        </div>
      </div>

      <div class="grid-wrapper">
        <blg-grid
          [data]="data()"
          [columns]="columns()"
          [config]="config()"
          (gridEvent)="onGridEvent($event)">
        </blg-grid>
      </div>

      <div class="performance-tips">
        <h3>Performance Tips</h3>
        <ul>
          <li>Virtual scrolling is automatically enabled for datasets > 100 rows</li>
          <li>Use trackBy functions for better change detection performance</li>
          <li>Filter and sort operations are optimized for large datasets</li>
          <li>Column width calculations are cached for better performance</li>
          <li>Event handlers are debounced to prevent excessive updates</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .row-size-control {
      display: flex;
      align-items: center;
      gap: 12px;

      label {
        font-weight: 500;
        color: #333;
      }

      select {
        padding: 6px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
    }

    .performance-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 12px;
      background: white;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
      }

      .metric-value {
        font-size: 18px;
        font-weight: 600;
        color: #1976d2;
      }
    }

    .virtual-scroll-info {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
      }
    }

    .btn-primary {
      background: #1976d2;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        background: #1565c0;
      }
    }

    .grid-wrapper {
      flex: 1;
      min-height: 500px;
      border: 1px solid #ddd;
      border-radius: 4px;
      position: relative;
    }

    .performance-tips {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 4px;
      border-left: 4px solid #1976d2;

      h3 {
        margin: 0 0 12px 0;
        color: #1976d2;
        font-size: 16px;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 6px;
          color: #0d47a1;
          font-size: 14px;
          line-height: 1.4;
        }
      }
    }

    h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class PerformanceExampleComponent implements OnInit {
  // Grid data and configuration
  data = signal<any[]>([]);
  columns = signal<ColumnDefinition[]>([]);
  config = signal<GridConfig>({});
  
  // Performance metrics
  generationTime = signal<number>(0);
  renderTime = signal<number>(0);
  memoryUsage = computed(() => this.formatMemoryUsage());
  filteredRowCount = computed(() => this.data().length);
  
  // Controls
  selectedRowCount = 10000;
  useVirtualScrolling = true;
  usePagination = false;

  ngOnInit(): void {
    this.setupColumns();
    this.setupConfig();
    this.generateData();
  }

  /**
   * Setup column definitions optimized for performance
   */
  private setupColumns(): void {
    this.columns.set([
      {
        id: 'id',
        field: 'id',
        header: 'ID',
        width: 80,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'name',
        field: 'name',
        header: 'Name',
        width: 150,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'category',
        field: 'category',
        header: 'Category',
        width: 120,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'value',
        field: 'value',
        header: 'Value',
        width: 100,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true,
        align: 'right'
      },
      {
        id: 'status',
        field: 'status',
        header: 'Status',
        width: 100,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'created',
        field: 'created',
        header: 'Created',
        width: 120,
        type: 'date',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'score',
        field: 'score',
        header: 'Score',
        width: 80,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true,
        align: 'center'
      }
    ]);
  }

  /**
   * Setup grid configuration for performance
   */
  private setupConfig(): void {
    this.config.set({
      virtualScrolling: this.useVirtualScrolling,
      rowHeight: 36, // Smaller row height for better performance
      sortable: true,
      filterable: true,
      selectable: true,
      selectionMode: 'multiple',
      resizable: true,
      reorderable: false, // Disabled for performance
      showFooter: true,
      pagination: this.usePagination,
      paginationConfig: {
        currentPage: 0,
        pageSize: 50,
        pageSizeOptions: [25, 50, 100, 200],
        mode: 'client',
        showPageSizeSelector: true,
        showPageInfo: true,
        maxPageButtons: 5
      }
    });
  }

  /**
   * Generate sample data with performance timing
   */
  generateData(): void {
    const startTime = performance.now();
    
    const categories = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    const statuses = ['Active', 'Inactive', 'Pending', 'Complete', 'Error'];
    const namePrefix = ['Item', 'Product', 'Service', 'Component', 'Module'];

    const data = Array.from({ length: this.selectedRowCount }, (_, i) => {
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const nameIndex = Math.floor(Math.random() * namePrefix.length);
      
      return {
        id: i + 1,
        name: `${namePrefix[nameIndex]} ${String(i + 1).padStart(6, '0')}`,
        category: categories[categoryIndex],
        value: Math.floor(Math.random() * 10000) / 100,
        status: statuses[statusIndex],
        created: new Date(
          2020 + Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ).toISOString().split('T')[0],
        score: Math.floor(Math.random() * 100)
      };
    });

    this.data.set(data);
    
    const endTime = performance.now();
    this.generationTime.set(Math.round(endTime - startTime));
    
    // Simulate render time measurement
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      this.renderTime.set(Math.round(renderEnd - endTime));
    });
  }

  /**
   * Handle row count change
   */
  onRowCountChange(): void {
    // Update virtual scrolling recommendation
    this.useVirtualScrolling = this.selectedRowCount > 1000;
    this.updateVirtualScrolling();
  }

  /**
   * Update virtual scrolling setting
   */
  updateVirtualScrolling(): void {
    // If enabling virtual scrolling, disable pagination
    if (this.useVirtualScrolling) {
      this.usePagination = false;
    }
    
    this.config.update(config => ({
      ...config,
      virtualScrolling: this.useVirtualScrolling,
      pagination: this.usePagination
    }));
  }

  /**
   * Update pagination setting
   */
  updatePagination(): void {
    // If enabling pagination, disable virtual scrolling for large datasets
    if (this.usePagination) {
      this.useVirtualScrolling = false;
    }
    
    this.config.update(config => ({
      ...config,
      virtualScrolling: this.useVirtualScrolling,
      pagination: this.usePagination
    }));
  }

  /**
   * Handle grid events
   */
  onGridEvent(event: any): void {
    // Performance monitoring for events
    console.log('Grid event:', event.type, performance.now());
  }

  /**
   * Load custom dataset for testing (called by e2e tests)
   */
  loadCustomDataset(dataset: any): void {
    const startTime = performance.now();
    
    if (dataset.columns) {
      this.columns.set(dataset.columns);
    }
    
    if (dataset.rows) {
      this.data.set(dataset.rows);
    }
    
    const endTime = performance.now();
    this.generationTime.set(Math.round(endTime - startTime));
    
    // Simulate render time measurement
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      this.renderTime.set(Math.round(renderEnd - endTime));
    });
  }

  /**
   * Get current performance metrics for testing
   */
  getPerformanceMetrics() {
    return {
      generationTime: this.generationTime(),
      renderTime: this.renderTime(),
      rowCount: this.data().length,
      memoryUsage: this.formatMemoryUsage()
    };
  }


  /**
   * Format memory usage for display
   */
  private formatMemoryUsage(): string {
    let totalSize: number;
    
    if ((performance as any).memory) {
      totalSize = (performance as any).memory.usedJSHeapSize;
    } else {
      // Estimate memory usage based on data size
      const rowSize = 200; // Approximate bytes per row
      totalSize = this.data().length * rowSize;
    }
    
    if (totalSize < 1024) return `${totalSize} B`;
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
    return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
  }
}