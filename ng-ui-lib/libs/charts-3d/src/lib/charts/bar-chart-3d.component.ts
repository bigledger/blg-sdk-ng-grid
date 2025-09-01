import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { BaseChart3DComponent } from '../components/base-chart-3d.component';
import { BarChart3DConfig, Chart3DData, Chart3DDataPoint } from '../types/chart-3d.types';

/**
 * 3D Bar Chart Component
 * Creates interactive 3D bar charts with rotation, animation, and drill-down capabilities
 */
@Component({
  selector: 'ng-ui-bar-chart-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-ui-base-chart-3d
      [config]="config"
      [data]="data"
      [showStats]="showStats"
      (chartClick)="onChartClick($event)"
      (chartHover)="onChartHover($event)"
      (chartSelect)="onChartSelect($event)"
      (initialized)="onInitialized()"
      (error)="onError($event)"
    ></ng-ui-base-chart-3d>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChart3DComponent extends BaseChart3DComponent {
  @Input() override config: BarChart3DConfig = {
    type: '3d-bar',
    bars: {
      width: 0.8,
      depth: 0.8,
      spacing: 0.2,
      gradient: true,
      material: {
        type: 'standard',
        color: '#4CAF50',
        roughness: 0.7,
        metalness: 0.1
      }
    },
    axes: {
      x: { title: 'Categories', grid: true },
      y: { title: 'Values', grid: true },
      z: { title: 'Series', grid: false }
    }
  };

  // Animation state
  private _animationProgress = signal(0);
  private animationTween?: any;

  // Computed properties
  public readonly maxValue = computed(() => {
    let max = 0;
    this.data.forEach(series => {
      series.data.forEach(point => {
        max = Math.max(max, point.value || point.y);
      });
    });
    return max;
  });

  public readonly barDimensions = computed(() => {
    const bars = this.config.bars || {};
    return {
      width: bars.width || 0.8,
      depth: bars.depth || 0.8,
      spacing: bars.spacing || 0.2
    };
  });

  protected override async buildChart(): Promise<void> {
    await super.buildChart();

    if (!this.hasData()) return;

    // Create bar groups for each series
    this.data.forEach((series, seriesIndex) => {
      this.createBarSeries(series, seriesIndex);
    });

    // Create axes
    this.createAxes();

    // Add animations
    if (this.config.animation?.autoStart !== false) {
      this.animateBars();
    }
  }

  /**
   * Create bars for a data series
   */
  private createBarSeries(series: Chart3DData, seriesIndex: number): void {
    const group = new THREE.Group();
    group.name = `series-${seriesIndex}`;
    group.userData = { series: series.name, seriesIndex };

    const dimensions = this.barDimensions();
    const maxVal = this.maxValue();
    
    series.data.forEach((point, pointIndex) => {
      const bar = this.createBar(point, pointIndex, seriesIndex, maxVal, dimensions);
      if (bar) {
        group.add(bar);
      }
    });

    this.addChartObject(group);
  }

  /**
   * Create individual bar geometry and mesh
   */
  private createBar(
    point: Chart3DDataPoint,
    pointIndex: number,
    seriesIndex: number,
    maxValue: number,
    dimensions: { width: number; depth: number; spacing: number }
  ): THREE.Mesh | null {
    const value = point.value || point.y;
    if (value <= 0) return null;

    // Calculate bar height (normalized to 0-10 range)
    const barHeight = (value / maxValue) * 10;
    
    // Position calculation
    const x = point.x * (dimensions.width + dimensions.spacing);
    const z = seriesIndex * (dimensions.depth + dimensions.spacing);
    const y = barHeight / 2; // Center the bar on Y axis

    // Create geometry
    const geometry = new THREE.BoxGeometry(
      dimensions.width,
      barHeight,
      dimensions.depth
    );

    // Create material
    const material = this.createBarMaterial(point, seriesIndex);

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, point.z || z);
    
    // Add shadow casting
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Store data for interactions
    mesh.userData = {
      data: point,
      value,
      seriesIndex,
      pointIndex,
      originalHeight: barHeight,
      originalY: y
    };

    mesh.name = `bar-${seriesIndex}-${pointIndex}`;

    return mesh;
  }

  /**
   * Create material for bar with gradient support
   */
  private createBarMaterial(
    point: Chart3DDataPoint,
    seriesIndex: number
  ): THREE.Material {
    const materialConfig = this.config.bars?.material || {};
    const color = point.color || materialConfig.color || this.getSeriesColor(seriesIndex);

    if (this.config.bars?.gradient) {
      // Create gradient material using vertex colors or texture
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: materialConfig.roughness || 0.7,
        metalness: materialConfig.metalness || 0.1,
        transparent: materialConfig.transparent || false,
        opacity: materialConfig.opacity || 1
      });

      // Add gradient effect by modifying emissive
      material.emissive = new THREE.Color(color).multiplyScalar(0.1);
      return material;
    }

    // Standard material
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: materialConfig.roughness || 0.7,
      metalness: materialConfig.metalness || 0.1,
      transparent: materialConfig.transparent || false,
      opacity: materialConfig.opacity || 1,
      wireframe: materialConfig.wireframe || false
    });
  }

  /**
   * Get color for series by index
   */
  private getSeriesColor(seriesIndex: number): string {
    const colors = [
      '#4CAF50', // Green
      '#2196F3', // Blue
      '#FF9800', // Orange
      '#9C27B0', // Purple
      '#F44336', // Red
      '#00BCD4', // Cyan
      '#FFEB3B', // Yellow
      '#795548'  // Brown
    ];
    return colors[seriesIndex % colors.length];
  }

  /**
   * Create axes with labels and grids
   */
  private createAxes(): void {
    const axesGroup = new THREE.Group();
    axesGroup.name = 'axes';

    // Calculate bounds
    const bounds = this.calculateChartBounds();

    // X-axis
    if (this.config.axes?.x) {
      const xAxis = this.createAxis('x', bounds, this.config.axes.x);
      axesGroup.add(xAxis);
    }

    // Y-axis
    if (this.config.axes?.y) {
      const yAxis = this.createAxis('y', bounds, this.config.axes.y);
      axesGroup.add(yAxis);
    }

    // Z-axis
    if (this.config.axes?.z) {
      const zAxis = this.createAxis('z', bounds, this.config.axes.z);
      axesGroup.add(zAxis);
    }

    this.addChartObject(axesGroup);
  }

  /**
   * Create individual axis
   */
  private createAxis(
    axis: 'x' | 'y' | 'z',
    bounds: { min: THREE.Vector3; max: THREE.Vector3 },
    config: any
  ): THREE.Group {
    const axisGroup = new THREE.Group();
    axisGroup.name = `${axis}-axis`;

    // Create axis line
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];

    if (axis === 'x') {
      linePositions.push(bounds.min.x, 0, 0, bounds.max.x, 0, 0);
    } else if (axis === 'y') {
      linePositions.push(0, bounds.min.y, 0, 0, bounds.max.y, 0);
    } else {
      linePositions.push(0, 0, bounds.min.z, 0, 0, bounds.max.z);
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: config.color || '#666666' });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    axisGroup.add(line);

    // Create grid if enabled
    if (config.grid) {
      const grid = this.createAxisGrid(axis, bounds, config);
      axisGroup.add(grid);
    }

    // Create labels
    if (config.title) {
      const label = this.createAxisLabel(axis, bounds, config);
      axisGroup.add(label);
    }

    return axisGroup;
  }

  /**
   * Create grid for axis
   */
  private createAxisGrid(
    axis: 'x' | 'y' | 'z',
    bounds: { min: THREE.Vector3; max: THREE.Vector3 },
    config: any
  ): THREE.Group {
    const gridGroup = new THREE.Group();
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: '#333333',
      transparent: true,
      opacity: 0.3
    });

    const ticks = config.ticks || 10;
    
    for (let i = 0; i <= ticks; i++) {
      const t = i / ticks;
      const gridGeometry = new THREE.BufferGeometry();
      const gridPositions: number[] = [];

      if (axis === 'y') {
        // Horizontal grid lines
        const y = THREE.MathUtils.lerp(bounds.min.y, bounds.max.y, t);
        gridPositions.push(
          bounds.min.x, y, bounds.min.z,
          bounds.max.x, y, bounds.min.z,
          bounds.max.x, y, bounds.max.z,
          bounds.min.x, y, bounds.max.z,
          bounds.min.x, y, bounds.min.z
        );
      }
      // Add similar logic for x and z axes...

      if (gridPositions.length > 0) {
        gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
        const gridLine = new THREE.Line(gridGeometry, gridMaterial);
        gridGroup.add(gridLine);
      }
    }

    return gridGroup;
  }

  /**
   * Create axis label
   */
  private createAxisLabel(
    axis: 'x' | 'y' | 'z',
    bounds: { min: THREE.Vector3; max: THREE.Vector3 },
    config: any
  ): THREE.Mesh {
    // Create text geometry (would need to import TextGeometry in real implementation)
    // For now, create a simple placeholder
    const geometry = new THREE.PlaneGeometry(2, 0.5);
    const material = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.8
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Position based on axis
    if (axis === 'x') {
      mesh.position.set(bounds.max.x / 2, -1, 0);
    } else if (axis === 'y') {
      mesh.position.set(-2, bounds.max.y / 2, 0);
      mesh.rotation.z = Math.PI / 2;
    } else {
      mesh.position.set(0, -1, bounds.max.z / 2);
      mesh.rotation.x = -Math.PI / 2;
    }

    return mesh;
  }

  /**
   * Calculate chart bounds
   */
  private calculateChartBounds(): { min: THREE.Vector3; max: THREE.Vector3 } {
    let minX = Infinity, maxX = -Infinity;
    let minY = 0, maxY = 0;
    let minZ = Infinity, maxZ = -Infinity;

    const dimensions = this.barDimensions();
    const maxVal = this.maxValue();

    this.data.forEach((series, seriesIndex) => {
      series.data.forEach((point, pointIndex) => {
        const x = point.x * (dimensions.width + dimensions.spacing);
        const z = point.z || seriesIndex * (dimensions.depth + dimensions.spacing);
        const y = ((point.value || point.y) / maxVal) * 10;

        minX = Math.min(minX, x - dimensions.width / 2);
        maxX = Math.max(maxX, x + dimensions.width / 2);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z - dimensions.depth / 2);
        maxZ = Math.max(maxZ, z + dimensions.depth / 2);
      });
    });

    return {
      min: new THREE.Vector3(minX, minY, minZ),
      max: new THREE.Vector3(maxX, maxY, maxZ)
    };
  }

  /**
   * Animate bars with staggered entrance
   */
  private async animateBars(): Promise<void> {
    const duration = this.config.animation?.duration || 2000;
    const bars = this._chartObjects().flatMap(group => 
      group.children.filter(child => child.name.startsWith('bar-'))
    );

    // Store original positions and scales
    bars.forEach((bar: any) => {
      bar.userData.originalScale = bar.scale.y;
      bar.scale.y = 0;
      bar.position.y = 0;
    });

    // Animate each bar with staggered timing
    const promises = bars.map((bar: any, index) => {
      return new Promise<void>((resolve) => {
        const delay = (index / bars.length) * duration * 0.5;
        const animDuration = duration * 0.5;
        
        setTimeout(() => {
          this.animateBar(bar, animDuration).then(resolve);
        }, delay);
      });
    });

    await Promise.all(promises);
  }

  /**
   * Animate individual bar
   */
  private async animateBar(bar: THREE.Mesh, duration: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const targetScale = bar.userData.originalScale;
      const targetY = bar.userData.originalY;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-back)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        bar.scale.y = eased * targetScale;
        bar.position.y = eased * targetY;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Handle bar click for drill-down
   */
  protected override hoverObject(object: THREE.Object3D): void {
    super.hoverObject(object);
    
    // Scale up the hovered bar slightly
    if (object.name.startsWith('bar-')) {
      object.scale.setScalar(1.1);
    }
  }

  protected override unhoverObject(object: THREE.Object3D): void {
    super.unhoverObject(object);
    
    // Reset scale
    if (object.name.startsWith('bar-')) {
      object.scale.setScalar(1);
    }
  }
}
