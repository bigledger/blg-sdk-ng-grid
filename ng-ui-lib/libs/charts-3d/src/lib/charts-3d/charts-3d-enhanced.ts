import { Component, Input, ChangeDetectionStrategy, ViewChild, ElementRef, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChart3DComponent } from '../charts/bar-chart-3d.component';
import { ScatterChart3DComponent } from '../charts/scatter-chart-3d.component';
import { GlobeChart3DComponent } from '../charts/globe-chart-3d.component';
import { ChartExportComponent } from '@ng-ui/charts-core';
import { Chart3DConfig, Chart3DData, Chart3DType } from '../types/chart-3d.types';

/**
 * Enhanced 3D Charts component with export capabilities
 */
@Component({
  selector: 'ng-ui-charts-3d',
  standalone: true,
  imports: [
    CommonModule,
    BarChart3DComponent,
    ScatterChart3DComponent,
    GlobeChart3DComponent,
    ChartExportComponent
  ],
  template: `
    <div class="chart-3d-container" #chartContainer data-chart-3d data-chart-export-target>
      <!-- Export Toolbar -->
      <div class="chart-toolbar" *ngIf="enableExport">
        <ng-ui-chart-export
          [chartElement]="chartElement"
          [chartData]="chartData"
          [chartConfig]="chartConfig"
          [availableFormats]="exportFormats"
          [showQuickButtons]="true"
          (exportComplete)="onExportComplete($event)"
          (exportError)="onExportError($event)">
        </ng-ui-chart-export>
      </div>

      <!-- Chart Content -->
      <div class="chart-content">
        <ng-container [ngSwitch]="config.type">
          <ng-ui-bar-chart-3d
            *ngSwitchCase="'3d-bar'"
            [config]="config"
            [data]="data"
            [showStats]="showStats"
            (chartClick)="onChartClick($event)"
            (chartHover)="onChartHover($event)"
            (chartSelect)="onChartSelect($event)"
            (initialized)="onInitialized()"
            (error)="onError($event)"
          ></ng-ui-bar-chart-3d>
          
          <ng-ui-scatter-chart-3d
            *ngSwitchCase="'3d-scatter'"
            [config]="config"
            [data]="data"
            [showStats]="showStats"
            (chartClick)="onChartClick($event)"
            (chartHover)="onChartHover($event)"
            (chartSelect)="onChartSelect($event)"
            (initialized)="onInitialized()"
            (error)="onError($event)"
          ></ng-ui-scatter-chart-3d>
          
          <ng-ui-globe-chart-3d
            *ngSwitchCase="'3d-globe'"
            [config]="config"
            [data]="data"
            [showStats]="showStats"
            (chartClick)="onChartClick($event)"
            (chartHover)="onChartHover($event)"
            (chartSelect)="onChartSelect($event)"
            (initialized)="onInitialized()"
            (error)="onError($event)"
          ></ng-ui-globe-chart-3d>
          
          <div *ngSwitchDefault class="chart-3d-error">
            <span>Unsupported chart type: {{ config.type }}</span>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrl: './charts-3d.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Enhanced3DChartsComponent implements AfterViewInit {
  @Input() config: Chart3DConfig = { type: '3d-bar' };
  @Input() data: Chart3DData[] = [];
  @Input() showStats = false;
  @Input() enableExport = true;
  @Input() exportFormats = signal(['png', 'pdf', 'excel', 'obj', 'gltf', 'stl']);

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLElement>;

  // Export-related properties
  chartElement = signal<HTMLElement | null>(null);
  chartData = signal<Chart3DData[]>([]);
  chartConfig = signal<Chart3DConfig>({ type: '3d-bar' });

  ngAfterViewInit(): void {
    this.chartElement.set(this.chartContainer.nativeElement);
    this.chartData.set(this.data);
    this.chartConfig.set(this.config);
  }

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
    
    // Update chart element reference after initialization
    this.chartElement.set(this.chartContainer.nativeElement);
  }

  onError(error: Error): void {
    // Handle chart errors
    console.error('Chart error:', error);
  }

  onExportComplete(result: any): void {
    console.log('Export completed:', result);
    // Handle successful export
  }

  onExportError(error: string): void {
    console.error('Export error:', error);
    // Handle export error
  }
}

// Legacy exports for backwards compatibility
export { Enhanced3DChartsComponent as Charts3DComponent };
export { Enhanced3DChartsComponent as Charts3d };