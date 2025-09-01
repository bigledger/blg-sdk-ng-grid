import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChart3DComponent } from '../charts/bar-chart-3d.component';
import { ScatterChart3DComponent } from '../charts/scatter-chart-3d.component';
import { GlobeChart3DComponent } from '../charts/globe-chart-3d.component';
import { Chart3DConfig, Chart3DData, Chart3DType } from '../types/chart-3d.types';

/**
 * Main 3D Charts component - delegates to specific chart types
 */
@Component({
  selector: 'ng-ui-charts-3d',
  standalone: true,
  imports: [
    CommonModule,
    BarChart3DComponent,
    ScatterChart3DComponent,
    GlobeChart3DComponent
  ],
  templateUrl: './charts-3d.html',
  styleUrl: './charts-3d.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Charts3DComponent {
  @Input() config: Chart3DConfig = { type: '3d-bar' };
  @Input() data: Chart3DData[] = [];
  @Input() showStats = false;

  onChartClick(event: any): void {
    // Handle chart click events
    console.log('Chart clicked:', event);
  }

  onChartHover(event: any): void {
    // Handle chart hover events
    console.log('Chart hover:', event);
  }

  onChartSelect(event: any): void {
    // Handle chart selection events
    console.log('Chart select:', event);
  }

  onInitialized(): void {
    // Handle chart initialization
    console.log('Chart initialized');
  }

  onError(error: Error): void {
    // Handle chart errors
    console.error('Chart error:', error);
  }
}

// Legacy export for backwards compatibility
export { Charts3DComponent as Charts3d };