# Row Height

## Overview

Row height management in BLG Grid provides flexible control over individual row heights, including fixed heights, dynamic heights based on content, auto-sizing, and responsive behavior. This feature is essential for accommodating varying content sizes and creating optimal layouts.

## Use Cases

- Auto-sizing rows based on content length
- Fixed row heights for consistent appearance
- Dynamic row heights for expandable content
- Responsive row sizing for different screen sizes
- Performance optimization for large datasets

## Basic Row Height Configuration

### Fixed Row Height

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [rowHeight]="40">
    </blg-grid>
  `
})
export class FixedRowHeightComponent {
  columnDefs = [
    { field: 'name', headerName: 'Name' },
    { field: 'description', headerName: 'Description' },
    { field: 'status', headerName: 'Status' }
  ];

  rowData = [
    { name: 'Item 1', description: 'Short description', status: 'Active' },
    { name: 'Item 2', description: 'Much longer description that might wrap', status: 'Pending' }
  ];
}
```

### Dynamic Row Height

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [getRowHeight]="getRowHeight.bind(this)">
    </blg-grid>
  `
})
export class DynamicRowHeightComponent {
  getRowHeight(params: any): number | null {
    const data = params.data;
    
    // Different heights based on row type
    if (data.type === 'header') {
      return 60;
    } else if (data.type === 'summary') {
      return 50;
    } else if (data.expanded) {
      return 120; // Expanded rows are taller
    }
    
    return 35; // Default height
  }

  columnDefs = [
    { field: 'name', headerName: 'Name' },
    { field: 'description', headerName: 'Description', wrapText: true },
    { field: 'details', headerName: 'Details', wrapText: true }
  ];

  rowData = [
    {
      name: 'Header Row',
      type: 'header',
      description: 'This is a header row',
      details: ''
    },
    {
      name: 'Regular Item',
      type: 'regular',
      expanded: false,
      description: 'Regular item with standard height',
      details: 'Standard details'
    },
    {
      name: 'Expanded Item',
      type: 'regular',
      expanded: true,
      description: 'This item is expanded and shows more content. The row height adjusts to accommodate the additional information that needs to be displayed.',
      details: 'Detailed information about this expanded item including multiple lines of text and additional data points.'
    }
  ];
}
```

## Auto-Height Rows

### Content-Based Auto Height

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'"
      [suppressHorizontalScroll]="true">
    </blg-grid>
  `
})
export class AutoHeightRowsComponent {
  columnDefs = [
    { 
      field: 'title', 
      headerName: 'Title',
      width: 200
    },
    { 
      field: 'content', 
      headerName: 'Content',
      autoHeight: true,
      wrapText: true,
      cellStyle: { 
        'white-space': 'pre-wrap',
        'line-height': '1.5'
      }
    },
    { 
      field: 'category', 
      headerName: 'Category',
      width: 150
    }
  ];

  rowData = [
    {
      title: 'Short Content',
      content: 'This is a short piece of content.',
      category: 'Type A'
    },
    {
      title: 'Long Content',
      content: 'This is a much longer piece of content that will require multiple lines to display properly. The row height will automatically adjust to accommodate all this text content without truncation. This demonstrates the auto-height feature working with varying content lengths.',
      category: 'Type B'
    },
    {
      title: 'Multi-line Content',
      content: 'Line 1: First line of content\nLine 2: Second line with more information\nLine 3: Third line with additional details\nLine 4: Final line of the multi-line content',
      category: 'Type C'
    }
  ];
}
```

### Cell-Specific Auto Height

```typescript
export class CellSpecificAutoHeightComponent {
  columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    {
      field: 'notes',
      headerName: 'Notes',
      autoHeight: true,
      wrapText: true,
      width: 300,
      cellRenderer: this.notesRenderer.bind(this)
    },
    { field: 'status', headerName: 'Status', width: 100 }
  ];

  private notesRenderer(params: any): string {
    const notes = params.value || '';
    
    // Render with proper line breaks
    return `<div style="white-space: pre-wrap; line-height: 1.4; padding: 8px 0;">${notes}</div>`;
  }

  // Trigger row height recalculation
  onDataChanged(): void {
    // Recalculate row heights after data changes
    setTimeout(() => {
      this.gridApi.resetRowHeights();
    }, 100);
  }

  onCellValueChanged(event: any): void {
    // Recalculate height for specific row
    setTimeout(() => {
      this.gridApi.resetRowHeights([event.node]);
    }, 50);
  }
}
```

## Responsive Row Heights

### Screen Size-Based Heights

```typescript
export class ResponsiveRowHeightComponent {
  private currentRowHeight: number = 40;

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateRowHeight();
  }

  getRowHeight(): number {
    return this.currentRowHeight;
  }

  ngOnInit(): void {
    this.updateRowHeight();
  }

  private updateRowHeight(): void {
    const width = window.innerWidth;
    
    if (width < 768) {
      this.currentRowHeight = 50; // Taller rows on mobile
    } else if (width < 1024) {
      this.currentRowHeight = 45; // Medium height on tablet
    } else {
      this.currentRowHeight = 40; // Standard height on desktop
    }

    // Update grid if it's already initialized
    if (this.gridApi) {
      this.gridApi.resetRowHeights();
    }
  }

  columnDefs = [
    {
      field: 'name',
      headerName: 'Name',
      cellStyle: this.getResponsiveCellStyle.bind(this)
    },
    {
      field: 'description',
      headerName: 'Description',
      wrapText: window.innerWidth < 768, // Only wrap on mobile
      cellStyle: this.getResponsiveCellStyle.bind(this)
    }
  ];

  private getResponsiveCellStyle(): any {
    const fontSize = window.innerWidth < 768 ? '14px' : '13px';
    const padding = window.innerWidth < 768 ? '8px' : '4px';
    
    return {
      fontSize,
      padding: `${padding} 8px`
    };
  }
}
```

### Content-Aware Responsive Heights

```typescript
export class ContentAwareResponsiveComponent {
  getRowHeight(params: any): number {
    const data = params.data;
    const screenWidth = window.innerWidth;
    
    // Base height calculation
    let baseHeight = screenWidth < 768 ? 45 : 35;
    
    // Adjust based on content
    if (data.description) {
      const contentLength = data.description.length;
      const charsPerLine = this.getCharsPerLine(screenWidth);
      const estimatedLines = Math.ceil(contentLength / charsPerLine);
      
      if (estimatedLines > 1) {
        baseHeight += (estimatedLines - 1) * 20;
      }
    }
    
    // Add extra height for special content types
    if (data.hasImage) {
      baseHeight += 60;
    }
    
    if (data.hasTags && data.tags?.length > 0) {
      baseHeight += 25;
    }
    
    return Math.min(baseHeight, 200); // Cap maximum height
  }

  private getCharsPerLine(screenWidth: number): number {
    if (screenWidth < 768) return 30;
    if (screenWidth < 1024) return 50;
    return 70;
  }

  columnDefs = [
    { field: 'title', headerName: 'Title' },
    {
      field: 'description',
      headerName: 'Description',
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'tags',
      headerName: 'Tags',
      cellRenderer: this.tagsRenderer.bind(this)
    }
  ];

  private tagsRenderer(params: any): string {
    const tags = params.value || [];
    if (tags.length === 0) return '';
    
    return tags.map((tag: string) => 
      `<span class="tag-badge">${tag}</span>`
    ).join(' ');
  }
}
```

## Row Height Animation

### Smooth Height Transitions

```typescript
export class AnimatedRowHeightComponent {
  private animationDuration = 300; // ms

  columnDefs = [
    { field: 'name', headerName: 'Name' },
    {
      field: 'content',
      headerName: 'Content',
      cellRenderer: 'expandableContentRenderer',
      autoHeight: true,
      wrapText: true
    },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: 'actionButtonsRenderer',
      width: 150
    }
  ];

  frameworkComponents = {
    expandableContentRenderer: ExpandableContentRendererComponent,
    actionButtonsRenderer: ActionButtonsRendererComponent
  };

  toggleRowExpansion(rowIndex: number): void {
    const rowNode = this.gridApi.getRowNode(rowIndex.toString());
    if (!rowNode) return;

    // Toggle expansion state
    rowNode.data.expanded = !rowNode.data.expanded;
    
    // Animate height change
    this.animateRowHeight(rowNode);
  }

  private animateRowHeight(rowNode: any): void {
    const currentHeight = rowNode.rowHeight || this.getDefaultRowHeight();
    const targetHeight = this.calculateNewHeight(rowNode);
    
    this.animateHeight(currentHeight, targetHeight, (height: number) => {
      rowNode.setRowHeight(height);
      this.gridApi.onRowHeightChanged();
    });
  }

  private animateHeight(from: number, to: number, callback: (height: number) => void): void {
    const startTime = performance.now();
    const diff = to - from;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.animationDuration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentHeight = from + (diff * easeOut);
      
      callback(Math.round(currentHeight));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private calculateNewHeight(rowNode: any): number {
    return rowNode.data.expanded ? 120 : 40;
  }
}
```

## Performance Optimization

### Virtual Row Heights

```typescript
export class VirtualRowHeightsComponent {
  private heightCache = new Map<string, number>();
  private defaultHeight = 35;

  gridOptions = {
    // Enable row height caching for better performance
    cacheQuickFilter: true,
    suppressRowTransform: false,
    
    // Optimize for large datasets
    rowBuffer: 10,
    rowSelection: 'multiple'
  };

  getRowHeight(params: any): number {
    const rowId = params.node.id || params.node.rowIndex?.toString();
    
    // Check cache first
    if (this.heightCache.has(rowId)) {
      return this.heightCache.get(rowId)!;
    }

    // Calculate height
    const height = this.calculateRowHeight(params.data);
    
    // Cache the result
    this.heightCache.set(rowId, height);
    
    return height;
  }

  private calculateRowHeight(data: any): number {
    if (!data) return this.defaultHeight;

    let height = this.defaultHeight;
    
    // Add height for content
    if (data.description) {
      const lines = Math.ceil(data.description.length / 60);
      height += (lines - 1) * 15;
    }
    
    // Add height for special elements
    if (data.hasSubItems) height += 30;
    if (data.showMetadata) height += 25;
    
    return Math.min(height, 150); // Cap max height
  }

  onDataChanged(): void {
    // Clear cache when data changes
    this.heightCache.clear();
    this.gridApi.resetRowHeights();
  }

  // Batch height updates for better performance
  updateRowHeights(rowNodes: any[]): void {
    // Clear cached heights for updated rows
    rowNodes.forEach(node => {
      const rowId = node.id || node.rowIndex?.toString();
      this.heightCache.delete(rowId);
    });

    // Batch update
    this.gridApi.resetRowHeights(rowNodes);
  }
}
```

### Efficient Height Calculation

```typescript
export class EfficientHeightCalculationComponent {
  private measurementCache = new Map<string, number>();
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    // Create off-screen canvas for text measurement
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  getRowHeight(params: any): number {
    const data = params.data;
    if (!data) return 35;

    // Create cache key based on content
    const cacheKey = this.createCacheKey(data);
    
    if (this.measurementCache.has(cacheKey)) {
      return this.measurementCache.get(cacheKey)!;
    }

    const height = this.calculateOptimalHeight(data);
    this.measurementCache.set(cacheKey, height);
    
    return height;
  }

  private createCacheKey(data: any): string {
    // Create a hash of the content that affects height
    const contentHash = [
      data.title?.length || 0,
      data.description?.length || 0,
      data.tags?.length || 0,
      data.type || 'default'
    ].join('|');
    
    return contentHash;
  }

  private calculateOptimalHeight(data: any): number {
    let totalHeight = 20; // Base padding

    // Measure text height
    if (data.description) {
      const textHeight = this.measureTextHeight(data.description, '13px Arial', 300);
      totalHeight += textHeight;
    }

    // Add height for other elements
    if (data.tags && data.tags.length > 0) {
      totalHeight += 25; // Tag row
    }

    if (data.metadata) {
      totalHeight += 20; // Metadata row
    }

    return Math.max(totalHeight, 35); // Minimum height
  }

  private measureTextHeight(text: string, font: string, maxWidth: number): number {
    this.context.font = font;
    
    const words = text.split(' ');
    let lines = 1;
    let currentLineWidth = 0;
    
    for (const word of words) {
      const wordWidth = this.context.measureText(word + ' ').width;
      
      if (currentLineWidth + wordWidth > maxWidth) {
        lines++;
        currentLineWidth = wordWidth;
      } else {
        currentLineWidth += wordWidth;
      }
    }
    
    return lines * 16; // Line height
  }

  // Periodic cache cleanup
  cleanupCache(): void {
    if (this.measurementCache.size > 1000) {
      this.measurementCache.clear();
    }
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `rowHeight` | number | Fixed row height in pixels |
| `getRowHeight` | function | Dynamic row height function |
| `domLayout` | 'normal' \| 'autoHeight' | Layout mode |
| `suppressHorizontalScroll` | boolean | Disable horizontal scrolling |

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `autoHeight` | boolean | Auto-size row height for this column |
| `wrapText` | boolean | Allow text wrapping in cells |
| `cellStyle` | object \| function | Cell styling options |

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `resetRowHeights()` | `rowNodes?: RowNode[]` | Recalculate row heights |
| `setRowHeight()` | `rowIndex: number, height: number` | Set specific row height |
| `onRowHeightChanged()` | - | Notify grid of height changes |

### getRowHeight Function Parameters

```typescript
interface GetRowHeightParams {
  node: RowNode;
  data: any;
  api: GridApi;
  context: any;
}
```

## Common Patterns

### Expandable Rows

```typescript
export class ExpandableRowsComponent {
  rowData = [
    {
      id: 1,
      title: 'Project Alpha',
      summary: 'AI-powered analytics platform',
      details: 'Comprehensive details about Project Alpha including technical specifications, team members, timeline, and deliverables.',
      expanded: false
    }
  ];

  getRowHeight(params: any): number {
    return params.data.expanded ? 150 : 50;
  }

  columnDefs = [
    {
      field: 'title',
      headerName: 'Project',
      cellRenderer: this.expandableCellRenderer.bind(this)
    },
    { field: 'summary', headerName: 'Summary' },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: this.actionsRenderer.bind(this)
    }
  ];

  private expandableCellRenderer(params: any): string {
    const data = params.data;
    const icon = data.expanded ? '▼' : '▶';
    
    return `
      <div class="expandable-cell">
        <button 
          class="expand-button" 
          onclick="this.toggleExpand(${data.id})">
          ${icon}
        </button>
        <div class="cell-content">
          <div class="title">${data.title}</div>
          ${data.expanded ? `<div class="details">${data.details}</div>` : ''}
        </div>
      </div>
    `;
  }

  toggleExpand = (id: number): void => {
    const rowNode = this.gridApi.getRowNode(id.toString());
    if (rowNode) {
      rowNode.data.expanded = !rowNode.data.expanded;
      this.gridApi.refreshCells({ rowNodes: [rowNode] });
      this.gridApi.resetRowHeights([rowNode]);
    }
  };
}
```

### Dynamic Content Loading

```typescript
export class DynamicContentRowsComponent {
  loadingRows = new Set<string>();

  getRowHeight(params: any): number {
    const data = params.data;
    
    if (data.loading) return 80; // Loading spinner height
    if (data.error) return 100;  // Error message height
    if (data.content) {
      return Math.min(50 + (data.content.length / 10), 200);
    }
    
    return 40; // Default height
  }

  loadRowContent(rowId: string): void {
    if (this.loadingRows.has(rowId)) return;
    
    this.loadingRows.add(rowId);
    const rowNode = this.gridApi.getRowNode(rowId);
    
    if (rowNode) {
      rowNode.data.loading = true;
      this.gridApi.refreshCells({ rowNodes: [rowNode] });
      this.gridApi.resetRowHeights([rowNode]);
      
      // Simulate async content loading
      setTimeout(() => {
        rowNode.data.loading = false;
        rowNode.data.content = 'Dynamically loaded content that can be of varying lengths...';
        this.loadingRows.delete(rowId);
        
        this.gridApi.refreshCells({ rowNodes: [rowNode] });
        this.gridApi.resetRowHeights([rowNode]);
      }, 1000);
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Heights not updating**: Call `resetRowHeights()` after data changes
2. **Performance issues**: Implement height caching for large datasets
3. **Text not wrapping**: Ensure `wrapText: true` and appropriate cell styles
4. **Inconsistent heights**: Check if `getRowHeight` function is deterministic

### Debugging Row Heights

```typescript
export class RowHeightDebugger {
  debugRowHeights(): void {
    console.group('Row Height Debug');
    
    this.gridApi.forEachNode((node, index) => {
      const height = node.rowHeight || 'default';
      const data = node.data;
      
      console.log(`Row ${index}:`, {
        height,
        hasAutoHeight: this.hasAutoHeightColumns(),
        dataKeys: data ? Object.keys(data) : [],
        nodeId: node.id
      });
    });
    
    console.groupEnd();
  }

  private hasAutoHeightColumns(): boolean {
    const columns = this.columnApi.getAllColumns() || [];
    return columns.some(col => col.getColDef().autoHeight);
  }

  validateRowHeights(): boolean {
    let hasIssues = false;
    
    this.gridApi.forEachNode((node) => {
      const height = node.rowHeight;
      
      if (height && (height < 20 || height > 500)) {
        console.warn(`Unusual row height for node ${node.id}:`, height);
        hasIssues = true;
      }
    });
    
    return !hasIssues;
  }
}
```

## Best Practices

1. **Use consistent heights** when possible for better performance
2. **Cache height calculations** for expensive computations
3. **Set reasonable height limits** to prevent extremely tall rows
4. **Test with varying content lengths** to ensure proper sizing
5. **Consider responsive design** with appropriate heights for different screen sizes
6. **Optimize auto-height calculations** for better performance
7. **Provide visual feedback** during height changes with animations
8. **Handle edge cases** like empty or null content gracefully