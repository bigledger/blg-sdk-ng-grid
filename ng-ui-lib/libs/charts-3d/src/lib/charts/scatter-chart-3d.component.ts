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
import { ScatterChart3DConfig, Chart3DData, Chart3DDataPoint } from '../types/chart-3d.types';

/**
 * 3D Scatter Plot Component
 * Creates interactive 3D scatter plots with zoom, rotation, and clustering visualization
 */
@Component({
  selector: 'ng-ui-scatter-chart-3d',
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
export class ScatterChart3DComponent extends BaseChart3DComponent {
  @Input() override config: ScatterChart3DConfig = {
    type: '3d-scatter',
    points: {
      size: 0.2,
      shape: 'sphere',
      sizeByValue: false,
      material: {
        type: 'standard',
        color: '#2196F3',
        roughness: 0.5,
        metalness: 0.2
      }
    },
    axes: {
      x: { title: 'X Axis', grid: true },
      y: { title: 'Y Axis', grid: true },
      z: { title: 'Z Axis', grid: true }
    }
  };

  // Instanced rendering for performance
  private instancedMesh?: THREE.InstancedMesh;
  private instances = signal<THREE.Object3D[]>([]);
  
  // Clustering analysis
  private clusters = signal<Array<{
    center: THREE.Vector3;
    points: Chart3DDataPoint[];
    color: THREE.Color;
    radius: number;
  }>>([]);

  // Computed properties
  public readonly totalPoints = computed(() => {
    return this.data.reduce((total, series) => total + series.data.length, 0);
  });

  public readonly bounds = computed(() => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    this.data.forEach(series => {
      series.data.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
        minZ = Math.min(minZ, point.z);
        maxZ = Math.max(maxZ, point.z);
      });
    });

    return { minX, maxX, minY, maxY, minZ, maxZ };
  });

  public readonly useInstancedRendering = computed(() => {
    return this.totalPoints() > 1000; // Use instancing for large datasets
  });

  protected override async buildChart(): Promise<void> {
    await super.buildChart();

    if (!this.hasData()) return;

    // Choose rendering method based on point count
    if (this.useInstancedRendering()) {
      await this.createInstancedScatterPlot();
    } else {
      await this.createIndividualPoints();
    }

    // Create axes
    this.createAxes();

    // Perform clustering analysis if enabled
    if (this.config.performance?.levelOfDetail) {
      this.performClusterAnalysis();
    }

    // Add animation
    if (this.config.animation?.autoStart !== false) {
      this.animatePoints();
    }
  }

  /**
   * Create scatter plot using instanced rendering for performance
   */
  private async createInstancedScatterPlot(): Promise<void> {
    const totalPoints = this.totalPoints();
    const geometry = this.createPointGeometry();
    const material = this.createPointMaterial();

    // Create instanced mesh
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, totalPoints);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    this.instancedMesh.name = 'scatter-points-instanced';

    // Set up instance matrices and colors
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    let instanceIndex = 0;

    this.data.forEach((series, seriesIndex) => {
      const seriesColor = new THREE.Color(series.color || this.getSeriesColor(seriesIndex));
      
      series.data.forEach((point, pointIndex) => {
        // Set position and scale
        const scale = this.getPointScale(point);
        matrix.makeScale(scale, scale, scale);
        matrix.setPosition(point.x, point.y, point.z);
        this.instancedMesh!.setMatrixAt(instanceIndex, matrix);

        // Set color
        if (point.color) {
          color.set(point.color);
        } else {
          color.copy(seriesColor);
        }
        this.instancedMesh!.setColorAt(instanceIndex, color);

        // Store metadata
        if (!this.instancedMesh!.userData.instances) {
          this.instancedMesh!.userData.instances = [];
        }
        this.instancedMesh!.userData.instances[instanceIndex] = {
          data: point,
          seriesIndex,
          pointIndex
        };

        instanceIndex++;
      });
    });

    // Update instance attributes
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.addChartObject(this.instancedMesh);
  }

  /**
   * Create individual point meshes (for smaller datasets)
   */
  private async createIndividualPoints(): Promise<void> {
    this.data.forEach((series, seriesIndex) => {
      const group = new THREE.Group();
      group.name = `series-${seriesIndex}`;
      group.userData = { series: series.name, seriesIndex };

      series.data.forEach((point, pointIndex) => {
        const pointMesh = this.createPoint(point, seriesIndex, pointIndex);
        if (pointMesh) {
          group.add(pointMesh);
        }
      });

      this.addChartObject(group);
    });
  }

  /**
   * Create individual point mesh
   */
  private createPoint(
    point: Chart3DDataPoint,
    seriesIndex: number,
    pointIndex: number
  ): THREE.Mesh {
    const geometry = this.createPointGeometry();
    const material = this.createPointMaterial(point, seriesIndex);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(point.x, point.y, point.z);
    
    const scale = this.getPointScale(point);
    mesh.scale.setScalar(scale);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `point-${seriesIndex}-${pointIndex}`;
    
    mesh.userData = {
      data: point,
      seriesIndex,
      pointIndex,
      originalScale: scale
    };

    return mesh;
  }

  /**
   * Create geometry for points based on shape
   */
  private createPointGeometry(): THREE.BufferGeometry {
    const shape = this.config.points?.shape || 'sphere';
    const size = this.config.points?.size || 0.2;

    switch (shape) {
      case 'sphere':
        return new THREE.SphereGeometry(size, 16, 12);
      case 'cube':
        return new THREE.BoxGeometry(size * 2, size * 2, size * 2);
      case 'cylinder':
        return new THREE.CylinderGeometry(size, size, size * 2, 12);
      default:
        return new THREE.SphereGeometry(size, 16, 12);
    }
  }

  /**
   * Create material for points
   */
  private createPointMaterial(
    point?: Chart3DDataPoint,
    seriesIndex?: number
  ): THREE.Material {
    const materialConfig = this.config.points?.material || {};
    
    let color: string | number;
    if (point?.color) {
      color = point.color;
    } else if (seriesIndex !== undefined) {
      color = this.getSeriesColor(seriesIndex);
    } else {
      color = materialConfig.color || '#2196F3';
    }

    if (this.useInstancedRendering()) {
      // For instanced rendering, use vertex colors
      return new THREE.MeshStandardMaterial({
        roughness: materialConfig.roughness || 0.5,
        metalness: materialConfig.metalness || 0.2,
        vertexColors: true,
        transparent: materialConfig.transparent || false,
        opacity: materialConfig.opacity || 1
      });
    }

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: materialConfig.roughness || 0.5,
      metalness: materialConfig.metalness || 0.2,
      transparent: materialConfig.transparent || false,
      opacity: materialConfig.opacity || 1,
      wireframe: materialConfig.wireframe || false
    });
  }

  /**
   * Get scale for point based on value
   */
  private getPointScale(point: Chart3DDataPoint): number {
    const baseSize = this.config.points?.size || 0.2;
    
    if (this.config.points?.sizeByValue && point.value !== undefined) {
      // Scale point size based on value
      const minValue = Math.min(...this.data.flatMap(s => s.data.map(p => p.value || 0)));
      const maxValue = Math.max(...this.data.flatMap(s => s.data.map(p => p.value || 0)));
      const normalized = (point.value - minValue) / (maxValue - minValue);
      return baseSize * (0.5 + normalized * 1.5); // Scale between 0.5x and 2x
    }
    
    return 1;
  }

  /**
   * Get color for series by index
   */
  private getSeriesColor(seriesIndex: number): string {
    const colors = [
      '#2196F3', // Blue
      '#4CAF50', // Green
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
   * Create 3D axes with grids
   */
  private createAxes(): void {
    const axesGroup = new THREE.Group();
    axesGroup.name = 'axes';

    const bounds = this.bounds();
    const range = {
      x: bounds.maxX - bounds.minX,
      y: bounds.maxY - bounds.minY,
      z: bounds.maxZ - bounds.minZ
    };

    // Create axis lines and grids
    ['x', 'y', 'z'].forEach(axis => {
      const axisConfig = this.config.axes?.[axis as keyof typeof this.config.axes];
      if (axisConfig) {
        const axisGroup = this.createAxis(axis as 'x' | 'y' | 'z', bounds, range, axisConfig);
        axesGroup.add(axisGroup);
      }
    });

    this.addChartObject(axesGroup);
  }

  /**
   * Create individual axis
   */
  private createAxis(
    axis: 'x' | 'y' | 'z',
    bounds: any,
    range: any,
    config: any
  ): THREE.Group {
    const axisGroup = new THREE.Group();
    axisGroup.name = `${axis}-axis`;

    // Create axis line
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];

    const min = bounds[`min${axis.toUpperCase()}`];
    const max = bounds[`max${axis.toUpperCase()}`];

    if (axis === 'x') {
      linePositions.push(min, 0, 0, max, 0, 0);
    } else if (axis === 'y') {
      linePositions.push(0, min, 0, 0, max, 0);
    } else {
      linePositions.push(0, 0, min, 0, 0, max);
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

    return axisGroup;
  }

  /**
   * Create grid for axis
   */
  private createAxisGrid(
    axis: 'x' | 'y' | 'z',
    bounds: any,
    config: any
  ): THREE.Group {
    const gridGroup = new THREE.Group();
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: '#333333',
      transparent: true,
      opacity: 0.2
    });

    const ticks = config.ticks || 10;
    
    // Create grid lines
    for (let i = 0; i <= ticks; i++) {
      const t = i / ticks;
      const gridGeometry = new THREE.BufferGeometry();
      const gridPositions: number[] = [];

      if (axis === 'x') {
        const x = THREE.MathUtils.lerp(bounds.minX, bounds.maxX, t);
        gridPositions.push(
          x, bounds.minY, bounds.minZ,
          x, bounds.maxY, bounds.minZ,
          x, bounds.maxY, bounds.maxZ,
          x, bounds.minY, bounds.maxZ,
          x, bounds.minY, bounds.minZ
        );
      } else if (axis === 'y') {
        const y = THREE.MathUtils.lerp(bounds.minY, bounds.maxY, t);
        gridPositions.push(
          bounds.minX, y, bounds.minZ,
          bounds.maxX, y, bounds.minZ,
          bounds.maxX, y, bounds.maxZ,
          bounds.minX, y, bounds.maxZ,
          bounds.minX, y, bounds.minZ
        );
      } else {
        const z = THREE.MathUtils.lerp(bounds.minZ, bounds.maxZ, t);
        gridPositions.push(
          bounds.minX, bounds.minY, z,
          bounds.maxX, bounds.minY, z,
          bounds.maxX, bounds.maxY, z,
          bounds.minX, bounds.maxY, z,
          bounds.minX, bounds.minY, z
        );
      }

      if (gridPositions.length > 0) {
        gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
        const gridLine = new THREE.Line(gridGeometry, gridMaterial);
        gridGroup.add(gridLine);
      }
    }

    return gridGroup;
  }

  /**
   * Perform clustering analysis for large datasets
   */
  private performClusterAnalysis(): void {
    // Simple k-means clustering implementation
    const allPoints = this.data.flatMap(series => series.data);
    if (allPoints.length < 10) return;

    const numClusters = Math.min(8, Math.ceil(allPoints.length / 100));
    const clusters = this.kMeansClustering(allPoints, numClusters);
    
    this.clusters.set(clusters);
    this.visualizeClusters(clusters);
  }

  /**
   * K-means clustering algorithm
   */
  private kMeansClustering(
    points: Chart3DDataPoint[],
    k: number
  ): Array<{
    center: THREE.Vector3;
    points: Chart3DDataPoint[];
    color: THREE.Color;
    radius: number;
  }> {
    // Initialize centroids randomly
    const centroids: THREE.Vector3[] = [];
    for (let i = 0; i < k; i++) {
      const randomPoint = points[Math.floor(Math.random() * points.length)];
      centroids.push(new THREE.Vector3(randomPoint.x, randomPoint.y, randomPoint.z));
    }

    // Iterate until convergence
    const maxIterations = 50;
    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to closest centroid
      const clusters: Chart3DDataPoint[][] = Array(k).fill(null).map(() => []);
      
      points.forEach(point => {
        let minDistance = Infinity;
        let closestCluster = 0;
        
        centroids.forEach((centroid, index) => {
          const distance = new THREE.Vector3(point.x, point.y, point.z).distanceTo(centroid);
          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = index;
          }
        });
        
        clusters[closestCluster].push(point);
      });

      // Update centroids
      let converged = true;
      clusters.forEach((cluster, index) => {
        if (cluster.length === 0) return;
        
        const newCentroid = new THREE.Vector3();
        cluster.forEach(point => {
          newCentroid.add(new THREE.Vector3(point.x, point.y, point.z));
        });
        newCentroid.divideScalar(cluster.length);
        
        if (centroids[index].distanceTo(newCentroid) > 0.01) {
          converged = false;
        }
        centroids[index] = newCentroid;
      });
      
      if (converged) break;
    }

    // Create cluster objects
    return centroids.map((centroid, index) => {
      const clusterPoints = points.filter(point => {
        let minDistance = Infinity;
        let closestIndex = 0;
        
        centroids.forEach((c, i) => {
          const distance = new THREE.Vector3(point.x, point.y, point.z).distanceTo(c);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        });
        
        return closestIndex === index;
      });

      // Calculate cluster radius
      const radius = Math.max(...clusterPoints.map(point => 
        new THREE.Vector3(point.x, point.y, point.z).distanceTo(centroid)
      ));

      return {
        center: centroid,
        points: clusterPoints,
        color: new THREE.Color().setHSL((index / centroids.length), 0.7, 0.5),
        radius
      };
    });
  }

  /**
   * Visualize clusters with wireframe spheres
   */
  private visualizeClusters(clusters: any[]): void {
    const clusterGroup = new THREE.Group();
    clusterGroup.name = 'clusters';

    clusters.forEach((cluster, index) => {
      const geometry = new THREE.SphereGeometry(cluster.radius, 16, 12);
      const material = new THREE.MeshBasicMaterial({
        color: cluster.color,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(cluster.center);
      mesh.name = `cluster-${index}`;
      mesh.userData = { cluster };

      clusterGroup.add(mesh);
    });

    this.addChartObject(clusterGroup);
  }

  /**
   * Animate points with staggered entrance
   */
  private async animatePoints(): Promise<void> {
    const duration = this.config.animation?.duration || 2000;
    
    if (this.useInstancedRendering() && this.instancedMesh) {
      // Animate instanced mesh
      this.animateInstancedPoints(duration);
    } else {
      // Animate individual points
      this.animateIndividualPoints(duration);
    }
  }

  /**
   * Animate instanced points
   */
  private animateInstancedPoints(duration: number): void {
    if (!this.instancedMesh) return;

    const startTime = Date.now();
    const totalInstances = this.instancedMesh.count;
    const matrix = new THREE.Matrix4();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      for (let i = 0; i < totalInstances; i++) {
        const instanceProgress = Math.max(0, progress - (i / totalInstances) * 0.5);
        const scale = instanceProgress * instanceProgress; // Ease-in
        
        this.instancedMesh!.getMatrixAt(i, matrix);
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const originalScale = new THREE.Vector3();
        matrix.decompose(position, quaternion, originalScale);
        
        matrix.compose(position, quaternion, originalScale.multiplyScalar(scale));
        this.instancedMesh!.setMatrixAt(i, matrix);
      }

      this.instancedMesh!.instanceMatrix.needsUpdate = true;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Animate individual points
   */
  private animateIndividualPoints(duration: number): void {
    const points = this._chartObjects().flatMap(group => 
      group.children.filter(child => child.name.startsWith('point-'))
    );

    points.forEach((point: any, index) => {
      const delay = (index / points.length) * duration * 0.5;
      const animDuration = duration * 0.5;
      
      // Store original scale
      const originalScale = point.userData.originalScale || 1;
      point.scale.setScalar(0);
      
      setTimeout(() => {
        this.animatePoint(point, originalScale, animDuration);
      }, delay);
    });
  }

  /**
   * Animate individual point
   */
  private animatePoint(point: THREE.Object3D, targetScale: number, duration: number): void {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * progress; // Ease-in
      
      point.scale.setScalar(eased * targetScale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  /**
   * Enhanced hover effect for points
   */
  protected override hoverObject(object: THREE.Object3D): void {
    super.hoverObject(object);
    
    if (object.name.startsWith('point-')) {
      // Scale up and add glow effect
      object.scale.multiplyScalar(1.5);
    }
  }

  protected override unhoverObject(object: THREE.Object3D): void {
    super.unhoverObject(object);
    
    if (object.name.startsWith('point-')) {
      // Reset to original scale
      const originalScale = (object.userData as any).originalScale || 1;
      object.scale.setScalar(originalScale);
    }
  }
}
