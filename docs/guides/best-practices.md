# Best Practices Guide

Comprehensive guide for implementing BlgGrid efficiently, following Angular best practices, and optimizing performance.

## Architecture and Design Patterns

### Component Organization

#### Container-Presentation Pattern

Separate data management from presentation:

```typescript
// Container Component (Smart Component)
@Component({
  selector: 'app-user-management',
  template: `
    <div class="user-management">
      <app-user-filters 
        (filterChange)="updateFilters($event)">
      </app-user-filters>
      
      <app-user-grid-presentation 
        [users]="filteredUsers$ | async"
        [loading]="loading$ | async"
        [columns]="userColumns"
        [config]="gridConfig"
        (userSelect)="onUserSelect($event)"
        (userEdit)="onUserEdit($event)">
      </app-user-grid-presentation>
    </div>
  `
})
export class UserManagementComponent {
  // Data management logic
  private filtersSubject = new BehaviorSubject({});
  
  filteredUsers$ = combineLatest([
    this.userService.getUsers(),
    this.filtersSubject
  ]).pipe(
    map(([users, filters]) => this.applyFilters(users, filters))
  );
  
  loading$ = this.userService.loading$;
  
  onUserSelect(user: User) {
    this.store.dispatch(selectUser({ user }));
  }
  
  onUserEdit(user: User) {
    this.router.navigate(['/users', user.id, 'edit']);
  }
}

// Presentation Component (Dumb Component)
@Component({
  selector: 'app-user-grid-presentation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-loading" *ngIf="loading">Loading users...</div>
    <blg-grid 
      [data]="users || []"
      [columns]="columns"
      [config]="config"
      (rowSelect)="userSelect.emit($event.data.rowData)"
      (cellClick)="handleCellClick($event)">
    </blg-grid>
  `
})
export class UserGridPresentationComponent {
  @Input() users: User[] | null = null;
  @Input() loading: boolean | null = null;
  @Input() columns: ColumnDefinition[] = [];
  @Input() config: GridConfig = {};
  
  @Output() userSelect = new EventEmitter<User>();
  @Output() userEdit = new EventEmitter<User>();
  
  handleCellClick(event: CellClickEvent) {
    if (event.data.columnId === 'actions') {
      this.userEdit.emit(event.data.rowData);
    }
  }
}
```

### Service Layer Pattern

#### Data Service with Caching

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private cache = new Map<string, Observable<any>>();
  private refreshSubject = new Subject<void>();
  
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.getCachedData('users', () => 
      this.http.get<User[]>('/api/users')
    );
  }
  
  getUsersPaginated(page: number, size: number): Observable<PagedResult<User>> {
    const key = `users-${page}-${size}`;
    return this.getCachedData(key, () => 
      this.http.get<PagedResult<User>>(`/api/users?page=${page}&size=${size}`)
    );
  }
  
  searchUsers(query: string): Observable<User[]> {
    // Don't cache search results
    return this.http.get<User[]>(`/api/users/search?q=${encodeURIComponent(query)}`);
  }
  
  private getCachedData<T>(key: string, factory: () => Observable<T>): Observable<T> {
    if (!this.cache.has(key)) {
      const data$ = factory().pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
        takeUntil(this.refreshSubject)
      );
      this.cache.set(key, data$);
    }
    return this.cache.get(key)!;
  }
  
  refreshCache() {
    this.cache.clear();
    this.refreshSubject.next();
  }
}
```

#### State Management Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserGridStateService {
  private state = signal<UserGridState>({
    users: [],
    selectedUsers: new Set(),
    filters: {},
    sortState: null,
    pagination: { page: 1, size: 50, total: 0 }
  });
  
  // Computed signals for reactive access
  readonly users = computed(() => this.state().users);
  readonly selectedUsers = computed(() => this.state().selectedUsers);
  readonly filteredUsers = computed(() => this.applyFiltersAndSort());
  readonly pagination = computed(() => this.state().pagination);
  
  // Actions
  setUsers(users: User[]) {
    this.state.update(state => ({ ...state, users }));
  }
  
  toggleUserSelection(userId: number) {
    this.state.update(state => {
      const selectedUsers = new Set(state.selectedUsers);
      if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
      } else {
        selectedUsers.add(userId);
      }
      return { ...state, selectedUsers };
    });
  }
  
  updateFilters(filters: Record<string, any>) {
    this.state.update(state => ({ 
      ...state, 
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page
    }));
  }
  
  private applyFiltersAndSort(): User[] {
    const { users, filters, sortState } = this.state();
    let result = [...users];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(user => this.matchesFilters(user, filters));
    }
    
    // Apply sorting
    if (sortState) {
      result = this.sortUsers(result, sortState);
    }
    
    return result;
  }
}
```

## Performance Optimization

### Virtual Scrolling Best Practices

#### Optimal Configuration

```typescript
@Component({
  template: `
    <blg-grid 
      [data]="data" 
      [columns]="columns" 
      [config]="optimizedConfig">
    </blg-grid>
  `
})
export class PerformanceOptimizedGridComponent {
  optimizedConfig: GridConfig = {
    // Essential for large datasets
    virtualScrolling: true,
    rowHeight: 40,            // Consistent height is crucial
    
    // Reduce features for better performance
    filterable: false,        // Disable if not needed
    reorderable: false,       // Disable column reordering if not needed
    
    // Optimize selection
    selectionMode: 'single',  // Faster than multiple selection
    
    // Use minimal theme
    theme: 'minimal'          // Less CSS = better performance
  };
  
  // Use trackBy for better change detection
  trackByUserId = (index: number, user: User) => user.id;
}
```

#### Large Dataset Handling

```typescript
@Component({})
export class LargeDatasetComponent implements OnInit {
  private readonly CHUNK_SIZE = 1000;
  private readonly MAX_RENDERED_ROWS = 10000;
  
  displayData: any[] = [];
  totalDataSize = 0;
  
  ngOnInit() {
    this.loadDataInChunks();
  }
  
  private async loadDataInChunks() {
    const totalData = await this.dataService.getAllData();
    this.totalDataSize = totalData.length;
    
    // Only render a subset for initial display
    this.displayData = totalData.slice(0, this.MAX_RENDERED_ROWS);
    
    // Implement pagination or infinite scroll for the rest
    this.setupInfiniteScroll(totalData);
  }
  
  private setupInfiniteScroll(allData: any[]) {
    // Monitor scroll position and load more data as needed
    // Implementation depends on your specific requirements
  }
}
```

### Memory Management

#### Subscription Management

```typescript
@Component({})
export class SubscriptionManagedComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Method 1: Using takeUntil operator
  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.data = data);
      
    this.userInteractions$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(interaction => this.handleInteraction(interaction));
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Method 2: Using DestroyRef (Angular 16+)
@Component({})
export class ModernSubscriptionComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  
  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.data = data);
  }
}
```

#### Memory-Efficient Data Structures

```typescript
@Injectable()
export class EfficientDataService {
  // Use Map for O(1) lookups instead of array.find()
  private userMap = new Map<number, User>();
  private userList: User[] = [];
  
  setUsers(users: User[]) {
    this.userMap.clear();
    this.userList = users;
    
    // Build index for fast lookups
    users.forEach(user => this.userMap.set(user.id, user));
  }
  
  getUserById(id: number): User | undefined {
    return this.userMap.get(id); // O(1) instead of O(n)
  }
  
  updateUser(updatedUser: User) {
    this.userMap.set(updatedUser.id, updatedUser);
    
    // Update array efficiently
    const index = this.userList.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.userList[index] = updatedUser;
    }
  }
}
```

## Data Management

### Immutable Data Patterns

```typescript
@Component({})
export class ImmutableDataComponent {
  private dataSubject = new BehaviorSubject<User[]>([]);
  data$ = this.dataSubject.asObservable();
  
  // ❌ Mutating existing data
  addUserBad(newUser: User) {
    const currentData = this.dataSubject.value;
    currentData.push(newUser); // Mutates array
    this.dataSubject.next(currentData);
  }
  
  // ✅ Immutable updates
  addUser(newUser: User) {
    const currentData = this.dataSubject.value;
    this.dataSubject.next([...currentData, newUser]);
  }
  
  updateUser(updatedUser: User) {
    const currentData = this.dataSubject.value;
    const newData = currentData.map(user => 
      user.id === updatedUser.id ? { ...user, ...updatedUser } : user
    );
    this.dataSubject.next(newData);
  }
  
  removeUser(userId: number) {
    const currentData = this.dataSubject.value;
    this.dataSubject.next(currentData.filter(user => user.id !== userId));
  }
}
```

### Data Transformation Patterns

```typescript
@Component({})
export class DataTransformationComponent {
  // Use memoization for expensive computations
  private memoizedTransforms = new Map<string, any>();
  
  processedData$ = this.rawData$.pipe(
    map(data => this.transformData(data)),
    shareReplay(1) // Cache the result
  );
  
  private transformData(data: RawUser[]): ProcessedUser[] {
    const key = this.generateDataKey(data);
    
    if (this.memoizedTransforms.has(key)) {
      return this.memoizedTransforms.get(key);
    }
    
    const processed = data.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      displayRole: this.formatRole(user.role),
      lastActiveDisplay: this.formatDate(user.lastActive)
    }));
    
    this.memoizedTransforms.set(key, processed);
    return processed;
  }
  
  private generateDataKey(data: any[]): string {
    // Simple hash based on data length and first/last item IDs
    return `${data.length}-${data[0]?.id}-${data[data.length - 1]?.id}`;
  }
}
```

## Component Design

### Reusable Grid Configurations

```typescript
// Grid configuration factory
@Injectable({
  providedIn: 'root'
})
export class GridConfigFactory {
  
  createUserGridConfig(options: Partial<GridConfig> = {}): GridConfig {
    return {
      virtualScrolling: true,
      rowHeight: 48,
      selectable: true,
      selectionMode: 'multiple',
      sortable: true,
      filterable: true,
      resizable: true,
      theme: 'default',
      ...options
    };
  }
  
  createReadOnlyGridConfig(options: Partial<GridConfig> = {}): GridConfig {
    return {
      virtualScrolling: true,
      rowHeight: 40,
      selectable: false,
      sortable: true,
      filterable: false,
      resizable: false,
      reorderable: false,
      theme: 'minimal',
      ...options
    };
  }
  
  createPerformanceGridConfig(options: Partial<GridConfig> = {}): GridConfig {
    return {
      virtualScrolling: true,
      rowHeight: 35,
      selectable: false,
      sortable: false,
      filterable: false,
      resizable: false,
      reorderable: false,
      theme: 'compact',
      ...options
    };
  }
}
```

### Column Definition Patterns

```typescript
@Injectable({
  providedIn: 'root'
})
export class ColumnDefinitionService {
  
  createStandardColumns(entityType: 'user' | 'product' | 'order'): ColumnDefinition[] {
    const columnMap = {
      user: this.getUserColumns(),
      product: this.getProductColumns(),
      order: this.getOrderColumns()
    };
    return columnMap[entityType];
  }
  
  private getUserColumns(): ColumnDefinition[] {
    return [
      {
        id: 'avatar',
        field: 'avatarUrl',
        header: '',
        width: 60,
        resizable: false,
        sortable: false,
        filterable: false,
        cellRenderer: 'avatar-cell-renderer',
        pinned: 'left'
      },
      {
        id: 'name',
        field: 'fullName',
        header: 'Name',
        type: 'string',
        width: 200,
        sortable: true,
        filterable: true,
        pinned: 'left'
      },
      {
        id: 'email',
        field: 'email',
        header: 'Email',
        type: 'string',
        width: 250,
        sortable: true,
        filterable: true
      },
      // ... more columns
    ];
  }
  
  createActionColumn(actions: string[]): ColumnDefinition {
    return {
      id: 'actions',
      field: 'actions',
      header: 'Actions',
      width: actions.length * 40 + 20,
      resizable: false,
      sortable: false,
      filterable: false,
      cellRenderer: 'action-buttons-renderer',
      pinned: 'right'
    };
  }
}
```

### Custom Cell Renderers

```typescript
// Base cell renderer
export abstract class BaseCellRenderer {
  @Input() value: any;
  @Input() rowData: any;
  @Input() columnDef: ColumnDefinition;
}

// Status badge renderer
@Component({
  selector: 'status-cell-renderer',
  template: `
    <span class="status-badge" [class]="'status-' + getStatusClass()">
      <i class="status-icon" [class]="'icon-' + getStatusClass()"></i>
      {{ getDisplayValue() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      gap: 4px;
    }
    .status-active { background: #e7f5e7; color: #2e7d32; }
    .status-inactive { background: #ffebee; color: #c62828; }
    .status-pending { background: #fff3e0; color: #f57c00; }
  `]
})
export class StatusCellRenderer extends BaseCellRenderer {
  getStatusClass(): string {
    return this.value?.toLowerCase() || 'unknown';
  }
  
  getDisplayValue(): string {
    return this.value?.charAt(0).toUpperCase() + this.value?.slice(1).toLowerCase() || 'Unknown';
  }
}

// Action buttons renderer
@Component({
  selector: 'action-buttons-renderer',
  template: `
    <div class="action-buttons">
      <button 
        *ngFor="let action of getActions()" 
        [class]="'btn btn-' + action.type"
        [disabled]="isActionDisabled(action)"
        (click)="performAction(action)"
        [title]="action.tooltip">
        <i [class]="action.icon"></i>
        <span *ngIf="action.label">{{ action.label }}</span>
      </button>
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    .btn {
      padding: 4px 8px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary { background: #007bff; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
  `]
})
export class ActionButtonsRenderer extends BaseCellRenderer {
  @Output() actionClick = new EventEmitter<{action: string, rowData: any}>();
  
  getActions() {
    return this.columnDef.actions || [
      { type: 'edit', icon: 'fas fa-edit', tooltip: 'Edit', action: 'edit' },
      { type: 'delete', icon: 'fas fa-trash', tooltip: 'Delete', action: 'delete' }
    ];
  }
  
  isActionDisabled(action: any): boolean {
    return action.disabled?.(this.rowData) || false;
  }
  
  performAction(action: any) {
    this.actionClick.emit({ action: action.action, rowData: this.rowData });
  }
}
```

## Error Handling

### Defensive Programming

```typescript
@Component({})
export class DefensiveGridComponent implements OnInit {
  data: any[] = [];
  columns: ColumnDefinition[] = [];
  error: string | null = null;
  loading = true;
  
  ngOnInit() {
    this.loadData();
  }
  
  private loadData() {
    this.dataService.getData().pipe(
      timeout(30000), // 30 second timeout
      retry({ count: 3, delay: 1000 }), // Retry 3 times with 1s delay
      catchError(error => {
        console.error('Failed to load grid data:', error);
        this.error = this.getErrorMessage(error);
        return of([]); // Return empty array to prevent crashes
      }),
      finalize(() => this.loading = false)
    ).subscribe(data => {
      this.data = this.validateAndSanitizeData(data);
    });
  }
  
  private validateAndSanitizeData(data: any[]): any[] {
    if (!Array.isArray(data)) {
      console.warn('Invalid data format received, expected array');
      return [];
    }
    
    return data.filter((item, index) => {
      if (!item || typeof item !== 'object') {
        console.warn(`Invalid item at index ${index}:`, item);
        return false;
      }
      return true;
    }).map(item => this.sanitizeItem(item));
  }
  
  private sanitizeItem(item: any): any {
    // Ensure required fields exist
    return {
      id: item.id ?? `temp-${Date.now()}-${Math.random()}`,
      ...item,
      // Sanitize string fields
      name: this.sanitizeString(item.name),
      email: this.sanitizeString(item.email),
      // Ensure numbers are valid
      age: this.sanitizeNumber(item.age),
      // Ensure dates are valid
      createdAt: this.sanitizeDate(item.createdAt)
    };
  }
  
  private sanitizeString(value: any): string {
    if (typeof value === 'string') return value;
    if (value == null) return '';
    return String(value);
  }
  
  private sanitizeNumber(value: any): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  
  private sanitizeDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }
  
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    if (error.status === 404) {
      return 'Data not found.';
    }
    if (error.status === 403) {
      return 'Access denied.';
    }
    return error.message || 'An unexpected error occurred.';
  }
}
```

### Global Error Handler

```typescript
@Injectable()
export class GridErrorHandler implements ErrorHandler {
  constructor(private notificationService: NotificationService) {}
  
  handleError(error: any): void {
    console.error('Grid Error:', error);
    
    if (this.isGridRelatedError(error)) {
      this.handleGridError(error);
    } else {
      // Let Angular's default error handler deal with it
      console.error(error);
    }
  }
  
  private isGridRelatedError(error: any): boolean {
    return error?.context?.includes('blg-grid') ||
           error?.stack?.includes('blg-grid') ||
           error?.message?.includes('grid');
  }
  
  private handleGridError(error: any) {
    this.notificationService.showError(
      'Grid Error: ' + (error.message || 'An unexpected error occurred')
    );
  }
}
```

## Testing Strategies

### Component Testing

```typescript
describe('UserGridComponent', () => {
  let component: UserGridComponent;
  let fixture: ComponentFixture<UserGridComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  
  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers', 'updateUser']);
    
    await TestBed.configureTestingModule({
      imports: [UserGridComponent, Grid],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserGridComponent);
    component = fixture.componentInstance;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });
  
  it('should load and display users', fakeAsync(() => {
    // Arrange
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    mockUserService.getUsers.and.returnValue(of(mockUsers));
    
    // Act
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    // Assert
    expect(component.users).toEqual(mockUsers);
    const rows = fixture.debugElement.queryAll(By.css('.blg-grid__row'));
    expect(rows.length).toBe(2);
  }));
  
  it('should handle user selection', () => {
    // Arrange
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    spyOn(component.userSelect, 'emit');
    
    // Act
    component.onRowSelect({ data: { rowData: mockUser } } as any);
    
    // Assert
    expect(component.userSelect.emit).toHaveBeenCalledWith(mockUser);
  });
  
  it('should handle errors gracefully', fakeAsync(() => {
    // Arrange
    mockUserService.getUsers.and.returnValue(throwError(() => new Error('Network error')));
    
    // Act
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    // Assert
    expect(component.error).toBeTruthy();
    expect(component.users).toEqual([]);
  }));
});
```

### Integration Testing

```typescript
describe('UserGrid Integration', () => {
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserGridComponent],
      providers: [UserService]
    });
    
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should load users from API', fakeAsync(() => {
    // Arrange
    const fixture = TestBed.createComponent(UserGridComponent);
    const component = fixture.componentInstance;
    const mockUsers = [{ id: 1, name: 'Test User' }];
    
    // Act
    fixture.detectChanges();
    tick();
    
    // Assert HTTP call
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
    
    tick();
    fixture.detectChanges();
    
    expect(component.users).toEqual(mockUsers);
  }));
});
```

### E2E Testing Best Practices

```typescript
// Page Object Model
export class UserGridPage {
  constructor(private page: Page) {}
  
  async navigateToUsers() {
    await this.page.goto('/users');
    await this.waitForGridToLoad();
  }
  
  async waitForGridToLoad() {
    await this.page.waitForSelector('[data-testid="user-grid"]');
    await this.page.waitForSelector('[data-testid="user-grid"] .blg-grid__row');
  }
  
  async getRowCount() {
    return await this.page.locator('[data-testid="user-grid"] .blg-grid__row').count();
  }
  
  async clickRow(index: number) {
    await this.page.locator(`[data-testid="user-grid"] .blg-grid__row:nth-child(${index + 1})`).click();
  }
  
  async sortByColumn(columnId: string) {
    await this.page.locator(`[data-column-id="${columnId}"] .header-cell`).click();
  }
  
  async filterByName(name: string) {
    await this.page.fill('[data-testid="name-filter"]', name);
    await this.page.waitForTimeout(300); // Wait for debounce
  }
}

// E2E Test
test.describe('User Grid', () => {
  let userGridPage: UserGridPage;
  
  test.beforeEach(async ({ page }) => {
    userGridPage = new UserGridPage(page);
    await userGridPage.navigateToUsers();
  });
  
  test('should display user data', async () => {
    const rowCount = await userGridPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });
  
  test('should sort by name', async () => {
    await userGridPage.sortByColumn('name');
    
    // Verify sort indicator
    await expect(page.locator('[data-column-id="name"] .sort-asc')).toBeVisible();
  });
  
  test('should filter users by name', async () => {
    const initialRowCount = await userGridPage.getRowCount();
    
    await userGridPage.filterByName('John');
    
    const filteredRowCount = await userGridPage.getRowCount();
    expect(filteredRowCount).toBeLessThan(initialRowCount);
  });
});
```

## Accessibility

### ARIA Support

```typescript
@Component({
  selector: 'accessible-grid',
  template: `
    <div 
      role="grid" 
      [attr.aria-label]="gridAriaLabel"
      [attr.aria-rowcount]="data.length"
      [attr.aria-colcount]="columns.length">
      
      <blg-grid 
        [data]="data"
        [columns]="accessibleColumns"
        [config]="accessibleConfig">
      </blg-grid>
    </div>
  `
})
export class AccessibleGridComponent {
  gridAriaLabel = 'User data grid';
  
  accessibleColumns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Full Name', // Descriptive header
      type: 'string',
      ariaLabel: 'User full name' // Custom aria label
    }
  ];
  
  accessibleConfig: GridConfig = {
    // Ensure keyboard navigation works
    selectable: true,
    // Provide clear visual feedback
    theme: 'accessible'
  };
}
```

### Keyboard Navigation

```typescript
@Component({})
export class KeyboardNavGridComponent {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Add custom keyboard shortcuts
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault();
      this.focusFilterInput();
    }
    
    if (event.key === 'Escape') {
      this.clearSelection();
    }
  }
  
  private focusFilterInput() {
    const filterInput = document.querySelector('[data-testid="filter-input"]') as HTMLElement;
    filterInput?.focus();
  }
  
  private clearSelection() {
    this.gridStateService.clearSelection();
  }
}
```

## Summary

Following these best practices will help you create maintainable, performant, and accessible grid implementations:

1. **Architecture**: Use container-presentation pattern for separation of concerns
2. **Performance**: Implement virtual scrolling and memory management
3. **Data**: Use immutable patterns and proper state management
4. **Components**: Create reusable configurations and renderers
5. **Error Handling**: Implement defensive programming and graceful degradation
6. **Testing**: Write comprehensive unit, integration, and E2E tests
7. **Accessibility**: Ensure proper ARIA support and keyboard navigation

These patterns and practices will scale with your application and provide a solid foundation for complex grid implementations.