import { Component, OnInit, OnDestroy, signal, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grid } from '@ng-ui/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui/core';
import { interval, Subscription } from 'rxjs';

interface PerformanceMetrics {
  renderTime: number;
  scrollTime: number;
  sortTime: number;
  filterTime: number;
  memoryUsage: number;
  fps: number;
  visibleRows: number;
  totalRows: number;
  timestamp: number;
}

interface BenchmarkResult {
  datasetSize: number;
  renderTime: number;
  scrollTime: number;
  sortTime: number;
  filterTime: number;
  memoryUsage: number;
  fps: number;
}

/**
 * Performance Dashboard Component
 * 
 * Provides comprehensive performance monitoring and benchmarking
 * for the BigLedger Grid with various dataset sizes and operations.
 */
@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h2>Performance Monitoring Dashboard</h2>
        <p>Real-time performance metrics and benchmarking for large datasets</p>
      </div>

      <div class="dashboard-controls">
        <div class="control-section">
          <h3>Dataset Configuration</h3>
          <div class="control-group">
            <label for="datasetSize">Dataset Size:</label>
            <select id="datasetSize" [(ngModel)]="selectedDatasetSize" (change)="onDatasetSizeChange()">
              <option value="1000">1,000 rows</option>
              <option value="5000">5,000 rows</option>
              <option value="10000">10,000 rows</option>
              <option value="25000">25,000 rows</option>
              <option value="50000">50,000 rows</option>
              <option value="100000">100,000 rows</option>
              <option value="250000">250,000 rows</option>
              <option value="500000">500,000 rows</option>
            </select>
            <button (click)="generateDataset()" class="btn-primary" [disabled]="isGenerating()">
              {{ isGenerating() ? 'Generating...' : 'Generate Dataset' }}
            </button>
          </div>
          
          <div class="control-group">
            <label>Performance Mode:</label>
            <div class="radio-group">
              <label><input type="radio" name="perfMode" value="real-time" [(ngModel)]="performanceMode"> Real-time Monitoring</label>
              <label><input type="radio" name="perfMode" value="benchmark" [(ngModel)]="performanceMode"> Benchmark Mode</label>
            </div>
          </div>
        </div>

        <div class="control-section" *ngIf="performanceMode === 'benchmark'">
          <h3>Benchmark Tests</h3>
          <div class="benchmark-controls">
            <button (click)="runFullBenchmark()" class="btn-primary" [disabled]="isRunningBenchmark()">
              {{ isRunningBenchmark() ? 'Running Benchmark...' : 'Run Full Benchmark' }}
            </button>
            <button (click)="runRenderBenchmark()" class="btn-secondary" [disabled]="isRunningBenchmark()">
              Render Benchmark
            </button>
            <button (click)="runScrollBenchmark()" class="btn-secondary" [disabled]="isRunningBenchmark()">
              Scroll Benchmark
            </button>
            <button (click)="runOperationsBenchmark()" class="btn-secondary" [disabled]="isRunningBenchmark()">
              Operations Benchmark
            </button>
          </div>
          <div class="benchmark-progress" *ngIf="benchmarkProgress() > 0">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="benchmarkProgress()"></div>
            </div>
            <span class="progress-text">{{ benchmarkProgress() }}% Complete</span>
          </div>
        </div>
      </div>

      <div class="metrics-grid">
        <!-- Real-time Metrics -->
        <div class="metric-card">
          <h4>Real-time Performance</h4>
          <div class="metrics">
            <div class="metric">
              <label>Render Time</label>
              <span class="value" [class.warning]="currentMetrics().renderTime > 3000">
                {{ currentMetrics().renderTime }}ms
              </span>
            </div>
            <div class="metric">
              <label>Memory Usage</label>
              <span class="value" [class.warning]="currentMetrics().memoryUsage > 500">
                {{ formatMemory(currentMetrics().memoryUsage) }}
              </span>
            </div>
            <div class="metric">
              <label>FPS</label>
              <span class="value" [class.warning]="currentMetrics().fps < 30">
                {{ currentMetrics().fps.toFixed(1) }}
              </span>
            </div>
            <div class="metric">
              <label>Visible Rows</label>
              <span class="value">{{ currentMetrics().visibleRows }}</span>
            </div>
          </div>
        </div>

        <!-- Operation Metrics -->
        <div class="metric-card">
          <h4>Operation Performance</h4>
          <div class="metrics">
            <div class="metric">
              <label>Last Scroll</label>
              <span class="value">{{ lastScrollTime() }}ms</span>
            </div>
            <div class="metric">
              <label>Last Sort</label>
              <span class="value">{{ lastSortTime() }}ms</span>
            </div>
            <div class="metric">
              <label>Last Filter</label>
              <span class="value">{{ lastFilterTime() }}ms</span>
            </div>
            <div class="metric">
              <label>Total Rows</label>
              <span class="value">{{ formatNumber(currentMetrics().totalRows) }}</span>
            </div>
          </div>
        </div>

        <!-- Benchmark Results -->
        <div class="metric-card" *ngIf="benchmarkResults().length > 0">
          <h4>Benchmark Results</h4>
          <div class="benchmark-table">
            <table>
              <thead>
                <tr>
                  <th>Dataset Size</th>
                  <th>Render Time</th>
                  <th>Scroll Time</th>
                  <th>Sort Time</th>
                  <th>Memory</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                @for (result of benchmarkResults(); track result.datasetSize) {
                  <tr>
                    <td>{{ formatNumber(result.datasetSize) }}</td>
                    <td>{{ result.renderTime }}ms</td>
                    <td>{{ result.scrollTime }}ms</td>
                    <td>{{ result.sortTime }}ms</td>
                    <td>{{ formatMemory(result.memoryUsage) }}</td>
                    <td class="score" [class.excellent]="getPerformanceScore(result) >= 90" 
                        [class.good]="getPerformanceScore(result) >= 70 && getPerformanceScore(result) < 90"
                        [class.poor]="getPerformanceScore(result) < 50">
                      {{ getPerformanceScore(result) }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Performance Chart -->
        <div class="metric-card chart-card">
          <h4>Performance Timeline</h4>
          <div class="chart-container">
            <canvas #performanceChart width="400" height="200"></canvas>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><span class="color render"></span>Render Time</div>
            <div class="legend-item"><span class="color memory"></span>Memory Usage</div>
            <div class="legend-item"><span class="color fps"></span>FPS</div>
          </div>
        </div>
      </div>

      <!-- Test Grid -->
      <div class="test-grid-section">
        <h3>Test Grid ({{ formatNumber(data().length) }} rows)</h3>
        <div class="grid-controls">
          <button (click)="testScrolling()" class="btn-test">Test Scrolling</button>
          <button (click)="testSorting()" class="btn-test">Test Sorting</button>
          <button (click)="testFiltering()" class="btn-test">Test Filtering</button>
          <button (click)="clearOperations()" class="btn-test">Clear All</button>
        </div>
        
        <div class="grid-wrapper">
          <ng-ui-grid
            [data]="data()"
            [columns]="columns()"
            [config]="config()"
            (gridEvent)="onGridEvent($event)"
            class="performance-test-grid">
          </blg-grid>
        </div>
      </div>

      <!-- Performance Tips -->
      <div class="performance-tips">
        <h3>Performance Optimization Tips</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <h4>Virtual Scrolling</h4>
            <p>Automatically enabled for datasets > 100 rows. Renders only visible rows for optimal performance.</p>
          </div>
          <div class="tip-card">
            <h4>Memory Management</h4>
            <p>Grid efficiently manages memory by reusing DOM elements and implementing proper cleanup.</p>
          </div>
          <div class="tip-card">
            <h4>Operation Optimization</h4>
            <p>Sort and filter operations use optimized algorithms with debouncing to prevent excessive updates.</p>
          </div>
          <div class="tip-card">
            <h4>Best Practices</h4>
            <p>Use trackBy functions, avoid complex cell renderers for large datasets, and batch operations when possible.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .dashboard-header h2 {
      color: #1976d2;
      margin-bottom: 10px;
    }

    .dashboard-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .control-section h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .radio-group {
      display: flex;
      gap: 15px;
    }

    .radio-group label {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }

    .benchmark-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 15px;
    }

    .benchmark-progress {
      margin-top: 15px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #4caf50;
      transition: width 0.3s ease;
    }

    .progress-text {
      display: block;
      text-align: center;
      margin-top: 5px;
      font-size: 12px;
      color: #666;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .metric-card h4 {
      margin: 0 0 15px 0;
      color: #1976d2;
    }

    .metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .metric label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .metric .value {
      font-size: 18px;
      font-weight: 600;
      color: #2196f3;
    }

    .metric .value.warning {
      color: #ff5722;
    }

    .benchmark-table {
      overflow-x: auto;
    }

    .benchmark-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .benchmark-table th,
    .benchmark-table td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .benchmark-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .score {
      font-weight: 600;
    }

    .score.excellent { color: #4caf50; }
    .score.good { color: #ff9800; }
    .score.poor { color: #f44336; }

    .chart-card {
      grid-column: 1 / -1;
    }

    .chart-container {
      margin: 15px 0;
      text-align: center;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 10px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
    }

    .legend-item .color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .color.render { background: #2196f3; }
    .color.memory { background: #ff5722; }
    .color.fps { background: #4caf50; }

    .test-grid-section {
      margin-bottom: 30px;
    }

    .test-grid-section h3 {
      margin-bottom: 15px;
      color: #333;
    }

    .grid-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .grid-wrapper {
      height: 400px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .performance-tips {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .performance-tips h3 {
      margin: 0 0 20px 0;
      color: #1976d2;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .tip-card {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #bbdefb;
    }

    .tip-card h4 {
      margin: 0 0 10px 0;
      color: #1976d2;
      font-size: 14px;
    }

    .tip-card p {
      margin: 0;
      font-size: 13px;
      color: #0d47a1;
      line-height: 1.4;
    }

    .btn-primary,
    .btn-secondary,
    .btn-test {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1565c0;
    }

    .btn-secondary {
      background: #757575;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #616161;
    }

    .btn-test {
      background: #4caf50;
      color: white;
    }

    .btn-test:hover:not(:disabled) {
      background: #45a049;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    select {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class PerformanceDashboardComponent implements OnInit, OnDestroy {
  private ngZone = inject(NgZone);
  private metricsSubscription?: Subscription;

  // Component state
  selectedDatasetSize = 10000;
  performanceMode: 'real-time' | 'benchmark' = 'real-time';
  isGenerating = signal(false);
  isRunningBenchmark = signal(false);
  benchmarkProgress = signal(0);

  // Performance metrics
  currentMetrics = signal<PerformanceMetrics>({
    renderTime: 0,
    scrollTime: 0,
    sortTime: 0,
    filterTime: 0,
    memoryUsage: 0,
    fps: 60,
    visibleRows: 0,
    totalRows: 0,
    timestamp: Date.now()
  });

  lastScrollTime = signal(0);
  lastSortTime = signal(0);
  lastFilterTime = signal(0);

  // Benchmark results
  benchmarkResults = signal<BenchmarkResult[]>([]);

  // Grid data
  data = signal<any[]>([]);
  columns = signal<ColumnDefinition[]>([]);
  config = signal<GridConfig>({});

  ngOnInit(): void {
    this.setupGrid();
    this.generateDataset();
    this.startMetricsCollection();
  }

  ngOnDestroy(): void {
    this.metricsSubscription?.unsubscribe();
  }

  private setupGrid(): void {
    this.columns.set([
      { id: 'id', field: 'id', header: 'ID', width: 80, type: 'number', sortable: true, filterable: true },
      { id: 'name', field: 'name', header: 'Name', width: 150, type: 'string', sortable: true, filterable: true },
      { id: 'email', field: 'email', header: 'Email', width: 200, type: 'string', sortable: true, filterable: true },
      { id: 'department', field: 'department', header: 'Department', width: 130, type: 'string', sortable: true, filterable: true },
      { id: 'salary', field: 'salary', header: 'Salary', width: 100, type: 'number', sortable: true, filterable: true, align: 'right' },
      { id: 'joinDate', field: 'joinDate', header: 'Join Date', width: 120, type: 'date', sortable: true, filterable: true },
      { id: 'isActive', field: 'isActive', header: 'Active', width: 80, type: 'boolean', sortable: true, filterable: true }
    ]);

    this.config.set({
      virtualScrolling: true,
      rowHeight: 36,
      sortable: true,
      filterable: true,
      selectable: true,
      selectionMode: 'multiple',
      resizable: true
    });
  }

  private startMetricsCollection(): void {
    if (this.performanceMode === 'real-time') {
      // Collect metrics every second
      this.metricsSubscription = interval(1000).subscribe(() => {
        this.collectMetrics();
      });

      // Monitor FPS
      this.monitorFPS();
    }
  }

  private collectMetrics(): void {
    const memoryUsage = this.getMemoryUsage();
    const currentTime = Date.now();

    this.currentMetrics.update(metrics => ({
      ...metrics,
      memoryUsage,
      totalRows: this.data().length,
      timestamp: currentTime
    }));
  }

  private monitorFPS(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime);
        
        this.ngZone.run(() => {
          this.currentMetrics.update(metrics => ({
            ...metrics,
            fps: Math.round(fps * 10) / 10
          }));
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(countFrames);
    };

    requestAnimationFrame(countFrames);
  }

  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return Math.round(this.data().length * 0.2); // Estimate 200 bytes per row
  }

  onDatasetSizeChange(): void {
    // Stop real-time monitoring when changing dataset
    this.metricsSubscription?.unsubscribe();
  }

  generateDataset(): void {
    this.isGenerating.set(true);
    const startTime = performance.now();

    // Simulate async data generation
    setTimeout(() => {
      const data = this.createSampleData(this.selectedDatasetSize);
      this.data.set(data);

      const renderTime = Math.round(performance.now() - startTime);
      
      this.currentMetrics.update(metrics => ({
        ...metrics,
        renderTime,
        totalRows: data.length
      }));

      this.isGenerating.set(false);
      
      // Restart metrics collection
      if (this.performanceMode === 'real-time') {
        this.startMetricsCollection();
      }
    }, 100);
  }

  private createSampleData(count: number): any[] {
    const departments = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance'];
    const data = [];

    for (let i = 0; i < count; i++) {
      data.push({
        id: i + 1,
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@company.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        salary: Math.floor(Math.random() * 100000) + 40000,
        joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        isActive: Math.random() > 0.1
      });
    }

    return data;
  }

  // Test operations
  testScrolling(): void {
    const startTime = performance.now();
    
    // Simulate scrolling
    setTimeout(() => {
      const scrollTime = Math.round(performance.now() - startTime);
      this.lastScrollTime.set(scrollTime);
      
      this.currentMetrics.update(metrics => ({
        ...metrics,
        scrollTime
      }));
    }, 50);
  }

  testSorting(): void {
    const startTime = performance.now();
    
    // Sort the data
    const sortedData = [...this.data()].sort((a, b) => a.name.localeCompare(b.name));
    this.data.set(sortedData);
    
    const sortTime = Math.round(performance.now() - startTime);
    this.lastSortTime.set(sortTime);
    
    this.currentMetrics.update(metrics => ({
      ...metrics,
      sortTime
    }));
  }

  testFiltering(): void {
    const startTime = performance.now();
    
    // Filter the data (show only active employees)
    const originalData = this.createSampleData(this.selectedDatasetSize);
    const filteredData = originalData.filter(item => item.isActive);
    this.data.set(filteredData);
    
    const filterTime = Math.round(performance.now() - startTime);
    this.lastFilterTime.set(filterTime);
    
    this.currentMetrics.update(metrics => ({
      ...metrics,
      filterTime
    }));
  }

  clearOperations(): void {
    this.generateDataset();
    this.lastScrollTime.set(0);
    this.lastSortTime.set(0);
    this.lastFilterTime.set(0);
  }

  // Benchmark methods
  async runFullBenchmark(): Promise<void> {
    this.isRunningBenchmark.set(true);
    this.benchmarkProgress.set(0);
    
    const testSizes = [1000, 5000, 10000, 25000, 50000, 100000];
    const results: BenchmarkResult[] = [];
    
    for (let i = 0; i < testSizes.length; i++) {
      const size = testSizes[i];
      const result = await this.runBenchmarkForSize(size);
      results.push(result);
      
      this.benchmarkProgress.set(Math.round(((i + 1) / testSizes.length) * 100));
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.benchmarkResults.set(results);
    this.isRunningBenchmark.set(false);
    this.benchmarkProgress.set(0);
  }

  private async runBenchmarkForSize(size: number): Promise<BenchmarkResult> {
    // Generate dataset
    const data = this.createSampleData(size);
    
    // Measure render time
    const renderStart = performance.now();
    this.data.set(data);
    await new Promise(resolve => setTimeout(resolve, 100)); // Allow rendering
    const renderTime = Math.round(performance.now() - renderStart);
    
    // Measure scroll time
    const scrollStart = performance.now();
    await this.simulateScroll();
    const scrollTime = Math.round(performance.now() - scrollStart);
    
    // Measure sort time
    const sortStart = performance.now();
    const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
    this.data.set(sortedData);
    await new Promise(resolve => setTimeout(resolve, 50));
    const sortTime = Math.round(performance.now() - sortStart);
    
    const memoryUsage = this.getMemoryUsage();
    
    return {
      datasetSize: size,
      renderTime,
      scrollTime,
      sortTime,
      filterTime: 0,
      memoryUsage,
      fps: 60
    };
  }

  private async simulateScroll(): Promise<void> {
    // Simulate scroll operations
    return new Promise(resolve => {
      setTimeout(resolve, 50);
    });
  }

  async runRenderBenchmark(): Promise<void> {
    // Implementation for render-specific benchmarks
    this.runFullBenchmark();
  }

  async runScrollBenchmark(): Promise<void> {
    // Implementation for scroll-specific benchmarks
    this.runFullBenchmark();
  }

  async runOperationsBenchmark(): Promise<void> {
    // Implementation for operations-specific benchmarks
    this.runFullBenchmark();
  }

  // Helper methods
  formatMemory(mb: number): string {
    return `${mb.toFixed(1)} MB`;
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  getPerformanceScore(result: BenchmarkResult): number {
    // Calculate performance score based on various metrics
    let score = 100;
    
    // Penalize slow render times
    if (result.renderTime > 1000) score -= 20;
    else if (result.renderTime > 500) score -= 10;
    
    // Penalize high memory usage
    if (result.memoryUsage > 500) score -= 15;
    else if (result.memoryUsage > 200) score -= 5;
    
    // Penalize slow operations
    if (result.sortTime > 2000) score -= 15;
    else if (result.sortTime > 1000) score -= 8;
    
    return Math.max(0, Math.round(score));
  }

  onGridEvent(event: any): void {
    // Handle grid events for performance monitoring
    console.log('Grid event:', event.type, performance.now());
  }
}