# Charts Getting Started Guide

Get up and running with BLG Charts in under 10 minutes. This guide will walk you through installation, basic setup, and creating your first chart.

## 📦 Installation

### Option 1: Install Charts Only
```bash
npm install @blg/charts
```

### Option 2: Install Complete UI Kit  
```bash
npm install @blg/ui-kit
```

### Option 3: Install with Specific Features
```bash
# Just 2D charts
npm install @blg/charts-2d

# Add 3D support
npm install @blg/charts-2d @blg/charts-3d

# Add real-time streaming
npm install @blg/charts @blg/charts-streaming
```

## 🔧 Angular Setup

### 1. Configure Your Angular Application

```typescript
// app.config.ts (Angular 17+ Standalone)
import { ApplicationConfig } from '@angular/core';
import { provideBlgCharts } from '@blg/charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBlgCharts({
      // Enable 3D charts (requires WebGL)
      webgl: true,
      
      // Performance settings
      performance: {
        virtualScrolling: true,
        webWorkers: true
      },
      
      // Default theme
      theme: 'modern-light'
    })
  ]
};
```

### 2. Import in Your Component

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { BlgChartComponent } from '@blg/charts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgChartComponent],
  template: `
    <div class="chart-container">
      <h2>My First BLG Chart</h2>
      <blg-chart 
        [data]="chartData"
        type="line"
        [config]="chartConfig">
      </blg-chart>
    </div>
  `,
  styles: [`
    .chart-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    blg-chart {
      height: 400px;
      display: block;
    }
  `]
})
export class AppComponent {
  // Your data
  chartData = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 78 },
    { label: 'Mar', value: 42 },
    { label: 'Apr', value: 89 },
    { label: 'May', value: 95 }
  ];

  // Chart configuration
  chartConfig = {
    title: 'Monthly Sales',
    xAxis: { title: 'Month' },
    yAxis: { title: 'Sales ($000)' },
    animation: { enabled: true }
  };
}
```

## 🎯 Your First Chart

### Basic Line Chart

```typescript
export class BasicLineChartComponent {
  data = [
    { x: 1, y: 10 },
    { x: 2, y: 25 },
    { x: 3, y: 18 },
    { x: 4, y: 32 },
    { x: 5, y: 28 }
  ];

  config = {
    type: 'line',
    title: 'Basic Line Chart',
    responsive: true
  };
}
```

```html
<blg-chart [data]="data" [config]="config"></blg-chart>
```

### Multi-Series Chart

```typescript
export class MultiSeriesChartComponent {
  data = [
    {
      label: 'Series 1',
      values: [
        { x: 'Q1', y: 20 },
        { x: 'Q2', y: 35 },
        { x: 'Q3', y: 25 },
        { x: 'Q4', y: 40 }
      ]
    },
    {
      label: 'Series 2',
      values: [
        { x: 'Q1', y: 15 },
        { x: 'Q2', y: 28 },
        { x: 'Q3', y: 32 },
        { x: 'Q4', y: 22 }
      ]
    }
  ];

  config = {
    type: 'bar',
    title: 'Quarterly Comparison',
    legend: { position: 'top' }
  };
}
```

## 🌟 3D Chart Example

```typescript
export class Chart3DComponent {
  data = [
    { x: 1, y: 10, z: 5 },
    { x: 2, y: 20, z: 10 },
    { x: 3, y: 15, z: 8 },
    { x: 4, y: 25, z: 12 },
    { x: 5, y: 18, z: 7 }
  ];

  config = {
    type: 'line3d',
    title: 'My First 3D Chart',
    interaction: {
      rotation: true,
      zoom: true
    },
    camera: {
      position: { x: 0, y: 0, z: 100 },
      target: { x: 0, y: 0, z: 0 }
    }
  };
}
```

```html
<blg-chart [data]="data" [config]="config"></blg-chart>
```

## ⚡ Real-time Chart

```typescript
export class RealtimeChartComponent implements OnInit, OnDestroy {
  data: ChartDataPoint[] = [];
  private interval?: number;

  config = {
    type: 'line',
    title: 'Live Data Stream',
    realtime: {
      enabled: true,
      maxPoints: 50,
      updateInterval: 1000
    }
  };

  ngOnInit() {
    this.startStreaming();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  startStreaming() {
    this.interval = setInterval(() => {
      const newPoint = {
        x: Date.now(),
        y: Math.random() * 100
      };
      
      this.data = [...this.data, newPoint];
      
      // Keep only last 50 points
      if (this.data.length > 50) {
        this.data = this.data.slice(-50);
      }
    }, 1000);
  }
}
```

## 🎨 Styling Your Charts

### Using Built-in Themes

```typescript
// In your component
config = {
  theme: 'dark', // 'light', 'dark', 'corporate', 'vibrant'
  // ... other config
};
```

### Custom Styling with CSS Variables

```css
/* styles.css */
:root {
  --blg-chart-background: #1a1a1a;
  --blg-chart-text: #ffffff;
  --blg-chart-grid: #333333;
  --blg-chart-primary: #00aaff;
  --blg-chart-secondary: #ff6600;
}
```

### Component-Specific Styling

```scss
// component.scss
blg-chart {
  --chart-font-family: 'Roboto', sans-serif;
  --chart-border-radius: 8px;
  --chart-shadow: 0 4px 8px rgba(0,0,0,0.1);
  
  border-radius: var(--chart-border-radius);
  box-shadow: var(--chart-shadow);
}
```

## 📱 Responsive Design

```typescript
config = {
  responsive: true,
  maintainAspectRatio: false,
  breakpoints: {
    mobile: {
      legend: { position: 'bottom' },
      title: { fontSize: 14 }
    },
    tablet: {
      legend: { position: 'right' }
    }
  }
};
```

## ✅ Quick Start Checklist

- [ ] Install BLG Charts: `npm install @blg/charts`
- [ ] Configure Angular app with `provideBlgCharts()`
- [ ] Import `BlgChartComponent` in your component
- [ ] Prepare your data in supported format
- [ ] Create chart configuration object
- [ ] Add `<blg-chart>` to your template
- [ ] Test in browser and verify chart renders
- [ ] Explore different chart types and configurations

## 🚀 Next Steps

Now that you have your first chart working:

1. **[Explore Chart Types](./features/chart-types.md)** - Learn about all available chart types
2. **[Try 3D Charts](./features/3d-charts/)** - Create interactive 3D visualizations  
3. **[Add Real-time Data](./features/real-time-data.md)** - Stream live data to your charts
4. **[Customize Themes](./features/theming.md)** - Make charts match your brand
5. **[View Examples](./examples/)** - See real-world chart implementations

## ❓ Troubleshooting

### Chart Not Rendering
```typescript
// Make sure you have proper data format
data = [
  { x: 1, y: 10 }, // ✅ Correct
  // { label: 'A', value: 10 } // ❌ Wrong format for line chart
];
```

### 3D Charts Not Working
```bash
# Check WebGL support
console.log(!!window.WebGLRenderingContext);

# Ensure 3D features are enabled
provideBlgCharts({ webgl: true })
```

### Performance Issues
```typescript
config = {
  // Enable performance optimizations
  performance: {
    virtualScrolling: true,
    webWorkers: true,
    maxDataPoints: 10000
  }
};
```

## 💡 Tips for Success

1. **Start Simple** - Begin with basic charts, add complexity gradually
2. **Use TypeScript** - Leverage full type safety for configuration
3. **Test on Mobile** - Ensure responsive design works on all devices
4. **Performance First** - Use virtualization for large datasets
5. **Consistent Theming** - Apply consistent styling across all charts

---

**Congratulations!** You've successfully set up BLG Charts. Ready to create something amazing? Check out our [Chart Types Guide](./features/chart-types.md) or browse [Live Examples](./examples/).