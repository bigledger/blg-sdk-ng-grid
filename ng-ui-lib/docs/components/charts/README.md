# BLG Charts Component Suite

The BLG Charts component suite provides a comprehensive charting solution for Angular applications, featuring 2D/3D visualizations, animations, and business intelligence capabilities.

## 🚀 Features

### Chart Types
- **Line Charts** - Single/multi-series with various line styles
- **Bar Charts** - Vertical/horizontal bars with grouping and stacking
- **Area Charts** - Filled area charts with gradients
- **Pie/Donut Charts** - Circular data representation with customizable segments
- **Scatter Plots** - Point-based data visualization with trend lines
- **Bubble Charts** - Three-dimensional scatter plots
- **Radar Charts** - Multi-axis circular charts
- **Candlestick Charts** - Financial data visualization
- **Heat Maps** - Matrix-based data representation
- **Tree Maps** - Hierarchical data visualization

### 3D Visualizations
- **3D Bar Charts** - Three-dimensional bar representations
- **3D Surface Charts** - Continuous data surfaces
- **3D Scatter Plots** - Point clouds in 3D space
- **3D Pie Charts** - Extruded circular charts

### Interactive Features
- **Zoom & Pan** - Interactive data exploration
- **Tooltips** - Rich hover information
- **Legends** - Interactive legend controls
- **Crosshairs** - Precision data reading
- **Data Selection** - Click/drag selection
- **Real-time Updates** - Live data streaming

### Export Capabilities
- **PNG Export** - High-quality raster images
- **SVG Export** - Scalable vector graphics
- **PDF Export** - Publication-ready documents
- **Excel Export** - Chart data in spreadsheet format
- **JSON Export** - Raw chart configuration and data

## 🔧 Installation

### Basic Charts (2D)
```bash
npm install @ng-ui-lib/core @ng-ui-lib/charts-core @ng-ui-lib/charts-2d @ng-ui-lib/theme
```

### Full Chart Suite
```bash
npm install @ng-ui-lib/core @ng-ui-lib/charts-core @ng-ui-lib/charts-2d @ng-ui-lib/charts-3d @ng-ui-lib/charts-animations @ng-ui-lib/charts-bi @ng-ui-lib/theme
```

### Import Styles
```css
/* styles.css */
@import '@ng-ui-lib/theme/styles/default-theme.css';
@import '@ng-ui-lib/charts-core/styles/charts.css';
```

## 🎯 Quick Start

### Basic Line Chart

```typescript
import { Component } from '@angular/core';
import { Chart2D } from '@ng-ui-lib/charts-2d';
import { ChartConfig, ChartData } from '@ng-ui-lib/core';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [Chart2D],
  template: `
    <div class="chart-container">
      <ng-ui-lib-chart
        [type]="chartType"
        [data]="chartData"
        [config]="chartConfig"
        (chartClicked)="onChartClicked($event)"
        (dataPointHovered)="onDataPointHovered($event)"
        (chartExported)="onChartExported($event)">
      </ng-ui-lib-chart>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 400px;
      width: 100%;
      padding: 20px;
    }
  `]
})
export class SalesChartComponent {
  chartType = 'line';

  chartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales 2023',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, 45000],
        borderColor: '#007acc',
        backgroundColor: 'rgba(0, 122, 204, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Sales 2024',
        data: [15000, 22000, 18000, 28000, 25000, 33000, 31000, 38000, 35000, 43000, 41000, 48000],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  chartConfig: ChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      enabled: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    exportable: true,
    exportFormats: ['png', 'svg', 'pdf', 'excel'],
    interaction: {
      intersect: false,
      mode: 'index'
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Monthly Sales Comparison',
          font: { size: 18, weight: 'bold' },
          padding: { top: 10, bottom: 30 }
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: '#007acc',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Month',
            font: { size: 14, weight: 'bold' }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Sales Amount ($)',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: (value: any) => '$' + value.toLocaleString()
          }
        }
      }
    }
  };

  onChartClicked(event: any) {
    console.log('Chart clicked:', event);
  }

  onDataPointHovered(event: any) {
    console.log('Data point hovered:', event);
  }

  onChartExported(result: any) {
    console.log('Chart exported:', result);
  }
}
```

### Multi-Chart Dashboard

```typescript
import { Component } from '@angular/core';
import { Chart2D } from '@ng-ui-lib/charts-2d';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Chart2D],
  template: `
    <div class="dashboard-grid">
      <!-- Revenue Chart -->
      <div class="chart-card">
        <h3>Revenue Trend</h3>
        <ng-ui-lib-chart
          type="line"
          [data]="revenueData"
          [config]="lineConfig">
        </ng-ui-lib-chart>
      </div>

      <!-- Sales by Category -->
      <div class="chart-card">
        <h3>Sales by Category</h3>
        <ng-ui-lib-chart
          type="pie"
          [data]="categoryData"
          [config]="pieConfig">
        </ng-ui-lib-chart>
      </div>

      <!-- Monthly Performance -->
      <div class="chart-card">
        <h3>Monthly Performance</h3>
        <ng-ui-lib-chart
          type="bar"
          [data]="performanceData"
          [config]="barConfig">
        </ng-ui-lib-chart>
      </div>

      <!-- User Growth -->
      <div class="chart-card">
        <h3>User Growth</h3>
        <ng-ui-lib-chart
          type="area"
          [data]="userGrowthData"
          [config]="areaConfig">
        </ng-ui-lib-chart>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    
    .chart-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: 350px;
    }
    
    .chart-card h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  `]
})
export class DashboardComponent {
  revenueData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue',
      data: [250000, 320000, 290000, 380000],
      borderColor: '#007acc',
      backgroundColor: 'rgba(0, 122, 204, 0.1)'
    }]
  };

  categoryData = {
    labels: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
    datasets: [{
      data: [35, 25, 15, 15, 10],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
      ]
    }]
  };

  performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Target',
        data: [100, 100, 100, 100, 100, 100],
        backgroundColor: '#e9ecef'
      },
      {
        label: 'Actual',
        data: [85, 92, 105, 88, 110, 98],
        backgroundColor: '#28a745'
      }
    ]
  };

  userGrowthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'New Users',
      data: [150, 280, 320, 450],
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: '#FF6384'
    }]
  };

  lineConfig: ChartConfig = {
    responsive: true,
    maintainAspectRatio: false
  };

  pieConfig: ChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    options: {
      plugins: {
        legend: { position: 'right' }
      }
    }
  };

  barConfig: ChartConfig = {
    responsive: true,
    maintainAspectRatio: false
  };

  areaConfig: ChartConfig = {
    responsive: true,
    maintainAspectRatio: false
  };
}
```

## 📊 Chart Types

### Line Charts
```typescript
const lineChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [{
    label: 'Page Views',
    data: [120, 190, 130, 250, 200],
    borderColor: '#007acc',
    backgroundColor: 'transparent',
    borderWidth: 2,
    pointRadius: 4,
    pointBackgroundColor: '#007acc',
    tension: 0.3 // Curve smoothness
  }]
};

const lineConfig: ChartConfig = {
  type: 'line',
  options: {
    scales: {
      y: { beginAtZero: true }
    }
  }
};
```

### Bar Charts
```typescript
const barChartData = {
  labels: ['Product A', 'Product B', 'Product C', 'Product D'],
  datasets: [
    {
      label: 'Q1 Sales',
      data: [65, 59, 80, 81],
      backgroundColor: '#36A2EB'
    },
    {
      label: 'Q2 Sales', 
      data: [55, 69, 70, 91],
      backgroundColor: '#FF6384'
    }
  ]
};

const barConfig: ChartConfig = {
  type: 'bar',
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      x: { stacked: false }, // Set to true for stacked bars
      y: { stacked: false, beginAtZero: true }
    }
  }
};
```

### Pie Charts
```typescript
const pieChartData = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
  datasets: [{
    data: [300, 250, 100, 150, 75],
    backgroundColor: [
      '#FF6384',
      '#36A2EB', 
      '#FFCE56',
      '#4BC0C0',
      '#9966FF'
    ],
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
};

const pieConfig: ChartConfig = {
  type: 'pie',
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      }
    }
  }
};
```

### Scatter Plots
```typescript
const scatterData = {
  datasets: [{
    label: 'Dataset 1',
    data: [
      { x: 10, y: 20 },
      { x: 15, y: 25 },
      { x: 20, y: 30 },
      { x: 25, y: 28 }
    ],
    backgroundColor: '#FF6384',
    borderColor: '#FF6384',
    pointRadius: 6
  }]
};

const scatterConfig: ChartConfig = {
  type: 'scatter',
  options: {
    scales: {
      x: { 
        type: 'linear',
        position: 'bottom'
      },
      y: {
        beginAtZero: true
      }
    }
  }
};
```

## 🎪 3D Charts

### 3D Bar Chart
```typescript
import { Chart3D } from '@ng-ui-lib/charts-3d';

@Component({
  selector: 'app-3d-chart',
  imports: [Chart3D],
  template: `
    <ng-ui-lib-chart-3d
      type="bar3d"
      [data]="data3D"
      [config]="config3D">
    </ng-ui-lib-chart-3d>
  `
})
export class Chart3DComponent {
  data3D = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue',
      data: [120, 150, 180, 200],
      backgroundColor: '#007acc',
      depth: 20,
      height: (value: number) => value * 2
    }]
  };

  config3D: ChartConfig = {
    responsive: true,
    camera: {
      position: { x: 0, y: 50, z: 100 },
      rotation: { x: -0.5, y: 0.3, z: 0 }
    },
    lighting: {
      ambient: 0.4,
      directional: 0.8,
      position: { x: 10, y: 10, z: 10 }
    },
    interaction: {
      rotate: true,
      zoom: true,
      pan: true
    }
  };
}
```

## 📤 Export Features

### Image Export
```typescript
export class ChartComponent {
  exportToPNG() {
    this.chart.exportToPNG({
      filename: 'sales-chart.png',
      width: 1200,
      height: 600,
      quality: 1.0,
      backgroundColor: '#ffffff'
    });
  }

  exportToSVG() {
    this.chart.exportToSVG({
      filename: 'sales-chart.svg',
      width: 800,
      height: 400,
      preserveAspectRatio: true
    });
  }
}
```

### PDF Export
```typescript
exportToPDF() {
  this.chart.exportToPDF({
    filename: 'chart-report.pdf',
    title: 'Sales Analysis Report',
    pageSize: 'A4',
    orientation: 'landscape',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includeData: true,
    includeSummary: true,
    customTemplate: {
      header: 'Monthly Sales Report - {{date}}',
      footer: 'Company Confidential - Page {{page}}'
    }
  });
}
```

### Data Export
```typescript
exportToExcel() {
  this.chart.exportToExcel({
    filename: 'chart-data.xlsx',
    sheetName: 'Sales Data',
    includeChart: true,
    includeRawData: true,
    formatNumbers: true,
    customHeaders: ['Month', 'Revenue', 'Growth %']
  });
}

exportToJSON() {
  this.chart.exportToJSON({
    filename: 'chart-config.json',
    includeData: true,
    includeConfig: true,
    pretty: true
  });
}
```

## 🎬 Animations

### Built-in Animations
```typescript
const animationConfig: ChartConfig = {
  animation: {
    enabled: true,
    duration: 2000,
    easing: 'easeInOutQuart',
    delay: 100,
    loop: false,
    
    // Animation types
    animateIn: 'fadeIn', // 'fadeIn', 'slideUp', 'slideDown', 'zoomIn'
    animateUpdate: 'morph', // 'morph', 'slide', 'fade'
    animateOut: 'fadeOut',
    
    // Staggering
    stagger: {
      enabled: true,
      delay: 50 // Delay between elements
    }
  }
};
```

### Custom Animations
```typescript
import { ChartAnimations } from '@ng-ui-lib/charts-animations';

export class AnimatedChartComponent {
  customAnimation() {
    this.chart.animate({
      duration: 1500,
      easing: 'easeInOutCubic',
      keyframes: [
        { time: 0, opacity: 0, scale: 0.8 },
        { time: 0.5, opacity: 0.5, scale: 1.1 },
        { time: 1, opacity: 1, scale: 1 }
      ],
      onProgress: (progress: number) => {
        console.log('Animation progress:', progress);
      },
      onComplete: () => {
        console.log('Animation completed');
      }
    });
  }
}
```

## 📊 Real-time Data

### Live Data Updates
```typescript
import { interval } from 'rxjs';

export class RealtimeChartComponent {
  private dataPoints: number[] = [];
  
  ngOnInit() {
    // Update data every second
    interval(1000).subscribe(() => {
      this.addDataPoint();
    });
  }
  
  addDataPoint() {
    const newValue = Math.random() * 100;
    this.dataPoints.push(newValue);
    
    // Keep only last 20 points
    if (this.dataPoints.length > 20) {
      this.dataPoints.shift();
    }
    
    // Update chart
    this.updateChart();
  }
  
  updateChart() {
    this.chart.updateData({
      labels: Array.from({ length: this.dataPoints.length }, (_, i) => i),
      datasets: [{
        label: 'Real-time Data',
        data: this.dataPoints,
        borderColor: '#007acc',
        backgroundColor: 'rgba(0, 122, 204, 0.1)'
      }]
    }, {
      animation: {
        duration: 200 // Fast updates
      }
    });
  }
}
```

### WebSocket Integration
```typescript
import { WebSocketService } from './websocket.service';

export class WebSocketChartComponent {
  constructor(private ws: WebSocketService) {}
  
  ngOnInit() {
    this.ws.connect('ws://localhost:3001/data');
    
    this.ws.messages$.subscribe(data => {
      this.updateChartData(data);
    });
  }
  
  updateChartData(data: any) {
    this.chart.addData(data.value, data.label);
  }
}
```

## 🎨 Theming and Styling

### Built-in Themes
```typescript
const chartConfig: ChartConfig = {
  theme: 'default' | 'dark' | 'minimal' | 'colorful' | 'professional'
};
```

### Custom Color Schemes
```typescript
const customColors = {
  primary: '#007acc',
  secondary: '#28a745',
  accent: '#ffc107',
  background: '#ffffff',
  text: '#333333',
  grid: '#e9ecef',
  
  // Data colors
  palette: [
    '#007acc', '#28a745', '#dc3545', '#ffc107',
    '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'
  ]
};

const styledConfig: ChartConfig = {
  colors: customColors,
  options: {
    plugins: {
      legend: {
        labels: {
          color: customColors.text
        }
      }
    },
    scales: {
      x: {
        grid: { color: customColors.grid },
        ticks: { color: customColors.text }
      },
      y: {
        grid: { color: customColors.grid },
        ticks: { color: customColors.text }
      }
    }
  }
};
```

## 📱 Responsive Design

### Mobile Optimization
```typescript
const responsiveConfig: ChartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  
  // Breakpoint-specific configurations
  breakpoints: {
    mobile: {
      maxWidth: 768,
      config: {
        options: {
          plugins: {
            legend: { 
              display: false // Hide legend on mobile
            },
            tooltip: {
              displayColors: false,
              bodyFont: { size: 12 }
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                font: { size: 10 }
              }
            }
          }
        }
      }
    },
    
    tablet: {
      maxWidth: 1024,
      config: {
        options: {
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      }
    }
  }
};
```

## 🧪 Testing

### Component Testing
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart2D } from '@ng-ui-lib/charts-2d';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chart2D]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
  });

  it('should create chart', () => {
    component.data = {
      labels: ['A', 'B', 'C'],
      datasets: [{ data: [1, 2, 3] }]
    };
    fixture.detectChanges();
    
    expect(component.chart).toBeTruthy();
  });

  it('should handle data updates', () => {
    const newData = { labels: ['X', 'Y'], datasets: [{ data: [10, 20] }] };
    component.updateData(newData);
    
    expect(component.data).toEqual(newData);
  });
});
```

## 📚 API Reference

### Main Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `ChartType` | `'line'` | Chart type |
| `data` | `ChartData` | `{}` | Chart data |
| `config` | `ChartConfig` | `{}` | Chart configuration |
| `width` | `number` | `null` | Fixed width |
| `height` | `number` | `null` | Fixed height |
| `theme` | `string` | `'default'` | Chart theme |

### Events

| Event | Type | Description |
|-------|------|-------------|
| `chartClicked` | `ChartClickEvent` | Chart area clicked |
| `dataPointHovered` | `DataPointEvent` | Data point hovered |
| `legendToggled` | `LegendEvent` | Legend item toggled |
| `chartExported` | `ExportResult` | Chart export completed |
| `animationCompleted` | `AnimationEvent` | Animation finished |

### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `updateData` | `data: ChartData, options?: UpdateOptions` | `void` | Update chart data |
| `addData` | `value: any, label?: string` | `void` | Add single data point |
| `removeData` | `index: number` | `void` | Remove data point |
| `resetZoom` | - | `void` | Reset zoom level |
| `exportToPNG` | `options?: ImageExportOptions` | `Promise<Blob>` | Export as PNG |
| `exportToSVG` | `options?: SVGExportOptions` | `Promise<string>` | Export as SVG |
| `exportToPDF` | `options?: PDFExportOptions` | `Promise<Blob>` | Export as PDF |

## 🔗 Related Documentation

- **[Installation Guide](../../GETTING_STARTED.md)** - Getting started with BLG Charts
- **[Export Features](../../features/export/chart-export.md)** - Detailed export documentation
- **[Theming Guide](../../features/themes/)** - Custom theme creation
- **[API Reference](../../API_REFERENCE.md)** - Complete API documentation
- **[Examples](../../examples/chart-examples/)** - More examples and demos

## 🆘 Troubleshooting

### Common Issues

**Chart not rendering**
- Check that canvas is properly sized
- Verify data format is correct
- Ensure chart type is supported

**Performance issues with large datasets**
- Use data decimation for line charts
- Enable point radius optimization
- Consider data aggregation

**Export not working**
- Check browser compatibility
- Verify export format support
- Ensure proper dimensions

For more troubleshooting help, see the [Troubleshooting Guide](../../support/troubleshooting.md).