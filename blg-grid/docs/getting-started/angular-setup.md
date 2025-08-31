# Angular Setup Guide

This guide covers Angular-specific configuration and optimization for BlgGrid, including setup for standalone components, dependency injection, change detection, and Angular-specific features.

## Angular Architecture Integration

BlgGrid is designed to work seamlessly with modern Angular architecture patterns:

### Standalone Components (Recommended)

BlgGrid components are built as standalone components for maximum flexibility:

```typescript
// Modern standalone component setup
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { GridStateService } from '@blg-grid/core';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [Grid], // Direct import, no module needed
  providers: [GridStateService], // Component-level services
  template: `<blg-grid [data]="data" [columns]="columns"></blg-grid>`
})
export class DataGridComponent {}
```

### Traditional NgModule Setup

For applications still using NgModules:

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Grid } from '@blg-grid/grid';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    Grid // Import as standalone component
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Angular Signals Integration

BlgGrid leverages Angular Signals for reactive data binding:

### Basic Signal Setup

```typescript
import { Component, signal, computed } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition } from '@blg-grid/core';

@Component({
  selector: 'app-signal-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="filteredData()" 
      [columns]="columns()"
      [config]="gridConfig()">
    </blg-grid>
  `
})
export class SignalGridComponent {
  // Signal for raw data
  private rawData = signal([
    { id: 1, name: 'John', age: 30, city: 'New York' },
    { id: 2, name: 'Jane', age: 25, city: 'London' },
    { id: 3, name: 'Bob', age: 35, city: 'Paris' }
  ]);

  // Signal for filter criteria
  private filterCriteria = signal({ minAge: 0, city: '' });

  // Computed signal for filtered data
  filteredData = computed(() => {
    const data = this.rawData();
    const filter = this.filterCriteria();
    
    return data.filter(item => 
      item.age >= filter.minAge && 
      (!filter.city || item.city.includes(filter.city))
    );
  });

  // Signal for columns
  columns = signal<ColumnDefinition[]>([
    { id: 'name', field: 'name', header: 'Name', sortable: true },
    { id: 'age', field: 'age', header: 'Age', type: 'number', sortable: true },
    { id: 'city', field: 'city', header: 'City', filterable: true }
  ]);

  // Signal for grid configuration
  gridConfig = signal({
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    selectable: true
  });

  // Methods to update signals
  updateFilter(criteria: { minAge?: number; city?: string }) {
    this.filterCriteria.update(current => ({ ...current, ...criteria }));
  }

  addData(newItem: any) {
    this.rawData.update(current => [...current, newItem]);
  }
}
```

### Advanced Signal Patterns

```typescript
import { Component, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-advanced-signal-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div>
      <input #search (input)="searchTerm.set(search.value)" placeholder="Search...">
      <select #sort (change)="sortField.set(sort.value)">
        <option value="name">Name</option>
        <option value="age">Age</option>
      </select>
      
      <blg-grid 
        [data]="processedData()" 
        [columns]="columns"
        [config]="gridConfig"
        [loading]="loading()">
      </blg-grid>
    </div>
  `
})
export class AdvancedSignalGridComponent {
  private http = inject(HttpClient);

  // Signal for loading state
  loading = signal(false);

  // Signal for search term
  searchTerm = signal('');

  // Signal for sort field
  sortField = signal('name');

  // Convert HTTP call to signal
  private rawData$ = this.http.get<any[]>('/api/users');
  private rawData = toSignal(this.rawData$, { initialValue: [] });

  // Computed signal for processed data
  processedData = computed(() => {
    let data = this.rawData();
    const search = this.searchTerm().toLowerCase();
    const sort = this.sortField();

    // Filter by search term
    if (search) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.city.toLowerCase().includes(search)
      );
    }

    // Sort data
    data = [...data].sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });

    return data;
  });

  // Effect for logging changes
  constructor() {
    effect(() => {
      console.log('Data processed:', this.processedData().length, 'items');
    });
  }
}
```

## Dependency Injection

BlgGrid services can be injected at different levels:

### Component Level Injection

```typescript
import { Component, inject } from '@angular/core';
import { GridStateService, ExportService } from '@blg-grid/core';

@Component({
  selector: 'app-grid-with-services',
  standalone: true,
  imports: [Grid],
  providers: [
    GridStateService, // Component-scoped
    ExportService
  ]
})
export class GridWithServicesComponent {
  private gridState = inject(GridStateService);
  private exportService = inject(ExportService);

  constructor() {
    // Subscribe to grid state changes
    this.gridState.stateChange$.subscribe(state => {
      console.log('Grid state changed:', state);
    });
  }

  exportToExcel() {
    this.exportService.exportToExcel(this.data, 'grid-data.xlsx');
  }
}
```

### Application Level Injection

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { GridStateService } from '@blg-grid/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    GridStateService, // Application-scoped
    // other providers...
  ]
});
```

## Change Detection Optimization

Optimize change detection for better performance:

### OnPush Strategy

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';

@Component({
  selector: 'app-optimized-grid',
  standalone: true,
  imports: [Grid],
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimize change detection
  template: `
    <blg-grid 
      [data]="data" 
      [columns]="columns"
      [trackByFn]="trackByFn">
    </blg-grid>
  `
})
export class OptimizedGridComponent {
  data = [...];
  columns = [...];

  // TrackBy function for better performance
  trackByFn = (index: number, item: any) => item.id || index;
}
```

### Immutable Data Updates

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-immutable-grid',
  standalone: true,
  imports: [Grid]
})
export class ImmutableGridComponent {
  private dataSignal = signal<any[]>([]);
  
  data = this.dataSignal.asReadonly();

  // Always create new arrays for updates
  updateData(newItems: any[]) {
    this.dataSignal.set([...newItems]); // New array reference
  }

  addItem(item: any) {
    this.dataSignal.update(current => [...current, item]); // New array reference
  }

  updateItem(id: number, updates: any) {
    this.dataSignal.update(current =>
      current.map(item =>
        item.id === id ? { ...item, ...updates } : item // New object reference
      )
    );
  }

  removeItem(id: number) {
    this.dataSignal.update(current =>
      current.filter(item => item.id !== id) // New array reference
    );
  }
}
```

## Lazy Loading

Implement lazy loading for large applications:

### Route-Based Lazy Loading

```typescript
// grid.routes.ts
import { Routes } from '@angular/router';

export const GRID_ROUTES: Routes = [
  {
    path: 'basic-grid',
    loadComponent: () =>
      import('./basic-grid/basic-grid.component').then(m => m.BasicGridComponent)
  },
  {
    path: 'advanced-grid',
    loadComponent: () =>
      import('./advanced-grid/advanced-grid.component').then(m => m.AdvancedGridComponent)
  }
];
```

### Feature-Based Lazy Loading

```typescript
// grid-feature.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Grid } from '@blg-grid/grid';

@NgModule({
  imports: [
    Grid,
    RouterModule.forChild([
      { path: '', component: FeatureGridComponent }
    ])
  ],
  declarations: [FeatureGridComponent]
})
export class GridFeatureModule {}
```

## Testing Setup

Configure testing for BlgGrid components:

### Component Testing

```typescript
// grid.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Grid } from '@blg-grid/grid';
import { GridStateService } from '@blg-grid/core';
import { MyGridComponent } from './my-grid.component';

describe('MyGridComponent', () => {
  let component: MyGridComponent;
  let fixture: ComponentFixture<MyGridComponent>;
  let gridStateService: jasmine.SpyObj<GridStateService>;

  beforeEach(async () => {
    const gridStateSpy = jasmine.createSpyObj('GridStateService', ['setState', 'getState']);

    await TestBed.configureTestingModule({
      imports: [MyGridComponent, Grid],
      providers: [
        { provide: GridStateService, useValue: gridStateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyGridComponent);
    component = fixture.componentInstance;
    gridStateService = TestBed.inject(GridStateService) as jasmine.SpyObj<GridStateService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display data', () => {
    component.data = [{ id: 1, name: 'Test' }];
    fixture.detectChanges();
    
    const gridElement = fixture.nativeElement.querySelector('blg-grid');
    expect(gridElement).toBeTruthy();
  });
});
```

### Integration Testing

```typescript
// grid-integration.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Grid } from '@blg-grid/grid';

@Component({
  template: `
    <blg-grid 
      [data]="testData" 
      [columns]="testColumns"
      (rowSelect)="onRowSelect($event)">
    </blg-grid>
  `,
  standalone: true,
  imports: [Grid]
})
class TestHostComponent {
  testData = [{ id: 1, name: 'Test Item' }];
  testColumns = [
    { id: 'name', field: 'name', header: 'Name' }
  ];
  selectedRows: any[] = [];

  onRowSelect(event: any) {
    this.selectedRows.push(event.data.rowData);
  }
}

describe('Grid Integration', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should handle row selection', () => {
    const gridElement = fixture.debugElement.query(By.directive(Grid));
    
    // Simulate row click
    gridElement.triggerEventHandler('rowSelect', {
      data: { rowData: { id: 1, name: 'Test Item' } }
    });

    expect(component.selectedRows).toHaveLength(1);
    expect(component.selectedRows[0]).toEqual({ id: 1, name: 'Test Item' });
  });
});
```

## Performance Monitoring

Monitor grid performance in Angular:

### Performance Profiler Integration

```typescript
import { Component, AfterViewInit } from '@angular/core';
import { Grid } from '@blg-grid/grid';

@Component({
  selector: 'app-monitored-grid',
  standalone: true,
  imports: [Grid],
  template: `<blg-grid [data]="data" [columns]="columns"></blg-grid>`
})
export class MonitoredGridComponent implements AfterViewInit {
  ngAfterViewInit() {
    // Profile grid rendering
    performance.mark('grid-render-start');
    
    setTimeout(() => {
      performance.mark('grid-render-end');
      performance.measure('grid-render', 'grid-render-start', 'grid-render-end');
      
      const measure = performance.getEntriesByName('grid-render')[0];
      console.log(`Grid render time: ${measure.duration}ms`);
    }, 0);
  }
}
```

### Memory Usage Monitoring

```typescript
import { Component, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-memory-monitored-grid',
  standalone: true,
  imports: [Grid]
})
export class MemoryMonitoredGridComponent implements OnDestroy {
  private memorySubscription?: Subscription;

  ngOnInit() {
    // Monitor memory usage every 5 seconds
    this.memorySubscription = interval(5000).subscribe(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
        });
      }
    });
  }

  ngOnDestroy() {
    this.memorySubscription?.unsubscribe();
  }
}
```

## Accessibility Configuration

Configure accessibility features:

### ARIA Support

```typescript
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';

@Component({
  selector: 'app-accessible-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div role="region" aria-label="Data grid">
      <blg-grid 
        [data]="data"
        [columns]="columns"
        [config]="accessibleConfig"
        [ariaLabel]="'Employee data grid with ' + data.length + ' rows'">
      </blg-grid>
    </div>
  `
})
export class AccessibleGridComponent {
  accessibleConfig = {
    // Enable full keyboard navigation
    keyboardNavigation: true,
    
    // Announce changes to screen readers
    announceChanges: true,
    
    // High contrast mode support
    highContrast: false,
    
    // Focus management
    manageFocus: true
  };
}
```

## Error Handling

Implement error boundaries for grids:

```typescript
import { Component, ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GridErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Grid error:', error);
    
    // Report to error tracking service
    if (error.context === 'BlgGrid') {
      this.reportGridError(error);
    }
  }

  private reportGridError(error: any) {
    // Send to monitoring service
    console.log('Reporting grid error:', error);
  }
}

// Register in providers
@Component({
  providers: [
    { provide: ErrorHandler, useClass: GridErrorHandler }
  ]
})
export class GridWithErrorHandlingComponent {}
```

## Next Steps

With your Angular setup complete:

1. **[TypeScript Setup](./typescript-setup.md)** - Optimize TypeScript configuration
2. **[Configuration Guide](./configuration.md)** - Learn all configuration options
3. **[Data Binding](../features/data-binding.md)** - Advanced data binding patterns
4. **[Performance Guide](../guides/performance.md)** - Optimization strategies
5. **[Testing Guide](../guides/testing.md)** - Comprehensive testing approaches

## Angular-Specific Examples

- [Standalone Components](https://stackblitz.com/edit/blg-grid-standalone)
- [Angular Signals](https://stackblitz.com/edit/blg-grid-signals)
- [Dependency Injection](https://stackblitz.com/edit/blg-grid-di)
- [Change Detection](https://stackblitz.com/edit/blg-grid-onpush)
- [Lazy Loading](https://stackblitz.com/edit/blg-grid-lazy)