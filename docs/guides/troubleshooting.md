# Troubleshooting Guide

Common issues and solutions when working with BlgGrid. This guide covers installation problems, configuration issues, performance concerns, and debugging techniques.

## Installation Issues

### Package Not Found

**Problem:** `Cannot resolve dependency '@ng-ui-lib/core'`

**Causes:**
- Package not installed
- Incorrect package name
- Version mismatch

**Solutions:**
```bash
# Verify installation
npm list @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme

# Reinstall packages
npm uninstall @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme
npm install @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Errors

**Problem:** TypeScript compilation fails with import errors

**Common Errors:**
```
Could not find a declaration file for module '@ng-ui-lib/core'
```

**Solutions:**
1. Check TypeScript version compatibility:
```bash
npm list typescript
# Ensure TypeScript 5.0+ is installed
```

2. Update tsconfig.json:
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  }
}
```

3. Clear TypeScript cache:
```bash
# Clear Angular CLI cache
ng cache clean
# Or manually clear
rm -rf .angular/cache
```

## Component Issues

### Grid Not Displaying

**Problem:** Grid component renders but shows no content

**Checklist:**
1. **Container Height:**
```html
<!-- ❌ Incorrect - no height set -->
<ng-ui-lib [data]="data" [columns]="columns"></ng-ui-lib>

<!-- ✅ Correct - explicit height -->
<div style="height: 500px;">
  <ng-ui-lib [data]="data" [columns]="columns"></ng-ui-lib>
</div>
```

2. **Data Format:**
```typescript
// ❌ Incorrect - null or undefined data
data = null;

// ✅ Correct - array (can be empty)
data = [];
// or
data = [{ id: 1, name: 'John' }];
```

3. **Column Configuration:**
```typescript
// ❌ Incorrect - missing required properties
columns = [{ header: 'Name' }];

// ✅ Correct - required id and field
columns: ColumnDefinition[] = [
  { id: 'name', field: 'name', header: 'Name' }
];
```

### Grid Shows But No Data

**Problem:** Grid header shows but rows are empty

**Debug Steps:**

1. **Check Data Binding:**
```typescript
// Add debug logging
@Component({
  template: `
    <div>Data count: {{ data?.length || 0 }}</div>
    <div>Columns count: {{ columns?.length || 0 }}</div>
    <ng-ui-lib [data]="data" [columns]="columns"></ng-ui-lib>
  `
})
export class DebugGridComponent {
  ngOnInit() {
    console.log('Data:', this.data);
    console.log('Columns:', this.columns);
  }
}
```

2. **Verify Field Mapping:**
```typescript
// Data
data = [{ fullName: 'John Doe', userEmail: 'john@example.com' }];

// ❌ Incorrect - field names don't match
columns = [
  { id: 'name', field: 'name', header: 'Name' },
  { id: 'email', field: 'email', header: 'Email' }
];

// ✅ Correct - field names match data properties
columns = [
  { id: 'name', field: 'fullName', header: 'Name' },
  { id: 'email', field: 'userEmail', header: 'Email' }
];
```

### Styles Not Applied

**Problem:** Grid appears unstyled or uses default browser styles

**Solutions:**

1. **Import Theme Styles:**
```scss
// styles.scss
@import '@ng-ui-lib/theme/styles/default-theme.scss';
```

2. **Or add to angular.json:**
```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.scss",
              "node_modules/@ng-ui-lib/theme/styles/default-theme.css"
            ]
          }
        }
      }
    }
  }
}
```

3. **Verify Theme Configuration:**
```typescript
config: GridConfig = {
  theme: 'default' // Ensure theme is set
};
```

## Performance Issues

### Slow Rendering with Large Datasets

**Problem:** Grid becomes unresponsive with many rows

**Solutions:**

1. **Enable Virtual Scrolling:**
```typescript
// ❌ Without virtual scrolling (slow with 1000+ rows)
config = {
  virtualScrolling: false
};

// ✅ With virtual scrolling (fast with 100k+ rows)
config = {
  virtualScrolling: true,
  rowHeight: 40 // Required for virtual scrolling
};
```

2. **Optimize Column Configuration:**
```typescript
// ❌ Too many features enabled
columns = [
  {
    id: 'name',
    field: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
    resizable: true,
    // ... many custom renderers
  }
  // ... 50+ columns
];

// ✅ Disable unnecessary features
columns = [
  {
    id: 'name',
    field: 'name',
    header: 'Name',
    sortable: true,
    filterable: false, // Disable on some columns
    resizable: false   // Disable on some columns
  }
];
```

3. **Use OnPush Change Detection:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-ui-lib [data]="data" [columns]="columns"></ng-ui-lib>`
})
export class OptimizedGridComponent {
  // Use immutable data updates
  updateData() {
    this.data = [...this.data, newItem]; // Create new array
  }
}
```

### Memory Leaks

**Problem:** Memory usage increases over time

**Common Causes and Solutions:**

1. **Unsubscribed Observables:**
```typescript
// ❌ Memory leak - subscription not cleaned up
@Component({})
export class LeakyGridComponent implements OnInit {
  ngOnInit() {
    this.dataService.getData().subscribe(data => {
      this.data = data;
    });
  }
}

// ✅ Proper cleanup
@Component({})
export class CleanGridComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.data = data;
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

2. **Large Data Accumulation:**
```typescript
// ❌ Continuously growing dataset
addMoreData() {
  this.data.push(...newData); // Keeps growing
}

// ✅ Limit dataset size
addMoreData() {
  this.data = [...this.data, ...newData].slice(-10000); // Keep last 10k items
}
```

## Data Binding Issues

### Observable Data Not Updating

**Problem:** Grid doesn't update when observable data changes

**Debug:**
```typescript
@Component({
  template: `
    <div>Data loading: {{ loading }}</div>
    <div>Data items: {{ (data$ | async)?.length || 0 }}</div>
    <ng-ui-lib [data]="data$ | async || []" [columns]="columns"></ng-ui-lib>
  `
})
export class ObservableGridComponent {
  data$ = this.dataService.getData().pipe(
    tap(data => console.log('Data received:', data?.length)),
    shareReplay(1) // Cache the latest emission
  );
}
```

**Solutions:**
1. **Use AsyncPipe:**
```typescript
// ✅ Correct - AsyncPipe handles subscription
template: `<ng-ui-lib [data]="data$ | async || []" [columns]="columns"></ng-ui-lib>`
```

2. **Handle Loading States:**
```typescript
data$ = this.dataService.getData().pipe(
  startWith([]), // Start with empty array
  catchError(error => {
    console.error('Data loading failed:', error);
    return of([]); // Return empty array on error
  })
);
```

### Nested Object Data

**Problem:** Grid can't display data from nested objects

```typescript
// Data with nested objects
data = [
  {
    id: 1,
    profile: { name: 'John Doe', age: 30 },
    contact: { email: 'john@example.com' }
  }
];
```

**Solutions:**

1. **Flatten Data:**
```typescript
get processedData() {
  return this.rawData.map(item => ({
    id: item.id,
    name: item.profile.name,
    age: item.profile.age,
    email: item.contact.email
  }));
}
```

2. **Custom Cell Renderer:**
```typescript
@Component({
  selector: 'nested-cell-renderer',
  template: `{{ getNestedValue() }}`
})
export class NestedCellRenderer {
  @Input() value: any;
  @Input() rowData: any;
  @Input() columnDef: ColumnDefinition;
  
  getNestedValue() {
    const fieldPath = this.columnDef.field.split('.');
    let result = this.rowData;
    for (const field of fieldPath) {
      result = result?.[field];
    }
    return result;
  }
}
```

## Event Handling Issues

### Events Not Firing

**Problem:** Grid events like `(rowSelect)` not triggering

**Checklist:**
1. **Event Names:**
```html
<!-- ❌ Incorrect event names -->
<ng-ui-lib 
  (onRowSelect)="handler($event)"
  (onCellClick)="handler($event)">
</ng-ui-lib>

<!-- ✅ Correct event names -->
<ng-ui-lib 
  (rowSelect)="handler($event)"
  (cellClick)="handler($event)">
</ng-ui-lib>
```

2. **Selection Configuration:**
```typescript
// ❌ Selection disabled
config = {
  selectable: false // rowSelect events won't fire
};

// ✅ Selection enabled
config = {
  selectable: true
};
```

3. **Event Handler Implementation:**
```typescript
// ✅ Proper event handler
onRowSelect(event: RowSelectEvent) {
  console.log('Row selected:', event.data);
}

onCellClick(event: CellClickEvent) {
  console.log('Cell clicked:', event.data);
}
```

## Sorting and Filtering Issues

### Sorting Not Working

**Problem:** Clicking column headers doesn't sort data

**Debug Steps:**

1. **Check Configuration:**
```typescript
// ❌ Sorting disabled
config = {
  sortable: false
};

// Column-level sorting disabled
columns = [
  { id: 'name', field: 'name', header: 'Name', sortable: false }
];

// ✅ Sorting enabled
config = {
  sortable: true
};

columns = [
  { id: 'name', field: 'name', header: 'Name', sortable: true }
];
```

2. **Data Type Issues:**
```typescript
// ❌ Incorrect data types cause sorting issues
data = [
  { id: '1', name: 'John', age: '30' }, // String age
  { id: '2', name: 'Jane', age: '25' }
];

columns = [
  { id: 'age', field: 'age', header: 'Age', type: 'number' } // Type mismatch
];

// ✅ Correct data types
data = [
  { id: 1, name: 'John', age: 30 }, // Number age
  { id: 2, name: 'Jane', age: 25 }
];
```

### Custom Filtering Issues

**Problem:** Custom filters not working as expected

**Debug Custom Filters:**
```typescript
// Custom filter implementation
applyCustomFilter(data: any[], filters: any) {
  console.log('Applying filters:', filters);
  console.log('Input data length:', data.length);
  
  const filtered = data.filter(item => {
    // Debug each filter condition
    const passesFilter = Object.entries(filters).every(([key, value]) => {
      const result = this.checkFilterCondition(item, key, value);
      console.log(`Item ${item.id}, filter ${key}:`, result);
      return result;
    });
    return passesFilter;
  });
  
  console.log('Filtered data length:', filtered.length);
  return filtered;
}
```

## Accessibility Issues

### Screen Reader Problems

**Problem:** Screen readers can't navigate the grid properly

**Solutions:**

1. **ARIA Labels:**
```typescript
config: GridConfig = {
  ariaLabel: 'Employee data grid' // Add descriptive label
};
```

2. **Column Headers:**
```typescript
columns = [
  {
    id: 'name',
    field: 'name', 
    header: 'Employee Full Name', // Descriptive header
    type: 'string'
  }
];
```

3. **Keyboard Navigation:**
```html
<!-- Ensure grid is focusable -->
<ng-ui-lib 
  tabindex="0"
  [data]="data" 
  [columns]="columns"
  [config]="config">
</ng-ui-lib>
```

## Browser Compatibility

### Internet Explorer Issues

**Problem:** Grid doesn't work in older browsers

**Note:** BlgGrid requires modern browsers that support:
- ES6/ES2015 features
- CSS Grid Layout
- Intersection Observer API

**Solutions for Legacy Support:**
1. **Polyfills:**
```typescript
// polyfills.ts
import 'intersection-observer'; // For virtual scrolling
```

2. **Browser Detection:**
```typescript
@Component({
  template: `
    <div *ngIf="browserSupported; else unsupportedBrowser">
      <ng-ui-lib [data]="data" [columns]="columns"></ng-ui-lib>
    </div>
    <ng-template #unsupportedBrowser>
      <div class="browser-warning">
        Your browser is not supported. Please upgrade to a modern browser.
      </div>
    </ng-template>
  `
})
export class BrowserAwareGridComponent {
  browserSupported = this.checkBrowserSupport();
  
  private checkBrowserSupport(): boolean {
    return 'IntersectionObserver' in window && 
           CSS.supports('display', 'grid');
  }
}
```

## Testing Issues

### Unit Test Failures

**Problem:** Grid component tests fail

**Common Test Setup:**
```typescript
describe('GridComponent', () => {
  let component: TestGridComponent;
  let fixture: ComponentFixture<TestGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grid, TestGridComponent],
      providers: [GridStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(TestGridComponent);
    component = fixture.componentInstance;
    
    // Setup test data
    component.data = [
      { id: 1, name: 'Test User' }
    ];
    component.columns = [
      { id: 'id', field: 'id', header: 'ID', type: 'number' },
      { id: 'name', field: 'name', header: 'Name', type: 'string' }
    ];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should display data', () => {
    const rows = fixture.debugElement.queryAll(By.css('.ng-ui-lib__row'));
    expect(rows.length).toBe(1);
  });
});
```

### E2E Test Issues

**Problem:** End-to-end tests timeout or fail

**Stable Selectors:**
```typescript
// Use stable data attributes for testing
<ng-ui-lib 
  data-testid="user-grid"
  [data]="data" 
  [columns]="columns">
</ng-ui-lib>
```

**Wait for Grid Loading:**
```typescript
// Playwright example
test('should display grid data', async ({ page }) => {
  await page.goto('/users');
  
  // Wait for grid to be visible and loaded
  await page.waitForSelector('[data-testid="user-grid"]');
  await page.waitForSelector('[data-testid="user-grid"] .ng-ui-lib__row');
  
  const rowCount = await page.locator('[data-testid="user-grid"] .ng-ui-lib__row').count();
  expect(rowCount).toBeGreaterThan(0);
});
```

## Debugging Tools

### Debug Mode

Enable detailed logging:

```typescript
@Component({
  template: `
    <button (click)="toggleDebugMode()">Toggle Debug</button>
    <ng-ui-lib 
      [data]="data" 
      [columns]="columns" 
      [config]="config"
      (gridEvent)="onGridEvent($event)">
    </ng-ui-lib>
  `
})
export class DebugGridComponent {
  debugMode = false;
  
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
  }
  
  onGridEvent(event: any) {
    if (this.debugMode) {
      console.log('Grid Event:', event.type, event.data, event.timestamp);
    }
  }
}
```

### Performance Monitoring

```typescript
@Component({})
export class MonitoredGridComponent implements AfterViewInit {
  @ViewChild(Grid) grid!: Grid;
  
  ngAfterViewInit() {
    // Monitor performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('ng-ui-lib')) {
          console.log('Grid Performance:', entry.name, entry.duration);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }
}
```

## Getting Help

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discord**: Real-time community support
- **Stack Overflow**: Tag questions with `ng-ui-lib`

### Professional Support
- **Enterprise Support**: Priority support for business customers
- **Training**: Custom training sessions
- **Consulting**: Migration and implementation services

### Diagnostic Information

When reporting issues, include:

```typescript
// Environment information
const diagnosticInfo = {
  blgGridVersion: 'x.x.x',
  angularVersion: 'x.x.x',
  typescriptVersion: 'x.x.x',
  browser: navigator.userAgent,
  nodeVersion: process.version,
  
  // Grid configuration
  columns: this.columns,
  config: this.config,
  dataSize: this.data.length,
  
  // Error details
  errorMessage: 'Description of the issue',
  stepsToReproduce: [
    '1. Load grid with data',
    '2. Click sort header',
    '3. Error occurs'
  ],
  expectedBehavior: 'Grid should sort data',
  actualBehavior: 'Grid crashes with error'
};

console.log('Diagnostic Info:', JSON.stringify(diagnosticInfo, null, 2));
```

## Common Error Messages

### "Cannot read property 'length' of undefined"
- **Cause:** Data is undefined or null
- **Solution:** Initialize data as empty array or use safe navigation

### "ExpressionChangedAfterItHasBeenCheckedError"
- **Cause:** Data mutations during change detection
- **Solution:** Use OnPush change detection or immutable updates

### "NG0100: Expression has changed after it was checked"
- **Cause:** Computed properties changing during rendering
- **Solution:** Use pure pipes or memoization

### "Cannot find module '@ng-ui-lib/core'"
- **Cause:** Package not installed or incorrect import
- **Solution:** Verify installation and import paths

Remember to always check the browser console for detailed error messages and stack traces when debugging issues.