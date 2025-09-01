# Debugging Guide

**Audience: Library Developers and Contributors**

This guide provides comprehensive debugging strategies, tools, and techniques for troubleshooting issues in the BLG Grid library. Whether you're investigating bugs, performance issues, or unexpected behavior, this guide will help you debug effectively.

## Table of Contents

- [Debugging Philosophy](#debugging-philosophy)
- [Development Tools Setup](#development-tools-setup)
- [Common Debugging Scenarios](#common-debugging-scenarios)
- [Angular-Specific Debugging](#angular-specific-debugging)
- [Performance Debugging](#performance-debugging)
- [Testing and Test Debugging](#testing-and-test-debugging)
- [Production Debugging](#production-debugging)
- [Debugging Tools and Extensions](#debugging-tools-and-extensions)
- [Logging and Instrumentation](#logging-and-instrumentation)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Debugging Philosophy

### Systematic Approach

1. **Reproduce the Issue**: Create minimal, reliable reproduction steps
2. **Isolate the Problem**: Narrow down to specific component or service  
3. **Form Hypotheses**: Create testable theories about the cause
4. **Test Systematically**: Validate or invalidate hypotheses methodically
5. **Fix Root Cause**: Address the underlying issue, not just symptoms
6. **Verify the Fix**: Ensure the solution works and doesn't break other functionality

### Debugging Mindset

- **Stay Curious**: Ask "why" and "how" questions
- **Be Patient**: Complex issues take time to understand
- **Document Findings**: Keep track of what you've tried
- **Use Scientific Method**: Form hypotheses and test them
- **Collaborate**: Don't hesitate to ask for help or fresh perspectives

## Development Tools Setup

### VS Code Configuration

```json
// .vscode/launch.json - Debug configurations
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Angular App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@angular/cli/bin/ng",
      "args": ["serve", "--source-map=true"],
      "console": "integratedTerminal",
      "env": {
        "NG_DEBUG": "true"
      }
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "env": {
        "CI": "true"
      }
    },
    {
      "name": "Debug Specific Test File",
      "type": "node", 
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${fileBasenameNoExtension}", "--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Browser DevTools Setup

```typescript
// Enable Angular debug mode in development
// main.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
} else {
  // Enable Angular DevTools and detailed error messages
  import('@angular/core').then(core => {
    core.ɵsetClassMetadata = core.ɵsetClassMetadata || (() => {});
  });
}
```

### Angular DevTools

Install and configure Angular DevTools browser extension:

1. **Chrome/Edge**: Install from Web Store
2. **Firefox**: Install from Add-ons
3. **Enable**: Open DevTools → Angular tab

## Common Debugging Scenarios

### 1. Component Not Rendering

#### Debugging Steps

```typescript
// 1. Check if component is being instantiated
@Component({
  selector: 'ng-ui-lib',
  template: `
    <div class="debug-info">
      Debug: Component loaded at {{ debugTimestamp }}
    </div>
    <!-- Your actual template -->
  `
})
export class BlgGridComponent {
  debugTimestamp = new Date().toISOString();
  
  constructor() {
    console.log('🔍 BlgGridComponent constructor called', {
      timestamp: this.debugTimestamp,
      config: this.config?.()
    });
  }
  
  ngOnInit() {
    console.log('🔍 BlgGridComponent ngOnInit', {
      hasData: !!this.data?.(),
      columnCount: this.columns?.()?.length
    });
  }
}
```

#### Common Causes and Solutions

```typescript
// ✅ Check: Is component properly imported and declared?
@NgModule({
  imports: [BlgGridModule], // Make sure module is imported
  declarations: [YourComponent]
})

// ✅ Check: Are inputs properly bound?
<ng-ui-lib 
  [config]="gridConfig"    <!-- Binding syntax correct? -->
  [data]="gridData">       <!-- Data exists? -->
</ng-ui-lib>

// ✅ Check: Are there any errors in the console?
// Open browser console and look for errors

// ✅ Check: Is the component selector correct?
// Verify selector matches what you're using in template
```

### 2. Data Not Displaying

#### Debugging Data Flow

```typescript
@Component({
  template: `
    <!-- Add debug information to template -->
    <div class="debug-panel" *ngIf="debugMode">
      <h4>Debug Info</h4>
      <p>Original Data Length: {{ originalData?.()?.length || 0 }}</p>
      <p>Processed Data Length: {{ processedData?.()?.length || 0 }}</p>
      <p>Display Data Length: {{ displayData?.()?.length || 0 }}</p>
      <p>Has Filters: {{ hasActiveFilters() }}</p>
      <p>Has Sort: {{ hasActiveSort() }}</p>
      <details>
        <summary>Raw Data Sample</summary>
        <pre>{{ dataDebugInfo() | json }}</pre>
      </details>
    </div>
    
    <ng-ui-lib-body 
      [data]="displayData()"
      [columns]="columns()">
    </ng-ui-lib-body>
  `
})
export class BlgGridComponent {
  debugMode = !environment.production;
  
  // Debug computed values
  dataDebugInfo = computed(() => ({
    originalCount: this.originalData?.()?.length,
    processedCount: this.processedData?.()?.length,
    firstItem: this.originalData?.()?.[0],
    filters: this.gridState.filterState(),
    sort: this.gridState.sortState()
  }));
  
  hasActiveFilters = computed(() => 
    Object.keys(this.gridState.filterState()).length > 0
  );
  
  hasActiveSort = computed(() => 
    this.gridState.sortState() !== null
  );
}
```

#### Step-by-Step Data Flow Debug

```typescript
// 1. Check data source
console.log('🔍 Data Source Debug:', {
  dataSource: this.dataSource,
  hasConnect: typeof this.dataSource?.connect === 'function',
  isConnected: this.dataSource?.isConnected
});

// 2. Check data processing pipeline
effect(() => {
  const originalData = this.originalData();
  const processedData = this.processedData();
  
  console.log('🔍 Data Processing Debug:', {
    originalLength: originalData?.length,
    processedLength: processedData?.length,
    filters: this.gridState.filterState(),
    sorts: this.gridState.sortState(),
    sampleOriginal: originalData?.[0],
    sampleProcessed: processedData?.[0]
  });
});

// 3. Check virtual scrolling
@Component({
  template: `
    <cdk-virtual-scroll-viewport 
      #viewport
      (scrolledIndexChange)="onScrollIndexChange($event)">
      
      <div *cdkVirtualFor="let item of data(); trackBy: trackByFn; let i = index">
        Row {{ i }}: {{ item | json }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualScrollDebugComponent {
  onScrollIndexChange(index: number) {
    console.log('🔍 Virtual Scroll Index:', index);
  }
  
  trackByFn = (index: number, item: any) => {
    console.log('🔍 TrackBy called:', { index, itemId: item?.id });
    return item?.id ?? index;
  };
}
```

### 3. Performance Issues

#### Performance Profiling

```typescript
// Performance monitoring service
@Injectable()
export class PerformanceDebugService {
  private measurements = new Map<string, number>();
  
  startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
    console.log(`⏱️ Starting measurement: ${name}`);
  }
  
  endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`⚠️ No start time found for measurement: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    
    console.log(`⏱️ ${name} took ${duration.toFixed(2)}ms`);
    
    if (duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${name} (${duration.toFixed(2)}ms)`);
    }
    
    return duration;
  }
  
  measureFunction<T>(name: string, fn: () => T): T {
    this.startMeasurement(name);
    const result = fn();
    this.endMeasurement(name);
    return result;
  }
  
  measureAsync<T>(name: string, promise: Promise<T>): Promise<T> {
    this.startMeasurement(name);
    return promise.finally(() => this.endMeasurement(name));
  }
}
```

#### Using Performance Service

```typescript
@Component({})
export class BlgGridComponent {
  constructor(private perfDebug: PerformanceDebugService) {}
  
  processData(data: any[]): any[] {
    return this.perfDebug.measureFunction('processData', () => {
      // Expensive data processing
      return this.dataService.processData(data);
    });
  }
  
  async loadData(): Promise<void> {
    await this.perfDebug.measureAsync('loadData', 
      this.dataService.loadData()
    );
  }
}
```

## Angular-Specific Debugging

### Signal Debugging

```typescript
// Debug signal changes
@Component({})
export class SignalDebugComponent {
  data = signal<any[]>([]);
  processedData = computed(() => {
    const result = this.processData(this.data());
    console.log('🔍 Computed processedData updated:', {
      inputLength: this.data().length,
      outputLength: result.length,
      timestamp: new Date().toISOString()
    });
    return result;
  });
  
  constructor() {
    // Debug all signal changes
    effect(() => {
      console.log('🔍 Effect triggered - data changed:', {
        dataLength: this.data().length,
        firstItem: this.data()[0]
      });
    });
  }
  
  updateData(newData: any[]) {
    console.log('🔍 Updating data signal:', {
      oldLength: this.data().length,
      newLength: newData.length
    });
    this.data.set(newData);
  }
}
```

### Change Detection Debugging

```typescript
import { ApplicationRef, NgZone } from '@angular/core';

@Component({})
export class ChangeDetectionDebugComponent {
  constructor(
    private appRef: ApplicationRef,
    private ngZone: NgZone
  ) {
    // Debug change detection cycles
    this.appRef.isStable.subscribe(stable => {
      console.log('🔍 Application stable:', stable);
    });
    
    // Debug zone events
    this.ngZone.onStable.subscribe(() => {
      console.log('🔍 NgZone stable');
    });
    
    this.ngZone.onUnstable.subscribe(() => {
      console.log('🔍 NgZone unstable');
    });
  }
}

// Enable change detection profiling in development
// main.ts
if (!environment.production) {
  enableDebugTools(platformRef.injector.get(ApplicationRef).components[0]);
}

// In browser console:
// ng.profiler.timeChangeDetection() - Profile change detection
```

### Dependency Injection Debugging

```typescript
@Component({})
export class DIDebugComponent {
  constructor(private injector: Injector) {
    // Debug injector hierarchy
    console.log('🔍 Available providers:', {
      gridState: !!injector.get(GridStateService, null),
      dataService: !!injector.get(DataService, null),
      config: !!injector.get(GRID_CONFIG, null)
    });
    
    // Check injection token resolution
    try {
      const config = injector.get(GRID_CONFIG);
      console.log('🔍 Grid config resolved:', config);
    } catch (error) {
      console.error('❌ Grid config not found:', error);
    }
  }
}
```

## Performance Debugging

### Memory Leak Detection

```typescript
@Component({})
export class MemoryLeakDebugComponent implements OnDestroy {
  private subscriptions = new Set<Subscription>();
  private intervals = new Set<number>();
  private timeouts = new Set<number>();
  
  ngOnInit() {
    // Track subscriptions for cleanup
    const sub = this.dataService.data$.subscribe(data => {
      // Handle data
    });
    this.subscriptions.add(sub);
    
    // Track intervals
    const interval = window.setInterval(() => {
      // Periodic task
    }, 1000);
    this.intervals.add(interval);
  }
  
  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    
    // Clean up intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
    
    // Clean up timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
    
    console.log('🔍 Component destroyed, cleaned up:', {
      subscriptions: this.subscriptions.size,
      intervals: this.intervals.size,
      timeouts: this.timeouts.size
    });
  }
}
```

### Virtual Scrolling Performance

```typescript
@Component({
  template: `
    <cdk-virtual-scroll-viewport 
      #viewport
      (scrolledIndexChange)="onScrollDebug($event)"
      class="viewport">
      
      <div *cdkVirtualFor="let item of data(); trackBy: debugTrackBy; let i = index"
           class="row-item">
        <span class="debug-info">Row {{ i }}</span>
        <!-- Your row content -->
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualScrollDebugComponent {
  private lastScrollIndex = 0;
  private renderCount = 0;
  
  debugTrackBy = (index: number, item: any): any => {
    // Count renders for performance analysis
    this.renderCount++;
    if (this.renderCount % 100 === 0) {
      console.log('🔍 Render count:', this.renderCount);
    }
    
    return item?.id ?? index;
  };
  
  onScrollDebug(index: number): void {
    const direction = index > this.lastScrollIndex ? 'down' : 'up';
    console.log('🔍 Virtual scroll:', {
      index,
      direction,
      delta: Math.abs(index - this.lastScrollIndex)
    });
    this.lastScrollIndex = index;
  }
}
```

## Testing and Test Debugging

### Jest Test Debugging

```typescript
// Debug test setup
describe('GridStateService', () => {
  let service: GridStateService;
  
  beforeEach(() => {
    console.log('🧪 Setting up test environment');
    
    TestBed.configureTestingModule({
      providers: [
        GridStateService,
        { provide: DataService, useClass: MockDataService }
      ]
    });
    
    service = TestBed.inject(GridStateService);
    console.log('🧪 Service created:', !!service);
  });
  
  it('should update sort state', () => {
    // Debug test execution
    console.log('🧪 Starting test: should update sort state');
    
    const initialState = service.state();
    console.log('🧪 Initial state:', initialState);
    
    const sortDescriptors = [
      { columnId: 'name', direction: 'asc' as const, priority: 0 }
    ];
    
    service.updateSort(sortDescriptors);
    
    const updatedState = service.state();
    console.log('🧪 Updated state:', updatedState);
    
    expect(updatedState.sortDescriptors).toEqual(sortDescriptors);
  });
});
```

### E2E Test Debugging

```typescript
// e2e debugging with Playwright
import { test, expect } from '@playwright/test';

test('grid sorting functionality', async ({ page }) => {
  // Enable console logging in tests
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Error:', msg.text());
    } else if (msg.text().includes('🔍')) {
      console.log('🔍 Browser Debug:', msg.text());
    }
  });
  
  await page.goto('/grid-demo');
  
  // Add debug information
  await page.evaluate(() => {
    console.log('🔍 E2E: Page loaded, checking grid');
    const grid = document.querySelector('ng-ui-lib');
    console.log('🔍 E2E: Grid found:', !!grid);
  });
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'debug-before-sort.png' });
  
  await page.click('[data-column="name"]');
  
  // Wait and take another screenshot
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'debug-after-sort.png' });
  
  const sortIndicator = await page.locator('[data-column="name"] .sort-indicator');
  await expect(sortIndicator).toBeVisible();
});
```

## Production Debugging

### Error Reporting

```typescript
// Global error handler for production debugging
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('🚨 Global error:', error);
    
    // Send to error reporting service
    this.reportError(error);
    
    // Log additional context
    this.logErrorContext(error);
  }
  
  private reportError(error: any): void {
    // Send to error reporting service (e.g., Sentry, LogRocket)
    if (environment.production) {
      // errorReportingService.captureException(error);
    }
  }
  
  private logErrorContext(error: any): void {
    console.group('🔍 Error Context');
    console.log('URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Error:', error);
    
    if (error.stack) {
      console.log('Stack:', error.stack);
    }
    
    console.groupEnd();
  }
}

// Register global error handler
// app.module.ts or main.ts
providers: [
  { provide: ErrorHandler, useClass: GlobalErrorHandler }
]
```

### Runtime Diagnostics

```typescript
@Injectable()
export class DiagnosticsService {
  private diagnosticsEnabled = !environment.production;
  
  logGridState(component: string, state: any): void {
    if (!this.diagnosticsEnabled) return;
    
    console.group(`🔍 ${component} State`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('State:', state);
    console.log('Memory:', this.getMemoryInfo());
    console.groupEnd();
  }
  
  logPerformanceMetrics(operation: string, metrics: any): void {
    if (!this.diagnosticsEnabled) return;
    
    console.log(`⏱️ Performance - ${operation}:`, {
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }
  
  private getMemoryInfo(): any {
    if ('memory' in performance) {
      return {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024) + ' MB'
      };
    }
    return null;
  }
}
```

## Debugging Tools and Extensions

### Browser Extensions

1. **Angular DevTools**
   - Component tree inspection
   - Change detection profiler
   - Dependency injection explorer

2. **Redux DevTools** (if using NgRx)
   - Action debugging
   - State time travel
   - State diff visualization

3. **React/Vue DevTools** (for comparison)
   - Component hierarchy
   - Props/state inspection

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.js-debug",
    "firefox-devtools.vscode-firefox-debug"
  ]
}
```

### Chrome DevTools Tips

```javascript
// Useful debugging commands in Chrome Console

// 1. Inspect Angular component
ng.getComponent(document.querySelector('ng-ui-lib'))

// 2. Get injector from element
ng.getInjector(document.querySelector('ng-ui-lib'))

// 3. Profile change detection
ng.profiler.timeChangeDetection()

// 4. Get directive instance
ng.getDirectives(document.querySelector('[blgTooltip]'))

// 5. Monitor function calls
monitor(BlgGridComponent.prototype.updateSort)
unmonitor(BlgGridComponent.prototype.updateSort)

// 6. Set breakpoints programmatically
debugger; // Will pause execution

// 7. Log all events on element
monitorEvents(document.querySelector('ng-ui-lib'))
```

## Logging and Instrumentation

### Structured Logging

```typescript
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

@Injectable({ providedIn: 'root' })
export class Logger {
  private currentLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  
  error(message: string, data?: any): void {
    if (this.currentLevel >= LogLevel.ERROR) {
      console.error(`❌ [ERROR] ${message}`, data);
    }
  }
  
  warn(message: string, data?: any): void {
    if (this.currentLevel >= LogLevel.WARN) {
      console.warn(`⚠️ [WARN] ${message}`, data);
    }
  }
  
  info(message: string, data?: any): void {
    if (this.currentLevel >= LogLevel.INFO) {
      console.info(`ℹ️ [INFO] ${message}`, data);
    }
  }
  
  debug(message: string, data?: any): void {
    if (this.currentLevel >= LogLevel.DEBUG) {
      console.log(`🔍 [DEBUG] ${message}`, data);
    }
  }
  
  group(label: string, level: LogLevel = LogLevel.DEBUG): void {
    if (this.currentLevel >= level) {
      console.group(`🔍 ${label}`);
    }
  }
  
  groupEnd(): void {
    if (this.currentLevel >= LogLevel.DEBUG) {
      console.groupEnd();
    }
  }
}
```

## Troubleshooting Common Issues

### Issue: Grid Not Loading Data

**Symptoms:**
- Grid renders but shows no data
- Loading indicator never disappears
- No errors in console

**Debug Steps:**
```typescript
// 1. Check data source connection
console.log('Data source:', this.dataSource);
console.log('Is connected:', this.dataSource?.isConnected);

// 2. Check data flow
effect(() => {
  console.log('Data updated:', {
    length: this.data()?.length,
    sample: this.data()?.[0]
  });
});

// 3. Check async issues
this.dataSource.connect().subscribe({
  next: data => console.log('Data received:', data),
  error: err => console.error('Data error:', err),
  complete: () => console.log('Data stream complete')
});
```

### Issue: Performance Problems

**Symptoms:**
- Slow rendering
- UI freezing during operations
- High memory usage

**Debug Steps:**
```typescript
// 1. Profile rendering performance
const startTime = performance.now();
// ... operation ...
console.log('Operation took:', performance.now() - startTime, 'ms');

// 2. Check for unnecessary rerenders
trackByFn = (index: number, item: any) => {
  console.log('TrackBy called for index:', index);
  return item.id;
};

// 3. Monitor memory usage
setInterval(() => {
  if ('memory' in performance) {
    console.log('Memory usage:', (performance as any).memory);
  }
}, 5000);
```

### Issue: Tests Failing Intermittently

**Symptoms:**
- Tests pass sometimes, fail other times
- Different results in CI vs local
- Timing-dependent failures

**Debug Steps:**
```typescript
// 1. Add test timeouts and waits
test('should sort data', async () => {
  // ... setup ...
  
  // Add explicit waits
  await page.waitForSelector('.ng-ui-lib-row');
  await page.waitForTimeout(100); // Allow rendering to complete
  
  // ... assertions ...
});

// 2. Use test fixtures for consistent data
beforeEach(() => {
  // Use fixed test data instead of random
  testData = createFixedTestData();
});

// 3. Mock timers for time-dependent tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});
```

This comprehensive debugging guide provides the tools and techniques needed to effectively troubleshoot issues in the BLG Grid library. Remember that debugging is a skill that improves with practice—don't hesitate to experiment with different approaches and tools to find what works best for your specific situation.