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
import { GlobeChart3DConfig, Chart3DData, Chart3DDataPoint } from '../types/chart-3d.types';

/**
 * 3D Globe Chart Component
 * Creates interactive globe visualizations with geographic data overlays
 */
@Component({
  selector: 'ng-ui-globe-chart-3d',
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
export class GlobeChart3DComponent extends BaseChart3DComponent {
  @Input() override config: GlobeChart3DConfig = {
    type: '3d-globe',
    globe: {
      radius: 5,
      segments: 64,
      atmosphere: true,
      rotation: {
        enabled: true,
        speed: 0.5
      },
      texture: {
        url: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
      }
    },
    data: {
      points: [],
      arcs: []
    }
  };

  // Globe components
  private globe?: THREE.Mesh;
  private atmosphere?: THREE.Mesh;
  private dataPoints = signal<THREE.Object3D[]>([]);
  private arcs = signal<THREE.Object3D[]>([]);
  
  // Animation state
  private rotationSpeed = 0;
  private animationMixer?: THREE.AnimationMixer;

  // Computed properties
  public readonly globeRadius = computed(() => this.config.globe?.radius || 5);
  public readonly hasAtmosphere = computed(() => this.config.globe?.atmosphere !== false);
  public readonly hasRotation = computed(() => this.config.globe?.rotation?.enabled !== false);
  public readonly rotationEnabled = computed(() => this.config.globe?.rotation?.enabled !== false);

  protected override async buildChart(): Promise<void> {
    await super.buildChart();

    // Create globe
    await this.createGlobe();

    // Create atmosphere if enabled
    if (this.hasAtmosphere()) {
      this.createAtmosphere();
    }

    // Add data points
    if (this.config.data?.points?.length) {
      this.createDataPoints();
    }

    // Add arcs
    if (this.config.data?.arcs?.length) {
      this.createArcs();
    }

    // Add regular data series as points on globe
    if (this.hasData()) {
      this.createSeriesPoints();
    }

    // Setup rotation animation
    if (this.hasRotation()) {
      this.setupRotation();
    }

    // Add stars background
    this.createStarField();
  }

  /**
   * Create the main globe mesh
   */
  private async createGlobe(): Promise<void> {
    const radius = this.globeRadius();
    const segments = this.config.globe?.segments || 64;
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(radius, segments, segments / 2);
    
    // Create material with Earth texture
    const material = await this.createGlobeMaterial();
    
    // Create mesh
    this.globe = new THREE.Mesh(geometry, material);
    this.globe.name = 'globe';
    this.globe.receiveShadow = true;
    
    // Rotate to show correct orientation
    this.globe.rotation.x = -Math.PI / 2;
    
    this.addChartObject(this.globe);
  }

  /**
   * Create globe material with texture
   */
  private async createGlobeMaterial(): Promise<THREE.Material> {
    const textureConfig = this.config.globe?.texture;
    
    if (textureConfig?.url) {
      try {
        const texture = await this.loadTexture(textureConfig.url);
        return new THREE.MeshPhongMaterial({
          map: texture,
          transparent: false
        });
      } catch (error) {
        console.warn('Failed to load globe texture, using fallback:', error);
      }
    }
    
    // Fallback material
    return new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      transparent: false
    });
  }

  /**
   * Load texture with promise
   */
  private loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Create atmospheric effect
   */
  private createAtmosphere(): void {
    const radius = this.globeRadius() * 1.05;
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide // Render inside faces
    });
    
    this.atmosphere = new THREE.Mesh(geometry, material);
    this.atmosphere.name = 'atmosphere';
    this.atmosphere.rotation.x = -Math.PI / 2;
    
    this.addChartObject(this.atmosphere);
  }

  /**
   * Create data points on globe surface
   */
  private createDataPoints(): void {
    const points = this.config.data?.points || [];
    const pointsGroup = new THREE.Group();
    pointsGroup.name = 'data-points';
    
    points.forEach((point, index) => {
      const pointMesh = this.createDataPoint(point, index);
      if (pointMesh) {
        pointsGroup.add(pointMesh);
      }
    });
    
    this.addChartObject(pointsGroup);
  }

  /**
   * Create individual data point on globe
   */
  private createDataPoint(point: Chart3DDataPoint, index: number): THREE.Object3D {
    // Convert lat/lon to 3D coordinates
    const position = this.latLonToVector3(
      point.metadata?.lat || point.y, 
      point.metadata?.lon || point.x
    );
    
    // Create point geometry
    const height = (point.value || 1) * 0.5; // Scale height based on value
    const geometry = new THREE.CylinderGeometry(0.02, 0.05, height, 8);
    
    // Create material with color based on value
    const color = this.getValueColor(point.value || 0);
    const material = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: 0.8
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.lookAt(new THREE.Vector3(0, 0, 0)); // Point toward center
    mesh.rotateX(Math.PI / 2); // Adjust orientation
    
    // Move outward from surface
    const direction = position.clone().normalize();
    mesh.position.add(direction.multiplyScalar(height / 2));
    
    mesh.name = `data-point-${index}`;
    mesh.userData = { data: point, index };
    
    return mesh;
  }

  /**
   * Create series points as markers on globe
   */
  private createSeriesPoints(): void {
    this.data.forEach((series, seriesIndex) => {
      const group = new THREE.Group();
      group.name = `series-${seriesIndex}`;
      
      series.data.forEach((point, pointIndex) => {
        const marker = this.createSeriesPoint(point, seriesIndex, pointIndex);
        if (marker) {
          group.add(marker);
        }
      });
      
      this.addChartObject(group);
    });
  }

  /**
   * Create series point marker
   */
  private createSeriesPoint(
    point: Chart3DDataPoint,
    seriesIndex: number,
    pointIndex: number
  ): THREE.Object3D {
    // Use x, y as lat/lon or direct 3D coordinates
    let position: THREE.Vector3;
    if (point.metadata?.lat !== undefined && point.metadata?.lon !== undefined) {
      position = this.latLonToVector3(point.metadata.lat, point.metadata.lon);
    } else {
      position = this.latLonToVector3(point.y, point.x);
    }
    
    // Create marker geometry
    const geometry = new THREE.SphereGeometry(0.05, 8, 6);
    const color = point.color || this.getSeriesColor(seriesIndex);
    
    const material = new THREE.MeshLambertMaterial({
      color,
      emissive: new THREE.Color(color).multiplyScalar(0.2)
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position on globe surface
    const surfacePosition = position.clone().normalize().multiplyScalar(this.globeRadius() + 0.05);
    mesh.position.copy(surfacePosition);
    
    mesh.name = `series-point-${seriesIndex}-${pointIndex}`;
    mesh.userData = { data: point, seriesIndex, pointIndex };
    
    return mesh;
  }

  /**
   * Create arcs between points
   */
  private createArcs(): void {
    const arcs = this.config.data?.arcs || [];
    const arcsGroup = new THREE.Group();
    arcsGroup.name = 'arcs';
    
    arcs.forEach((arc, index) => {
      const arcMesh = this.createArc(arc, index);
      if (arcMesh) {
        arcsGroup.add(arcMesh);
      }
    });
    
    this.addChartObject(arcsGroup);
  }

  /**
   * Create individual arc between two points
   */
  private createArc(arc: {
    from: [number, number];
    to: [number, number];
    value: number;
    color?: string;
  }, index: number): THREE.Object3D {
    const fromPos = this.latLonToVector3(arc.from[0], arc.from[1]);
    const toPos = this.latLonToVector3(arc.to[0], arc.to[1]);
    
    // Create curved path
    const curve = this.createArcCurve(fromPos, toPos);
    const points = curve.getPoints(50);
    
    // Create tube geometry
    const geometry = new THREE.TubeGeometry(curve, 50, 0.01, 8, false);
    const color = arc.color || this.getValueColor(arc.value);
    
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `arc-${index}`;
    mesh.userData = { arc, index };
    
    return mesh;
  }

  /**
   * Create curved arc path
   */
  private createArcCurve(start: THREE.Vector3, end: THREE.Vector3): THREE.CatmullRomCurve3 {
    const radius = this.globeRadius();
    
    // Calculate arc height based on distance
    const distance = start.distanceTo(end);
    const arcHeight = distance * 0.3 + radius * 0.2;
    
    // Calculate midpoint
    const midpoint = start.clone().add(end).divideScalar(2);
    midpoint.normalize().multiplyScalar(radius + arcHeight);
    
    // Create curve with start, midpoint, end
    return new THREE.CatmullRomCurve3([
      start.clone().normalize().multiplyScalar(radius + 0.1),
      midpoint,
      end.clone().normalize().multiplyScalar(radius + 0.1)
    ]);
  }

  /**
   * Convert latitude/longitude to 3D vector
   */
  private latLonToVector3(lat: number, lon: number): THREE.Vector3 {
    const radius = this.globeRadius();
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  /**
   * Get color based on value
   */
  private getValueColor(value: number): THREE.Color {
    // Create heat map colors
    const colors = [
      new THREE.Color(0x0000ff), // Blue (low)
      new THREE.Color(0x00ffff), // Cyan
      new THREE.Color(0x00ff00), // Green
      new THREE.Color(0xffff00), // Yellow
      new THREE.Color(0xff0000)  // Red (high)
    ];
    
    // Normalize value between 0 and 1
    const normalizedValue = Math.max(0, Math.min(1, value / 100));
    const colorIndex = normalizedValue * (colors.length - 1);
    const lowerIndex = Math.floor(colorIndex);
    const upperIndex = Math.ceil(colorIndex);
    const factor = colorIndex - lowerIndex;
    
    if (lowerIndex === upperIndex) {
      return colors[lowerIndex];
    }
    
    return colors[lowerIndex].clone().lerp(colors[upperIndex], factor);
  }

  /**
   * Get series color
   */
  private getSeriesColor(seriesIndex: number): string {
    const colors = [
      '#ff6b6b', // Red
      '#4ecdc4', // Teal
      '#45b7d1', // Blue
      '#f7dc6f', // Yellow
      '#bb8fce', // Purple
      '#82e0aa', // Green
      '#f8c471', // Orange
      '#85c1e9'  // Light Blue
    ];
    return colors[seriesIndex % colors.length];
  }

  /**
   * Setup rotation animation
   */
  private setupRotation(): void {
    const speed = this.config.globe?.rotation?.speed || 0.5;
    this.rotationSpeed = speed * 0.01; // Convert to radians per frame
  }

  /**
   * Create star field background
   */
  private createStarField(): void {
    const starsGroup = new THREE.Group();
    starsGroup.name = 'stars';
    
    // Create star geometry
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = (Math.random() - 0.5) * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.name = 'star-field';
    starsGroup.add(stars);
    
    this.addChartObject(starsGroup);
  }

  /**
   * Update rotation animation
   */
  private updateRotation(): void {
    if (this.globe && this.rotationEnabled()) {
      this.globe.rotation.y += this.rotationSpeed;
    }
  }

  /**
   * Override render loop to include rotation
   */
  protected override buildChart(): Promise<void> {
    const originalBuildChart = super.buildChart.bind(this);
    
    // Add rotation update to render loop
    const originalRender = this.rendererService.renderer.render.bind(this.rendererService.renderer);
    this.rendererService.renderer.render = (scene: THREE.Scene, camera: THREE.Camera) => {
      this.updateRotation();
      originalRender(scene, camera);
    };
    
    return originalBuildChart();
  }

  /**
   * Enhanced hover effects for globe elements
   */
  protected override hoverObject(object: THREE.Object3D): void {
    super.hoverObject(object);
    
    if (object.name.includes('point')) {
      // Pulse effect for points
      object.scale.setScalar(1.5);
      
      const material = (object as THREE.Mesh).material as THREE.Material;
      if ('emissive' in material) {
        (material as any).emissive.setHex(0x444444);
      }
    } else if (object.name.includes('arc')) {
      // Brighten arcs
      const material = (object as THREE.Mesh).material as THREE.Material;
      if ('opacity' in material) {
        (material as any).opacity = 1.0;
      }
    }
  }

  protected override unhoverObject(object: THREE.Object3D): void {
    super.unhoverObject(object);
    
    if (object.name.includes('point')) {
      object.scale.setScalar(1);
      
      const material = (object as THREE.Mesh).material as THREE.Material;
      if ('emissive' in material) {
        (material as any).emissive.setHex(0x000000);
      }
    } else if (object.name.includes('arc')) {
      const material = (object as THREE.Mesh).material as THREE.Material;
      if ('opacity' in material) {
        (material as any).opacity = 0.6;
      }
    }
  }

  /**
   * Public methods for interaction
   */
  public focusOnRegion(lat: number, lon: number, distance = 8): void {
    const position = this.latLonToVector3(lat, lon);
    const direction = position.normalize();
    const cameraPosition = direction.multiplyScalar(distance);
    
    // Animate camera to position
    this.animateCamera(cameraPosition, new THREE.Vector3(0, 0, 0));
  }

  public toggleRotation(): void {
    if (this.config.globe?.rotation) {
      this.config.globe.rotation.enabled = !this.config.globe.rotation.enabled;
    }
  }

  public setRotationSpeed(speed: number): void {
    if (this.config.globe?.rotation) {
      this.config.globe.rotation.speed = speed;
      this.rotationSpeed = speed * 0.01;
    }
  }

  /**
   * Animate camera to position
   */
  private animateCamera(targetPosition: THREE.Vector3, targetLookAt: THREE.Vector3, duration = 2000): void {
    const startPosition = this.rendererService.camera.position.clone();
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease-out
      
      this.rendererService.camera.position.lerpVectors(startPosition, targetPosition, eased);
      this.rendererService.camera.lookAt(targetLookAt);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
}
