# Cell Rendering

## Overview

Cell rendering in BLG Grid allows you to customize how individual cells are displayed, providing complete control over cell content, styling, and behavior through custom components and renderers.

## Use Cases

- Custom data visualizations within cells
- Interactive elements like buttons and links
- Rich content display with HTML and components
- Status indicators and progress bars
- Dynamic styling based on cell values

## Basic Cell Rendering

### Built-in Cell Renderers

```typescript
export class BasicCellRenderingComponent {
  columnDefs = [
    {
      field: 'name',
      headerName: 'Name',
      // Default text renderer
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: 'blgBadgeRenderer',
      cellRendererParams: {
        badgeColors: {
          'active': 'success',
          'inactive': 'danger',
          'pending': 'warning'
        }
      }
    },
    {
      field: 'progress',
      headerName: 'Progress',
      cellRenderer: 'blgProgressRenderer',
      cellRendererParams: {
        showPercentage: true,
        colorScheme: 'blue'
      }
    },
    {
      field: 'rating',
      headerName: 'Rating',
      cellRenderer: 'blgStarRatingRenderer',
      cellRendererParams: {
        maxStars: 5,
        allowHalfStars: true
      }
    }
  ];
}
```

### Function-Based Renderers

```typescript
export class FunctionBasedRenderingComponent {
  columnDefs = [
    {
      field: 'amount',
      headerName: 'Amount',
      cellRenderer: this.currencyRenderer
    },
    {
      field: 'date',
      headerName: 'Date',
      cellRenderer: this.dateRenderer
    },
    {
      field: 'tags',
      headerName: 'Tags',
      cellRenderer: this.tagsRenderer
    }
  ];

  private currencyRenderer = (params: any): string => {
    const value = params.value;
    if (value == null) return '';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
    
    return `<span class="currency ${value < 0 ? 'negative' : 'positive'}">${formatted}</span>`;
  };

  private dateRenderer = (params: any): string => {
    const value = params.value;
    if (!value) return '';
    
    const date = new Date(value);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    let className = 'date-cell';
    if (diffDays > 30) className += ' old';
    else if (diffDays > 7) className += ' recent';
    else className += ' new';
    
    return `<span class="${className}">${date.toLocaleDateString()}</span>`;
  };

  private tagsRenderer = (params: any): string => {
    const tags = params.value;
    if (!Array.isArray(tags) || tags.length === 0) return '';
    
    return tags.map(tag => 
      `<span class="tag tag-${tag.toLowerCase().replace(/\s+/g, '-')}">${tag}</span>`
    ).join(' ');
  };
}
```

## Custom Angular Cell Renderers

### Creating Custom Components

```typescript
@Component({
  selector: 'app-action-buttons-renderer',
  template: `
    <div class="action-buttons">
      <button 
        class="btn btn-sm btn-primary"
        (click)="onEdit()"
        [disabled]="!canEdit">
        Edit
      </button>
      <button 
        class="btn btn-sm btn-info"
        (click)="onView()">
        View
      </button>
      <button 
        class="btn btn-sm btn-danger"
        (click)="onDelete()"
        [disabled]="!canDelete">
        Delete
      </button>
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 4px;
      padding: 2px;
    }
    
    .btn {
      padding: 2px 6px;
      font-size: 11px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary { background: #007bff; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-danger { background: #dc3545; color: white; }
  `]
})
export class ActionButtonsRendererComponent implements ICellRendererAngularComp {
  params: any;
  canEdit = true;
  canDelete = true;

  agInit(params: any): void {
    this.params = params;
    this.canEdit = this.checkEditPermission(params.data);
    this.canDelete = this.checkDeletePermission(params.data);
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  onEdit(): void {
    console.log('Edit clicked for:', this.params.data);
    this.params.context.componentParent.editRow(this.params.data);
  }

  onView(): void {
    console.log('View clicked for:', this.params.data);
    this.params.context.componentParent.viewRow(this.params.data);
  }

  onDelete(): void {
    console.log('Delete clicked for:', this.params.data);
    this.params.context.componentParent.deleteRow(this.params.data);
  }

  private checkEditPermission(data: any): boolean {
    return data.status !== 'locked' && data.editable !== false;
  }

  private checkDeletePermission(data: any): boolean {
    return data.status !== 'locked' && data.deletable !== false;
  }
}
```

### Complex Data Visualization

```typescript
@Component({
  selector: 'app-chart-cell-renderer',
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <span class="chart-title">{{ chartTitle }}</span>
        <span class="chart-value">{{ displayValue }}</span>
      </div>
      <div class="chart-body">
        <canvas #chartCanvas [width]="chartWidth" [height]="chartHeight"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 4px;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      margin-bottom: 2px;
    }
    
    .chart-title {
      font-weight: bold;
      color: #666;
    }
    
    .chart-value {
      color: #333;
      font-weight: bold;
    }
    
    .chart-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    canvas {
      max-width: 100%;
      max-height: 100%;
    }
  `]
})
export class ChartCellRendererComponent implements ICellRendererAngularComp, AfterViewInit {
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  params: any;
  chartTitle = '';
  displayValue = '';
  chartWidth = 60;
  chartHeight = 30;
  
  private chart: any;

  agInit(params: any): void {
    this.params = params;
    this.processData();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  refresh(params: any): boolean {
    this.params = params;
    this.processData();
    this.updateChart();
    return true;
  }

  private processData(): void {
    const data = this.params.value;
    
    if (Array.isArray(data)) {
      this.chartTitle = this.params.colDef.headerName || 'Chart';
      this.displayValue = data[data.length - 1]?.toString() || '0';
    } else {
      this.displayValue = data?.toString() || '0';
    }
  }

  private createChart(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Simple line chart implementation
    const data = this.params.value;
    if (!Array.isArray(data) || data.length === 0) return;
    
    this.drawLineChart(ctx, data);
  }

  private drawLineChart(ctx: CanvasRenderingContext2D, data: number[]): void {
    const width = this.chartWidth;
    const height = this.chartHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate scales
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const xStep = width / (data.length - 1);
    
    // Draw line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = index * xStep;
      const y = height - ((value - minValue) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#007bff';
    data.forEach((value, index) => {
      const x = index * xStep;
      const y = height - ((value - minValue) / range) * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  private updateChart(): void {
    if (this.canvasRef?.nativeElement) {
      this.createChart();
    }
  }
}
```

### Interactive Cell Renderers

```typescript
@Component({
  selector: 'app-editable-cell-renderer',
  template: `
    <div class="editable-cell" [class.editing]="isEditing">
      <span 
        *ngIf="!isEditing"
        class="display-value"
        (dblclick)="startEditing()">
        {{ displayValue }}
      </span>
      
      <input 
        *ngIf="isEditing"
        #editInput
        class="edit-input"
        [value]="editValue"
        (blur)="stopEditing()"
        (keydown.enter)="stopEditing()"
        (keydown.escape)="cancelEditing()"
        (input)="onInputChange($event)">
        
      <div class="edit-controls" *ngIf="isEditing">
        <button class="save-btn" (click)="saveChanges()">✓</button>
        <button class="cancel-btn" (click)="cancelEditing()">✗</button>
      </div>
    </div>
  `,
  styles: [`
    .editable-cell {
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 8px;
    }
    
    .display-value {
      cursor: pointer;
      flex: 1;
    }
    
    .display-value:hover {
      background-color: rgba(0, 123, 255, 0.1);
      border-radius: 2px;
    }
    
    .edit-input {
      flex: 1;
      border: 1px solid #007bff;
      border-radius: 2px;
      padding: 2px 4px;
      font-size: inherit;
      outline: none;
    }
    
    .edit-controls {
      display: flex;
      gap: 2px;
      margin-left: 4px;
    }
    
    .save-btn, .cancel-btn {
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .save-btn {
      background: #28a745;
      color: white;
    }
    
    .cancel-btn {
      background: #dc3545;
      color: white;
    }
  `]
})
export class EditableCellRendererComponent implements ICellRendererAngularComp, AfterViewInit {
  @ViewChild('editInput') editInputRef!: ElementRef<HTMLInputElement>;
  
  params: any;
  isEditing = false;
  displayValue = '';
  editValue = '';
  originalValue: any;

  agInit(params: any): void {
    this.params = params;
    this.originalValue = params.value;
    this.displayValue = this.formatDisplayValue(params.value);
    this.editValue = params.value || '';
  }

  ngAfterViewInit(): void {
    // Auto-focus input when editing starts
    if (this.isEditing && this.editInputRef) {
      this.editInputRef.nativeElement.focus();
      this.editInputRef.nativeElement.select();
    }
  }

  refresh(params: any): boolean {
    this.params = params;
    if (!this.isEditing) {
      this.originalValue = params.value;
      this.displayValue = this.formatDisplayValue(params.value);
      this.editValue = params.value || '';
    }
    return true;
  }

  startEditing(): void {
    this.isEditing = true;
    this.editValue = this.originalValue || '';
    
    // Focus input on next tick
    setTimeout(() => {
      if (this.editInputRef) {
        this.editInputRef.nativeElement.focus();
        this.editInputRef.nativeElement.select();
      }
    });
  }

  stopEditing(): void {
    if (!this.isEditing) return;
    
    this.saveChanges();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editValue = this.originalValue || '';
  }

  saveChanges(): void {
    this.isEditing = false;
    
    if (this.editValue !== this.originalValue) {
      this.originalValue = this.editValue;
      this.displayValue = this.formatDisplayValue(this.editValue);
      
      // Update the grid data
      this.params.node.setDataValue(this.params.colDef.field, this.editValue);
      
      // Notify parent component
      if (this.params.context?.componentParent?.onCellValueChanged) {
        this.params.context.componentParent.onCellValueChanged({
          field: this.params.colDef.field,
          newValue: this.editValue,
          oldValue: this.originalValue,
          data: this.params.data
        });
      }
    }
  }

  onInputChange(event: any): void {
    this.editValue = event.target.value;
  }

  private formatDisplayValue(value: any): string {
    if (value == null) return '';
    
    // Add custom formatting based on column type
    const columnType = this.params.colDef.type;
    
    switch (columnType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return value.toString();
    }
  }
}
```

## Conditional Cell Rendering

### Dynamic Renderer Selection

```typescript
export class ConditionalRenderingComponent {
  frameworkComponents = {
    statusRenderer: StatusCellRendererComponent,
    progressRenderer: ProgressCellRendererComponent,
    actionRenderer: ActionButtonsRendererComponent,
    chartRenderer: ChartCellRendererComponent
  };

  columnDefs = [
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: this.getStatusRenderer,
      cellRendererParams: this.getStatusRendererParams
    },
    {
      field: 'value',
      headerName: 'Value',
      cellRenderer: this.getValueRenderer,
      cellRendererParams: this.getValueRendererParams
    }
  ];

  private getStatusRenderer = (params: any): string => {
    const status = params.value;
    
    switch (status) {
      case 'active':
      case 'inactive':
      case 'pending':
        return 'statusRenderer';
      case 'loading':
        return 'progressRenderer';
      default:
        return undefined; // Use default renderer
    }
  };

  private getStatusRendererParams = (params: any): any => {
    const status = params.value;
    
    const baseParams = {
      context: { componentParent: this }
    };

    switch (status) {
      case 'loading':
        return {
          ...baseParams,
          showPercentage: false,
          indeterminate: true
        };
      default:
        return baseParams;
    }
  };

  private getValueRenderer = (params: any): string => {
    const value = params.value;
    const dataType = typeof value;
    
    if (Array.isArray(value)) {
      return 'chartRenderer';
    } else if (dataType === 'number' && value >= 0 && value <= 1) {
      return 'progressRenderer';
    } else {
      return undefined; // Use default renderer
    }
  };

  private getValueRendererParams = (params: any): any => {
    const value = params.value;
    
    if (Array.isArray(value)) {
      return {
        chartType: 'line',
        showLabels: false
      };
    } else if (typeof value === 'number') {
      return {
        showPercentage: true,
        colorScheme: 'green'
      };
    }
    
    return {};
  };
}
```

## Cell Renderer Performance

### Optimized Rendering

```typescript
export class OptimizedCellRenderingComponent {
  private rendererCache = new Map<string, any>();

  columnDefs = [
    {
      field: 'complexData',
      headerName: 'Complex Data',
      cellRenderer: this.getCachedRenderer,
      cellRendererParams: {
        suppressRefresh: true // Prevent unnecessary re-renders
      }
    }
  ];

  private getCachedRenderer = (params: any): string => {
    const cacheKey = this.generateCacheKey(params);
    
    if (this.rendererCache.has(cacheKey)) {
      return this.rendererCache.get(cacheKey);
    }

    const renderer = this.computeRenderer(params);
    this.rendererCache.set(cacheKey, renderer);
    
    return renderer;
  };

  private generateCacheKey(params: any): string {
    return `${params.value}-${params.data.type}-${params.node.rowIndex}`;
  }

  private computeRenderer(params: any): string {
    // Expensive computation here
    const value = params.value;
    const type = params.data.type;
    
    if (type === 'chart' && Array.isArray(value)) {
      return 'chartRenderer';
    } else if (type === 'progress' && typeof value === 'number') {
      return 'progressRenderer';
    }
    
    return 'defaultRenderer';
  }

  // Clean up cache periodically
  ngOnDestroy(): void {
    this.rendererCache.clear();
  }
}
```

## API Reference

### Cell Renderer Interface

```typescript
interface ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void;
  refresh(params: ICellRendererParams): boolean;
}

interface ICellRendererParams {
  value: any;
  data: any;
  node: RowNode;
  column: Column;
  colDef: ColDef;
  context: any;
  api: GridApi;
  columnApi: ColumnApi;
  refreshCell: () => void;
}
```

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `cellRenderer` | string \| Component \| function | Cell renderer |
| `cellRendererParams` | object \| function | Renderer parameters |
| `cellClass` | string \| function | CSS class for cell |
| `cellStyle` | object \| function | Inline styles for cell |

## Best Practices

1. **Use appropriate renderer types** for different data types
2. **Implement refresh() method** correctly for dynamic content
3. **Cache expensive computations** to improve performance
4. **Handle null/undefined values** gracefully
5. **Keep renderers lightweight** to maintain grid performance
6. **Test with large datasets** to ensure scalability
7. **Use OnPush change detection** for Angular components
8. **Clean up resources** in component destroy methods