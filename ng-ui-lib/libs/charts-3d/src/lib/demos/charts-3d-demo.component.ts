import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Charts3DComponent } from '../charts-3d/charts-3d';
import {
  Chart3DConfig,
  Chart3DData,
  Chart3DType,
  BarChart3DConfig,
  ScatterChart3DConfig,
  GlobeChart3DConfig
} from '../types/chart-3d.types';

/**
 * Demo component showcasing 3D chart capabilities
 */
@Component({
  selector: 'ng-ui-charts-3d-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, Charts3DComponent],
  template: `
    <div class="demo-container">
      <header class="demo-header">
        <h1>BigLedger 3D Charts Demo</h1>
        <p>Interactive 3D data visualizations powered by WebGL and Three.js</p>
      </header>

      <nav class="demo-nav">
        <button 
          *ngFor="let chart of chartTypes"
          [class.active]="selectedChartType() === chart.type"
          (click)="selectChartType(chart.type)"
          class="nav-button"
        >
          {{ chart.name }}
        </button>
      </nav>

      <div class="demo-content">
        <div class="chart-section">
          <div class="chart-controls">
            <h3>{{ getCurrentChartName() }}</h3>
            
            <div class="control-group">
              <label>
                <input 
                  type="checkbox" 
                  [checked]="showStats()"
                  (change)="toggleStats()"
                >
                Show Performance Stats
              </label>
            </div>
            
            <div class="control-group">
              <label>
                Animation Speed:
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  [value]="animationSpeed()"
                  (input)="setAnimationSpeed($event)"
                >
                {{ animationSpeed() }}x
              </label>
            </div>
            
            <div class="control-group" *ngIf="selectedChartType() === '3d-globe'">
              <label>
                Rotation Speed:
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="0.1" 
                  [value]="rotationSpeed()"
                  (input)="setRotationSpeed($event)"
                >
                {{ rotationSpeed() }}x
              </label>
            </div>
            
            <div class="control-group">
              <button (click)="generateNewData()" class="generate-button">
                Generate New Data
              </button>
            </div>
            
            <div class="control-group">
              <button (click)="resetCamera()" class="reset-button">
                Reset Camera
              </button>
            </div>
          </div>

          <div class="chart-container">
            <ng-ui-charts-3d
              [config]="currentConfig()"
              [data]="currentData()"
              [showStats]="showStats()"
              (chartClick)="onChartClick($event)"
              (chartHover)="onChartHover($event)"
              (chartSelect)="onChartSelect($event)"
              (initialized)="onChartInitialized()"
              (error)="onChartError($event)"
            ></ng-ui-charts-3d>
          </div>
        </div>

        <aside class="info-panel">
          <h3>Chart Information</h3>
          <div class="chart-info">
            <p><strong>Type:</strong> {{ getCurrentChartName() }}</p>
            <p><strong>Data Points:</strong> {{ getTotalDataPoints() }}</p>
            <p><strong>Series:</strong> {{ currentData().length }}</p>
            <p><strong>WebGL:</strong> ✅ Enabled</p>
            <p><strong>Performance Optimizations:</strong></p>
            <ul>
              <li>Level of Detail (LOD)</li>
              <li>Frustum Culling</li>
              <li>Instanced Rendering</li>
              <li>Texture Atlasing</li>
            </ul>
          </div>

          <div class="features-list">
            <h4>Interactive Features</h4>
            <ul>
              <li>🖱️ Mouse rotation and zoom</li>
              <li>📱 Touch gestures</li>
              <li>🎯 Object selection</li>
              <li>💫 Hover effects</li>
              <li>🎬 Smooth animations</li>
              <li>📊 Real-time data updates</li>
            </ul>
          </div>

          <div class="performance-info" *ngIf="showStats()">
            <h4>Performance Metrics</h4>
            <div class="metrics">
              <div class="metric">
                <span class="label">FPS:</span>
                <span class="value">{{ performanceStats().fps }}</span>
              </div>
              <div class="metric">
                <span class="label">Draw Calls:</span>
                <span class="value">{{ performanceStats().drawCalls }}</span>
              </div>
              <div class="metric">
                <span class="label">Triangles:</span>
                <span class="value">{{ performanceStats().triangles.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="event-log">
            <h4>Event Log</h4>
            <div class="log-entries">
              <div 
                *ngFor="let event of eventLog().slice(-5); trackBy: trackByEvent" 
                class="log-entry"
                [class]="'log-' + event.type"
              >
                <span class="timestamp">{{ event.timestamp | date:'HH:mm:ss.SSS' }}</span>
                <span class="event-type">{{ event.type }}</span>
                <span class="event-data">{{ event.data }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styleUrls: ['./charts-3d-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Charts3DDemoComponent implements OnInit {
  // State signals
  private _selectedChartType = signal<Chart3DType>('3d-bar');
  private _showStats = signal(false);
  private _animationSpeed = signal(1);
  private _rotationSpeed = signal(0.5);
  private _eventLog = signal<Array<{
    timestamp: Date;
    type: string;
    data: string;
  }>>([]);
  private _performanceStats = signal({
    fps: 60,
    drawCalls: 0,
    triangles: 0
  });

  // Public readonly signals
  public readonly selectedChartType = this._selectedChartType.asReadonly();
  public readonly showStats = this._showStats.asReadonly();
  public readonly animationSpeed = this._animationSpeed.asReadonly();
  public readonly rotationSpeed = this._rotationSpeed.asReadonly();
  public readonly eventLog = this._eventLog.asReadonly();
  public readonly performanceStats = this._performanceStats.asReadonly();

  // Chart configurations
  public readonly chartTypes = [
    { type: '3d-bar' as Chart3DType, name: '3D Bar Chart' },
    { type: '3d-scatter' as Chart3DType, name: '3D Scatter Plot' },
    { type: '3d-globe' as Chart3DType, name: '3D Globe' }
  ];

  // Data signals
  private _barData = signal<Chart3DData[]>([]);
  private _scatterData = signal<Chart3DData[]>([]);
  private _globeData = signal<Chart3DData[]>([]);

  // Configuration signals
  private _barConfig = signal<BarChart3DConfig>({
    type: '3d-bar',
    width: 800,
    height: 600,
    background: '#1a1a1a',
    camera: {
      position: [15, 15, 15],
      lookAt: [0, 5, 0]
    },
    controls: {
      enabled: true,
      enableZoom: true,
      enablePan: true,
      enableRotate: true,
      autoRotate: false,
      dampingFactor: 0.05
    },
    lighting: {
      ambient: { color: 0x404040, intensity: 0.4 },
      directional: [{
        color: 0xffffff,
        intensity: 1,
        position: [50, 50, 50],
        castShadow: true
      }]
    },
    animation: {
      duration: 2000,
      autoStart: true
    },
    performance: {
      levelOfDetail: true,
      frustumCulling: true,
      instancedRendering: false
    },
    bars: {
      width: 0.8,
      depth: 0.8,
      spacing: 0.2,
      gradient: true,
      material: {
        type: 'standard',
        roughness: 0.7,
        metalness: 0.1
      }
    }
  });

  private _scatterConfig = signal<ScatterChart3DConfig>({
    type: '3d-scatter',
    width: 800,
    height: 600,
    background: '#1a1a1a',
    camera: {
      position: [15, 15, 15],
      lookAt: [0, 0, 0]
    },
    controls: {
      enabled: true,
      enableZoom: true,
      enablePan: true,
      enableRotate: true,
      autoRotate: false,
      dampingFactor: 0.05
    },
    lighting: {
      ambient: { color: 0x404040, intensity: 0.4 },
      directional: [{
        color: 0xffffff,
        intensity: 1,
        position: [50, 50, 50],
        castShadow: true
      }]
    },
    animation: {
      duration: 2000,
      autoStart: true
    },
    performance: {
      levelOfDetail: true,
      frustumCulling: true,
      instancedRendering: true
    },
    points: {
      size: 0.2,
      shape: 'sphere',
      sizeByValue: true,
      material: {
        type: 'standard',
        roughness: 0.5,
        metalness: 0.2
      }
    }
  });

  private _globeConfig = signal<GlobeChart3DConfig>({
    type: '3d-globe',
    width: 800,
    height: 600,
    background: '#000011',
    camera: {
      position: [0, 0, 15],
      lookAt: [0, 0, 0]
    },
    controls: {
      enabled: true,
      enableZoom: true,
      enablePan: true,
      enableRotate: true,
      autoRotate: false,
      dampingFactor: 0.05
    },
    lighting: {
      ambient: { color: 0x404040, intensity: 0.6 },
      directional: [{
        color: 0xffffff,
        intensity: 0.8,
        position: [50, 0, 50]
      }]
    },
    animation: {
      duration: 3000,
      autoStart: true
    },
    globe: {
      radius: 5,
      segments: 64,
      atmosphere: true,
      rotation: {
        enabled: true,
        speed: 0.5
      }
    }
  });

  ngOnInit(): void {
    this.generateAllData();
    this.startPerformanceMonitoring();
  }

  // Computed properties
  public currentConfig = () => {
    switch (this.selectedChartType()) {
      case '3d-bar': return this._barConfig();
      case '3d-scatter': return this._scatterConfig();
      case '3d-globe': return this._globeConfig();
      default: return this._barConfig();
    }
  };

  public currentData = () => {
    switch (this.selectedChartType()) {
      case '3d-bar': return this._barData();
      case '3d-scatter': return this._scatterData();
      case '3d-globe': return this._globeData();
      default: return this._barData();
    }
  };

  public getCurrentChartName = () => {
    const chart = this.chartTypes.find(c => c.type === this.selectedChartType());
    return chart ? chart.name : 'Unknown';
  };

  public getTotalDataPoints = () => {
    return this.currentData().reduce((total, series) => total + series.data.length, 0);
  };

  // Actions
  public selectChartType(type: Chart3DType): void {
    this._selectedChartType.set(type);
    this.logEvent('chart-switch', `Switched to ${this.getCurrentChartName()}`);
  }

  public toggleStats(): void {
    this._showStats.update(current => !current);
    this.logEvent('toggle-stats', `Stats ${this.showStats() ? 'enabled' : 'disabled'}`);
  }

  public setAnimationSpeed(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this._animationSpeed.set(value);
    this.updateAnimationSpeeds();
    this.logEvent('animation-speed', `Set to ${value}x`);
  }

  public setRotationSpeed(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this._rotationSpeed.set(value);
    this.updateGlobeRotationSpeed();
    this.logEvent('rotation-speed', `Set to ${value}x`);
  }

  public generateNewData(): void {
    this.generateAllData();
    this.logEvent('data-generate', `Generated new data (${this.getTotalDataPoints()} points)`);
  }

  public resetCamera(): void {
    // This would need to be implemented by emitting an event or calling a method on the chart
    this.logEvent('camera-reset', 'Camera reset to default position');
  }

  // Data generation
  private generateAllData(): void {
    this.generateBarData();
    this.generateScatterData();
    this.generateGlobeData();
  }

  private generateBarData(): void {
    const series: Chart3DData[] = [
      {
        name: 'Q1 Sales',
        color: '#4CAF50',
        data: []
      },
      {
        name: 'Q2 Sales',
        color: '#2196F3',
        data: []
      },
      {
        name: 'Q3 Sales',
        color: '#FF9800',
        data: []
      }
    ];

    const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    categories.forEach((category, x) => {
      series.forEach((s, seriesIndex) => {
        s.data.push({
          x: x,
          y: Math.random() * 100 + 20, // Random value between 20-120
          z: seriesIndex,
          label: category,
          value: Math.random() * 100 + 20
        });
      });
    });

    this._barData.set(series);
  }

  private generateScatterData(): void {
    const series: Chart3DData[] = [
      {
        name: 'Dataset A',
        color: '#E91E63',
        data: []
      },
      {
        name: 'Dataset B',
        color: '#9C27B0',
        data: []
      },
      {
        name: 'Dataset C',
        color: '#00BCD4',
        data: []
      }
    ];

    series.forEach(s => {
      for (let i = 0; i < 150; i++) {
        s.data.push({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 20,
          value: Math.random() * 100,
          label: `Point ${i + 1}`
        });
      }
    });

    this._scatterData.set(series);
  }

  private generateGlobeData(): void {
    const series: Chart3DData[] = [
      {
        name: 'Major Cities',
        color: '#FF6B6B',
        data: []
      }
    ];

    // Major world cities with lat/lon coordinates
    const cities = [
      { name: 'New York', lat: 40.7128, lon: -74.0060, population: 8.4 },
      { name: 'London', lat: 51.5074, lon: -0.1278, population: 9.0 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, population: 37.4 },
      { name: 'Paris', lat: 48.8566, lon: 2.3522, population: 11.2 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, population: 5.3 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, population: 20.7 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333, population: 12.3 },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357, population: 10.2 }
    ];

    cities.forEach(city => {
      series[0].data.push({
        x: city.lon,
        y: city.lat,
        z: 0,
        value: city.population,
        label: city.name,
        metadata: {
          lat: city.lat,
          lon: city.lon,
          population: city.population
        }
      });
    });

    this._globeData.set(series);
  }

  // Configuration updates
  private updateAnimationSpeeds(): void {
    const speed = this.animationSpeed();
    const baseDuration = 2000;
    const newDuration = baseDuration / speed;

    this._barConfig.update(config => ({
      ...config,
      animation: {
        ...config.animation,
        duration: newDuration
      }
    }));

    this._scatterConfig.update(config => ({
      ...config,
      animation: {
        ...config.animation,
        duration: newDuration
      }
    }));
  }

  private updateGlobeRotationSpeed(): void {
    const speed = this.rotationSpeed();
    
    this._globeConfig.update(config => ({
      ...config,
      globe: {
        ...config.globe,
        rotation: {
          ...config.globe!.rotation,
          speed
        }
      }
    }));
  }

  // Performance monitoring
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this._performanceStats.update(stats => ({
        ...stats,
        fps: Math.floor(Math.random() * 10 + 55), // Simulate FPS
        drawCalls: Math.floor(Math.random() * 50 + 10),
        triangles: Math.floor(Math.random() * 10000 + 5000)
      }));
    }, 1000);
  }

  // Event handling
  public onChartClick(event: any): void {
    this.logEvent('click', `Clicked on ${event.target?.name || 'unknown object'}`);
  }

  public onChartHover(event: any): void {
    this.logEvent('hover', `Hovered over ${event.target?.name || 'unknown object'}`);
  }

  public onChartSelect(event: any): void {
    this.logEvent('select', `Selected ${event.selected?.length || 0} objects`);
  }

  public onChartInitialized(): void {
    this.logEvent('init', 'Chart initialized successfully');
  }

  public onChartError(error: Error): void {
    this.logEvent('error', error.message);
  }

  // Utilities
  private logEvent(type: string, data: string): void {
    this._eventLog.update(log => {
      const newEntry = {
        timestamp: new Date(),
        type,
        data
      };
      
      // Keep only last 50 events
      const updatedLog = [...log, newEntry];
      return updatedLog.slice(-50);
    });
  }

  public trackByEvent(index: number, event: any): string {
    return `${event.timestamp.getTime()}-${event.type}`;
  }
}
