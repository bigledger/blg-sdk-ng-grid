import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BasicExampleComponent } from './examples/basic-example.component';
import { PerformanceExampleComponent } from './examples/performance-example.component';
import { FilteringExampleComponent } from './examples/filtering-example.component';
import { GroupingExportExampleComponent } from './examples/grouping-export-example.component';
import { PerformanceDashboardComponent } from './examples/performance-dashboard.component';

/**
 * Main Demo Application Component
 * 
 * Showcases the BLG Grid component with various examples:
 * - Basic grid functionality
 * - Performance with large datasets
 * - Advanced filtering capabilities
 */
@Component({
  imports: [
    CommonModule,
    RouterModule,
    BasicExampleComponent,
    PerformanceExampleComponent,
    FilteringExampleComponent,
    GroupingExportExampleComponent,
    PerformanceDashboardComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'BLG Grid Demo';
  currentExample = 'basic';

  examples = [
    { id: 'basic', title: 'Basic Grid', description: 'Core functionality with 1,000 rows' },
    { id: 'performance', title: 'Performance', description: 'Large datasets up to 500,000 rows' },
    { id: 'filtering', title: 'Advanced Filtering', description: 'Complex filtering with various data types' },
    { id: 'grouping-export', title: 'Grouping & Export', description: 'Row grouping with aggregations and data export' },
    { id: 'performance-dashboard', title: 'Performance Dashboard', description: 'Real-time monitoring and benchmarking' }
  ];

  /**
   * Switch between different examples
   */
  selectExample(exampleId: string): void {
    this.currentExample = exampleId;
  }

  /**
   * Get the current example info
   */
  getCurrentExample() {
    return this.examples.find(ex => ex.id === this.currentExample) || this.examples[0];
  }
}
