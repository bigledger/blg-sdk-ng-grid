import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { WebGLRendererService } from '../services/webgl-renderer.service';
import {
  Chart3DConfig,
  Chart3DData,
  Chart3DEvent,
  Chart3DClickEvent,
  Chart3DHoverEvent,
  Chart3DSelectEvent,
  Chart3DType
} from '../types/chart-3d.types';

/**
 * Base component for all 3D charts
 * Provides common functionality like initialization, event handling, and lifecycle management
 */
@Component({
  selector: 'ng-ui-base-chart-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #chartContainer 
      class="chart-3d-container"
      [style.width.px]="width()"
      [style.height.px]="height()"
      (window:resize)="onResize($event)"
    >
      <div 
        *ngIf="isLoading()" 
        class="chart-3d-loading"
      >
        <div class="loading-spinner"></div>
        <span>Loading 3D Chart...</span>
      </div>
      
      <div 
        *ngIf="error()" 
        class="chart-3d-error"
      >
        <span>{{ error() }}</span>
      </div>
      
      <div 
        *ngIf="showStats()" 
        class="chart-3d-stats"
      >
        <div>FPS: {{ rendererService.performanceStats().fps }}</div>
        <div>Draw Calls: {{ rendererService.performanceStats().drawCalls }}</div>
        <div>Triangles: {{ rendererService.performanceStats().triangles }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./base-chart-3d.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseChart3DComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  // Input properties
  @Input() config: Chart3DConfig = { type: '3d-bar' };
  @Input() data: Chart3DData[] = [];
  @Input() showStats = false;

  // Output events
  @Output() chartClick = new EventEmitter<Chart3DClickEvent>();
  @Output() chartHover = new EventEmitter<Chart3DHoverEvent>();
  @Output() chartSelect = new EventEmitter<Chart3DSelectEvent>();
  @Output() initialized = new EventEmitter<void>();
  @Output() error = new EventEmitter<Error>();

  // Services
  protected rendererService = inject(WebGLRendererService);

  // State management
  protected _isLoading = signal(false);
  protected _error = signal<string | null>(null);
  protected _chartObjects = signal<THREE.Object3D[]>([]);
  protected _selectedObjects = signal<THREE.Object3D[]>([]);

  // Reactive state
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly chartObjects = this._chartObjects.asReadonly();
  public readonly selectedObjects = this._selectedObjects.asReadonly();

  // Computed properties
  public readonly width = computed(() => this.config.width || 800);
  public readonly height = computed(() => this.config.height || 600);
  public readonly hasData = computed(() => this.data.length > 0);

  // Interaction state
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private hoveredObject: THREE.Object3D | null = null;

  constructor() {
    // Effect to rebuild chart when data changes
    effect(() => {
      if (this.hasData() && this.rendererService.isInitialized()) {
        this.buildChart();
      }
    });

    // Effect to handle configuration changes
    effect(() => {
      if (this.rendererService.isInitialized()) {
        this.updateConfiguration();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // Initialize WebGL renderer
      await this.rendererService.initialize(this.chartContainer.nativeElement, this.config);

      // Setup event listeners
      this.setupEventListeners();

      // Build initial chart
      if (this.hasData()) {
        await this.buildChart();
      }

      this._isLoading.set(false);
      this.initialized.emit();
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed to initialize chart');
      this._isLoading.set(false);
      this.error.emit(err as Error);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Build the 3D chart - to be implemented by subclasses
   */
  protected async buildChart(): Promise<void> {
    // Base implementation - clear existing objects
    this.clearChart();
  }

  /**
   * Update chart configuration
   */
  protected updateConfiguration(): void {
    // Update camera position
    if (this.config.camera?.position) {
      this.rendererService.camera.position.set(...this.config.camera.position);
    }

    // Update camera lookAt
    if (this.config.camera?.lookAt) {
      this.rendererService.camera.lookAt(...this.config.camera.lookAt);
    }

    // Update renderer size
    if (this.config.width || this.config.height) {
      this.rendererService.resize(this.width(), this.height());
    }
  }

  /**
   * Clear all chart objects
   */
  protected clearChart(): void {
    this._chartObjects().forEach(obj => {
      this.rendererService.removeObject(obj);
      this.disposeObject(obj);
    });
    this._chartObjects.set([]);
    this._selectedObjects.set([]);
  }

  /**
   * Add object to chart
   */
  protected addChartObject(object: THREE.Object3D): void {
    this.rendererService.addObject(object);
    this._chartObjects.update(objects => [...objects, object]);
  }

  /**
   * Setup event listeners for interactions
   */
  private setupEventListeners(): void {
    const canvas = this.rendererService.renderer.domElement;

    // Mouse events
    canvas.addEventListener('click', this.onMouseClick.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Touch events for mobile
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Keyboard events
    canvas.addEventListener('keydown', this.onKeyDown.bind(this));
    canvas.tabIndex = 0; // Make canvas focusable
  }

  /**
   * Handle mouse click events
   */
  private onMouseClick(event: MouseEvent): void {
    this.updateMousePosition(event);
    const intersected = this.getIntersectedObjects();

    if (intersected.length > 0) {
      const object = intersected[0].object;
      const point = intersected[0].point;
      
      this.chartClick.emit({
        type: 'click',
        target: object,
        point,
        data: object.userData.data,
        originalEvent: event
      });
    }
  }

  /**
   * Handle mouse move events (for hovering)
   */
  private onMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
    const intersected = this.getIntersectedObjects();

    if (intersected.length > 0) {
      const object = intersected[0].object;
      
      if (this.hoveredObject !== object) {
        // Unhover previous object
        if (this.hoveredObject) {
          this.unhoverObject(this.hoveredObject);
        }
        
        // Hover new object
        this.hoveredObject = object;
        this.hoverObject(object);
        
        this.chartHover.emit({
          type: 'hover',
          target: object,
          point: intersected[0].point,
          data: object.userData.data,
          originalEvent: event
        });
      }
    } else {
      // No intersection - unhover if there was a hovered object
      if (this.hoveredObject) {
        this.unhoverObject(this.hoveredObject);
        this.hoveredObject = null;
      }
    }
  }

  /**
   * Handle mouse down events
   */
  private onMouseDown(event: MouseEvent): void {
    // Implementation for selection start
  }

  /**
   * Handle mouse up events
   */
  private onMouseUp(event: MouseEvent): void {
    // Implementation for selection end
  }

  /**
   * Handle touch start events
   */
  private onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      // Convert touch to mouse event
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.onMouseDown(mouseEvent);
    }
  }

  /**
   * Handle touch move events
   */
  private onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 1) {
      // Convert touch to mouse event
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.onMouseMove(mouseEvent);
    }
  }

  /**
   * Handle touch end events
   */
  private onTouchEnd(event: TouchEvent): void {
    // Convert touch to mouse event for click detection
    const mouseEvent = new MouseEvent('click', {
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY
    });
    this.onMouseClick(mouseEvent);
  }

  /**
   * Handle keyboard events
   */
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.clearSelection();
        break;
      case 'Delete':
        this.deleteSelected();
        break;
    }
  }

  /**
   * Update mouse position for raycasting
   */
  private updateMousePosition(event: MouseEvent): void {
    const rect = this.chartContainer.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Get intersected objects using raycasting
   */
  private getIntersectedObjects(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.rendererService.camera);
    return this.raycaster.intersectObjects(this._chartObjects(), true);
  }

  /**
   * Apply hover effect to object
   */
  protected hoverObject(object: THREE.Object3D): void {
    // Default hover effect - can be overridden by subclasses
    const material = (object as any).material;
    if (material) {
      material.emissive = new THREE.Color(0x333333);
    }
  }

  /**
   * Remove hover effect from object
   */
  protected unhoverObject(object: THREE.Object3D): void {
    // Remove hover effect
    const material = (object as any).material;
    if (material) {
      material.emissive = new THREE.Color(0x000000);
    }
  }

  /**
   * Select object
   */
  protected selectObject(object: THREE.Object3D): void {
    this._selectedObjects.update(selected => {
      if (!selected.includes(object)) {
        return [...selected, object];
      }
      return selected;
    });
    
    // Apply selection visual
    const material = (object as any).material;
    if (material) {
      material.emissive = new THREE.Color(0x444444);
    }
  }

  /**
   * Deselect object
   */
  protected deselectObject(object: THREE.Object3D): void {
    this._selectedObjects.update(selected => 
      selected.filter(obj => obj !== object)
    );
    
    // Remove selection visual
    const material = (object as any).material;
    if (material) {
      material.emissive = new THREE.Color(0x000000);
    }
  }

  /**
   * Clear all selections
   */
  protected clearSelection(): void {
    this._selectedObjects().forEach(obj => this.deselectObject(obj));
    this._selectedObjects.set([]);
  }

  /**
   * Delete selected objects
   */
  protected deleteSelected(): void {
    const selected = this._selectedObjects();
    selected.forEach(obj => {
      this.rendererService.removeObject(obj);
      this.disposeObject(obj);
    });
    
    this._chartObjects.update(objects => 
      objects.filter(obj => !selected.includes(obj))
    );
    
    this._selectedObjects.set([]);
  }

  /**
   * Handle window resize
   */
  onResize(event: Event): void {
    const container = this.chartContainer.nativeElement;
    this.rendererService.resize(container.clientWidth, container.clientHeight);
  }

  /**
   * Dispose of Three.js objects properly
   */
  private disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if ((child as any).geometry) {
        (child as any).geometry.dispose();
      }
      
      if ((child as any).material) {
        const material = (child as any).material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose());
        } else {
          material.dispose();
        }
      }
      
      if ((child as any).texture) {
        (child as any).texture.dispose();
      }
    });
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.clearChart();
  }

  /**
   * Export chart as image
   */
  exportAsImage(): string {
    return this.rendererService.takeScreenshot();
  }

  /**
   * Reset camera to default position
   */
  resetCamera(): void {
    const position = this.config.camera?.position || [10, 10, 10];
    const lookAt = this.config.camera?.lookAt || [0, 0, 0];
    
    this.rendererService.camera.position.set(...position);
    this.rendererService.camera.lookAt(...lookAt);
  }
}
