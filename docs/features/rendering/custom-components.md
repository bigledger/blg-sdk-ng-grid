# Custom Components

## Overview

Custom components in BLG Grid allow you to create reusable, interactive Angular components that can be used as cell renderers, editors, filters, and overlays, providing complete control over grid functionality and appearance.

## Use Cases

- Interactive cell content with Angular components
- Custom editors with complex validation
- Specialized filters for domain-specific data
- Loading and error overlays
- Custom header components with advanced functionality

## Cell Renderer Components

### Basic Custom Cell Renderer

```typescript
@Component({
  selector: 'app-status-badge',
  template: `
    <span 
      class="status-badge" 
      [ngClass]="statusClass"
      [title]="tooltip">
      <i [class]="iconClass"></i>
      {{ displayText }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-active {
      background: #d4edda;
      color: #155724;
    }
    
    .status-inactive {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-unknown {
      background: #e2e3e5;
      color: #383d41;
    }
  `]
})
export class StatusBadgeComponent implements ICellRendererAngularComp {
  statusClass = '';
  iconClass = '';
  displayText = '';
  tooltip = '';

  private params: any;

  agInit(params: any): void {
    this.params = params;
    this.updateDisplay();
  }

  refresh(params: any): boolean {
    this.params = params;
    this.updateDisplay();
    return true;
  }

  private updateDisplay(): void {
    const status = this.params.value?.toLowerCase() || 'unknown';
    
    const statusConfig = {
      active: {
        class: 'status-active',
        icon: 'fas fa-check-circle',
        text: 'Active',
        tooltip: 'This item is currently active'
      },
      inactive: {
        class: 'status-inactive', 
        icon: 'fas fa-times-circle',
        text: 'Inactive',
        tooltip: 'This item is inactive'
      },
      pending: {
        class: 'status-pending',
        icon: 'fas fa-clock',
        text: 'Pending',
        tooltip: 'This item is pending approval'
      },
      unknown: {
        class: 'status-unknown',
        icon: 'fas fa-question-circle',
        text: 'Unknown',
        tooltip: 'Status is unknown'
      }
    };

    const config = statusConfig[status] || statusConfig.unknown;
    this.statusClass = config.class;
    this.iconClass = config.icon;
    this.displayText = config.text;
    this.tooltip = config.tooltip;
  }
}
```

### Interactive Component with Services

```typescript
@Component({
  selector: 'app-user-profile-cell',
  template: `
    <div class="user-profile" (click)="showUserDetails()">
      <img 
        [src]="user.avatar || defaultAvatar" 
        [alt]="user.name"
        class="user-avatar"
        (error)="onImageError($event)">
      
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-role" *ngIf="user.role">{{ user.role }}</div>
      </div>
      
      <div class="user-status" [class]="'status-' + user.status">
        <i [class]="getStatusIcon()"></i>
      </div>
    </div>
  `,
  styles: [`
    .user-profile {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .user-profile:hover {
      background-color: #f8f9fa;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      object-fit: cover;
      border: 2px solid #e9ecef;
    }
    
    .user-info {
      flex: 1;
      min-width: 0;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .user-role {
      font-size: 11px;
      color: #6c757d;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .user-status {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 8px;
    }
    
    .status-online { background: #28a745; color: white; }
    .status-offline { background: #6c757d; color: white; }
    .status-busy { background: #dc3545; color: white; }
    .status-away { background: #ffc107; color: white; }
  `]
})
export class UserProfileCellComponent implements ICellRendererAngularComp {
  user: any = {};
  defaultAvatar = 'assets/images/default-avatar.png';

  private params: any;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  agInit(params: any): void {
    this.params = params;
    this.user = params.value || {};
    
    // Load additional user data if needed
    if (this.user.id && !this.user.avatar) {
      this.loadUserDetails();
    }
  }

  refresh(params: any): boolean {
    this.params = params;
    this.user = params.value || {};
    return true;
  }

  showUserDetails(): void {
    const dialogRef = this.dialog.open(UserDetailsDialogComponent, {
      data: { userId: this.user.id },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        // Refresh cell if user data was updated
        this.params.api.refreshCells({
          rowNodes: [this.params.node],
          columns: [this.params.column.getColId()]
        });
      }
    });
  }

  onImageError(event: any): void {
    event.target.src = this.defaultAvatar;
  }

  getStatusIcon(): string {
    const icons = {
      online: 'fas fa-circle',
      offline: 'far fa-circle',
      busy: 'fas fa-minus',
      away: 'fas fa-clock'
    };
    return icons[this.user.status] || icons.offline;
  }

  private async loadUserDetails(): Promise<void> {
    try {
      const userDetails = await this.userService.getUserDetails(this.user.id);
      this.user = { ...this.user, ...userDetails };
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  }
}
```

## Custom Editor Components

### Advanced Editor with Validation

```typescript
@Component({
  selector: 'app-rich-text-editor',
  template: `
    <div class="rich-text-editor" [class.focused]="isFocused">
      <div class="editor-toolbar">
        <button 
          type="button"
          (click)="execCommand('bold')"
          [class.active]="isCommandActive('bold')"
          title="Bold">
          <i class="fas fa-bold"></i>
        </button>
        <button 
          type="button"
          (click)="execCommand('italic')"
          [class.active]="isCommandActive('italic')"
          title="Italic">
          <i class="fas fa-italic"></i>
        </button>
        <button 
          type="button"
          (click)="execCommand('underline')"
          [class.active]="isCommandActive('underline')"
          title="Underline">
          <i class="fas fa-underline"></i>
        </button>
        <div class="toolbar-separator"></div>
        <button 
          type="button"
          (click)="insertLink()"
          title="Insert Link">
          <i class="fas fa-link"></i>
        </button>
      </div>
      
      <div 
        #editor
        class="editor-content"
        contenteditable="true"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (input)="onInput()"
        (keydown)="onKeyDown($event)"
        [innerHTML]="editorContent">
      </div>
      
      <div class="editor-footer">
        <span class="character-count">{{ characterCount }} characters</span>
        <div class="editor-actions">
          <button 
            type="button" 
            class="btn btn-sm btn-secondary"
            (click)="cancel()">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-sm btn-primary"
            (click)="save()"
            [disabled]="!isValid">
            Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rich-text-editor {
      border: 1px solid #ccc;
      border-radius: 4px;
      min-width: 400px;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      background: white;
    }
    
    .rich-text-editor.focused {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 8px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }
    
    .editor-toolbar button {
      background: none;
      border: 1px solid transparent;
      border-radius: 3px;
      padding: 4px 6px;
      cursor: pointer;
      color: #495057;
    }
    
    .editor-toolbar button:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }
    
    .editor-toolbar button.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .toolbar-separator {
      width: 1px;
      height: 20px;
      background: #dee2e6;
      margin: 0 4px;
    }
    
    .editor-content {
      flex: 1;
      padding: 12px;
      outline: none;
      min-height: 120px;
      overflow-y: auto;
    }
    
    .editor-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
      font-size: 12px;
    }
    
    .character-count {
      color: #6c757d;
    }
    
    .editor-actions {
      display: flex;
      gap: 8px;
    }
    
    .btn {
      padding: 4px 12px;
      border: 1px solid;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .btn-secondary {
      background: #6c757d;
      border-color: #6c757d;
      color: white;
    }
    
    .btn-primary {
      background: #007bff;
      border-color: #007bff;
      color: white;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class RichTextEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  editorContent = '';
  characterCount = 0;
  isFocused = false;
  isValid = true;
  
  private params: any;
  private originalValue = '';

  agInit(params: any): void {
    this.params = params;
    this.originalValue = params.value || '';
    this.editorContent = this.originalValue;
    this.updateCharacterCount();
  }

  ngAfterViewInit(): void {
    // Focus the editor after view is initialized
    setTimeout(() => {
      this.editorRef.nativeElement.focus();
    }, 100);
  }

  getValue(): string {
    return this.editorRef.nativeElement.innerHTML;
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
  }

  onInput(): void {
    this.updateCharacterCount();
    this.validateContent();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.save();
    }
  }

  execCommand(command: string): void {
    document.execCommand(command, false, undefined);
    this.editorRef.nativeElement.focus();
    this.onInput();
  }

  isCommandActive(command: string): boolean {
    return document.queryCommandState(command);
  }

  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      this.editorRef.nativeElement.focus();
      this.onInput();
    }
  }

  save(): void {
    if (this.isValid) {
      this.params.stopEditing();
    }
  }

  cancel(): void {
    this.editorRef.nativeElement.innerHTML = this.originalValue;
    this.params.stopEditing(true);
  }

  private updateCharacterCount(): void {
    const textContent = this.editorRef.nativeElement.textContent || '';
    this.characterCount = textContent.length;
  }

  private validateContent(): void {
    const textContent = this.editorRef.nativeElement.textContent || '';
    const maxLength = this.params.maxLength || 1000;
    
    this.isValid = textContent.length <= maxLength;
  }
}
```

## Custom Filter Components

### Advanced Filter Component

```typescript
@Component({
  selector: 'app-date-range-filter',
  template: `
    <div class="date-range-filter">
      <div class="filter-header">
        <span class="filter-title">Date Range</span>
        <button class="clear-btn" (click)="clearFilter()" *ngIf="hasFilter">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="filter-content">
        <div class="date-inputs">
          <div class="input-group">
            <label>From:</label>
            <input 
              type="date" 
              [(ngModel)]="fromDate"
              (change)="onFilterChanged()"
              class="date-input">
          </div>
          
          <div class="input-group">
            <label>To:</label>
            <input 
              type="date" 
              [(ngModel)]="toDate"
              (change)="onFilterChanged()"
              class="date-input">
          </div>
        </div>
        
        <div class="quick-filters">
          <button 
            *ngFor="let preset of datePresets"
            class="preset-btn"
            [class.active]="selectedPreset === preset.key"
            (click)="applyPreset(preset)">
            {{ preset.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .date-range-filter {
      padding: 12px;
      min-width: 280px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .filter-title {
      font-weight: 600;
      color: #495057;
    }
    
    .clear-btn {
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 2px;
    }
    
    .date-inputs {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .input-group label {
      font-size: 12px;
      font-weight: 500;
      color: #495057;
    }
    
    .date-input {
      border: 1px solid #ced4da;
      border-radius: 3px;
      padding: 6px 8px;
      font-size: 13px;
    }
    
    .quick-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .preset-btn {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 3px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 11px;
      color: #495057;
    }
    
    .preset-btn:hover {
      background: #e9ecef;
    }
    
    .preset-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  `]
})
export class DateRangeFilterComponent implements IFilterAngularComp {
  fromDate: string = '';
  toDate: string = '';
  selectedPreset: string = '';
  hasFilter = false;

  datePresets = [
    { key: 'today', label: 'Today', days: 0 },
    { key: 'week', label: 'This Week', days: 7 },
    { key: 'month', label: 'This Month', days: 30 },
    { key: 'quarter', label: 'This Quarter', days: 90 },
    { key: 'year', label: 'This Year', days: 365 }
  ];

  private params: any;

  agInit(params: any): void {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.hasFilter;
  }

  doesFilterPass(params: any): boolean {
    const cellValue = params.data[this.params.colDef.field];
    
    if (!cellValue || !this.hasFilter) {
      return true;
    }

    const cellDate = new Date(cellValue);
    const fromDateTime = this.fromDate ? new Date(this.fromDate).getTime() : 0;
    const toDateTime = this.toDate ? new Date(this.toDate).getTime() + (24 * 60 * 60 * 1000) - 1 : Infinity;
    const cellDateTime = cellDate.getTime();

    return cellDateTime >= fromDateTime && cellDateTime <= toDateTime;
  }

  getModel(): any {
    if (!this.hasFilter) {
      return null;
    }

    return {
      filterType: 'dateRange',
      fromDate: this.fromDate,
      toDate: this.toDate,
      preset: this.selectedPreset
    };
  }

  setModel(model: any): void {
    if (!model) {
      this.clearFilter();
      return;
    }

    this.fromDate = model.fromDate || '';
    this.toDate = model.toDate || '';
    this.selectedPreset = model.preset || '';
    this.hasFilter = !!(this.fromDate || this.toDate);
  }

  clearFilter(): void {
    this.fromDate = '';
    this.toDate = '';
    this.selectedPreset = '';
    this.hasFilter = false;
    this.onFilterChanged();
  }

  applyPreset(preset: any): void {
    this.selectedPreset = preset.key;
    
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - preset.days);
    
    this.fromDate = fromDate.toISOString().split('T')[0];
    this.toDate = today.toISOString().split('T')[0];
    
    this.onFilterChanged();
  }

  onFilterChanged(): void {
    this.hasFilter = !!(this.fromDate || this.toDate);
    this.params.filterChangedCallback();
  }
}
```

## Overlay Components

### Loading Overlay

```typescript
@Component({
  selector: 'app-custom-loading-overlay',
  template: `
    <div class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loading-text">{{ loadingMessage }}</div>
      <div class="loading-progress" *ngIf="showProgress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width.%]="progress">
          </div>
        </div>
        <span class="progress-text">{{ progress.toFixed(0) }}%</span>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(2px);
    }
    
    .loading-spinner {
      position: relative;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
    }
    
    .spinner-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 4px solid transparent;
      border-top-color: #007bff;
      border-radius: 50%;
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    
    .spinner-ring:nth-child(1) { animation-delay: -0.45s; }
    .spinner-ring:nth-child(2) { animation-delay: -0.3s; }
    .spinner-ring:nth-child(3) { animation-delay: -0.15s; }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text {
      color: #495057;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    
    .loading-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .progress-bar {
      width: 200px;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-size: 14px;
      font-weight: 500;
      color: #495057;
      min-width: 40px;
    }
  `]
})
export class CustomLoadingOverlayComponent implements ILoadingOverlayAngularComp {
  loadingMessage = 'Loading data...';
  showProgress = false;
  progress = 0;

  private params: any;

  agInit(params: any): void {
    this.params = params;
    
    // Customize based on parameters
    if (params.loadingMessage) {
      this.loadingMessage = params.loadingMessage;
    }
    
    if (params.showProgress) {
      this.showProgress = params.showProgress;
      this.progress = params.progress || 0;
    }
  }
}
```

## Component Registration

### Framework Components Registration

```typescript
@Component({
  selector: 'app-grid-with-custom-components',
  template: `
    <ng-ui-lib 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [frameworkComponents]="frameworkComponents"
      [loadingOverlayComponent]="'customLoadingOverlay'"
      [noRowsOverlayComponent]="'customNoRowsOverlay'">
    </ng-ui-lib>
  `
})
export class GridWithCustomComponentsComponent {
  frameworkComponents = {
    // Cell renderers
    statusBadge: StatusBadgeComponent,
    userProfile: UserProfileCellComponent,
    actionButtons: ActionButtonsRendererComponent,
    
    // Cell editors
    richTextEditor: RichTextEditorComponent,
    dateTimePicker: DateTimePickerComponent,
    
    // Filters
    dateRangeFilter: DateRangeFilterComponent,
    multiSelectFilter: MultiSelectFilterComponent,
    
    // Overlays
    customLoadingOverlay: CustomLoadingOverlayComponent,
    customNoRowsOverlay: CustomNoRowsOverlayComponent,
    
    // Headers
    customHeader: CustomHeaderComponent
  };

  columnDefs = [
    {
      field: 'user',
      headerName: 'User',
      cellRenderer: 'userProfile',
      width: 200
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: 'statusBadge',
      filter: 'dateRangeFilter',
      width: 120
    },
    {
      field: 'description',
      headerName: 'Description',
      cellEditor: 'richTextEditor',
      editable: true,
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: 'actionButtons',
      width: 150,
      suppressMenu: true,
      sortable: false,
      filter: false
    }
  ];
}
```

## Best Practices

1. **Implement lifecycle methods** correctly for proper cleanup
2. **Use OnPush change detection** for better performance
3. **Handle async operations** properly to avoid memory leaks
4. **Provide fallback content** for error states
5. **Test components** in isolation and within the grid
6. **Keep components focused** on single responsibilities
7. **Use TypeScript interfaces** for better type safety
8. **Document component APIs** for team collaboration