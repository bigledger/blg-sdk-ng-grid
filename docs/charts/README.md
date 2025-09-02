# BLG Charts Documentation

Welcome to **BLG Charts** - the most advanced Angular charting library featuring both stunning 2D visualizations and interactive 3D charts powered by WebGL.

## 📊 Overview

![BLG Charts Showcase](../images/charts-overview.png)

BLG Charts transforms your data into compelling visual stories with:

- **20+ Chart Types** - From basic line charts to advanced 3D surfaces
- **Interactive 3D** - WebGL-powered 3D charts with real-time rotation and zoom
- **Real-time Data** - Live streaming data support with smooth animations
- **High Performance** - Handle millions of data points efficiently
- **Angular Native** - Built with Angular Signals for optimal integration

## 🚀 Quick Start

Get your first chart running in under 10 minutes:

```bash
# Install BLG Charts
npm install @blg/charts

# Or install the complete UI Kit
npm install @blg/ui-kit
```

```typescript
// app.component.ts
import { BlgChartsComponent } from '@blg/charts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgChartsComponent],
  template: `
    <blg-chart [data]="chartData" 
               type="line3d"
               [config]="chartConfig">
    </blg-chart>
  `
})
export class AppComponent {
  chartData = [
    { x: 1, y: 10, z: 5 },
    { x: 2, y: 20, z: 10 },
    { x: 3, y: 15, z: 8 }
  ];
  
  chartConfig = {
    title: 'My 3D Chart',
    animation: { enabled: true },
    interaction: { rotation: true }
  };
}
```

**Result**: A beautiful 3D line chart with interactive rotation!

## 📈 Chart Types

### 2D Charts
- **Line Charts** - Single/multi-series with animations
- **Bar Charts** - Vertical, horizontal, stacked
- **Area Charts** - Filled areas with gradients  
- **Pie Charts** - Traditional and donut variants
- **Scatter Plots** - Bubble charts with sizing
- **Heatmaps** - Intensity visualization
- **Candlestick** - Financial OHLC charts
- **Radar Charts** - Multi-dimensional data

### 3D Charts (WebGL)
- **3D Line** - Multi-dimensional line series
- **3D Surface** - Mathematical surface plots
- **3D Bar** - Three-dimensional bar charts
- **3D Scatter** - Point clouds in 3D space
- **3D Mesh** - Complex mesh visualizations
- **3D Volume** - Volumetric data rendering

## ✨ Key Features

### 🎯 **Real-time Data Streaming**
```typescript
// Live data updates
chart.streamData(newDataPoint);
chart.startStreaming({ interval: 100 });
```

### 🎨 **Rich Theming System**
- Built-in themes (light, dark, corporate)
- Custom CSS variables
- Per-chart styling
- Animation themes

### 🎮 **Interactive Controls**
- Zoom and pan
- 3D rotation and tilting
- Data point selection
- Legend toggling
- Tooltip customization

### ⚡ **High Performance**
- WebGL acceleration for 3D
- Canvas rendering for 2D
- Data virtualization
- Smooth 60fps animations

## 📚 Documentation Sections

### 🎯 Getting Started
- **[Quick Start](./getting-started/quick-start.md)** - Your first chart in 10 minutes
- **[Installation](./getting-started/installation.md)** - Setup and configuration
- **[Basic Examples](./getting-started/basic-examples.md)** - Simple chart implementations

### ⚙️ Features & Guides
- **[2D Charts](./features/2d-charts/)** - Traditional chart types and configuration
- **[3D Charts](./features/3d-charts/)** - WebGL 3D visualization capabilities
- **[Real-time Data](./features/real-time-data.md)** - Live streaming and updates
- **[Theming](./features/theming.md)** - Visual customization and styling
- **[Interactions](./features/interactions.md)** - User interaction and events
- **[Performance](./features/performance.md)** - Optimization for large datasets
- **[Animations](./features/animations.md)** - Smooth transitions and effects

### 🔧 API Reference
- **[Chart Component](./api/chart-component.md)** - Main chart component API
- **[Chart Configuration](./api/chart-config.md)** - Configuration options
- **[Data Format](./api/data-format.md)** - Supported data structures
- **[Events](./api/events.md)** - Chart events and callbacks
- **[Themes API](./api/themes.md)** - Theming system API

### 💡 Examples & Demos
- **[2D Examples](./examples/2d/)** - Traditional chart examples
- **[3D Examples](./examples/3d/)** - WebGL 3D chart examples
- **[Real-time Examples](./examples/real-time/)** - Live data streaming
- **[Advanced Examples](./examples/advanced/)** - Complex visualizations
- **[Integration Examples](./examples/integration/)** - Using with Grid, Export, etc.

## 🎮 Live Examples

Try these interactive examples:

| Chart Type | Description | Live Demo |
|------------|-------------|-----------|
| **3D Surface** | Mathematical surface plot | [StackBlitz](https://stackblitz.com/edit/blg-charts-3d-surface) |
| **Real-time Line** | Live streaming data | [StackBlitz](https://stackblitz.com/edit/blg-charts-realtime) |
| **Financial Dashboard** | Multiple chart types | [StackBlitz](https://stackblitz.com/edit/blg-charts-financial) |
| **3D Scatter Plot** | Interactive 3D points | [StackBlitz](https://stackblitz.com/edit/blg-charts-3d-scatter) |
| **Animated Bar Race** | Animated competitions | [StackBlitz](https://stackblitz.com/edit/blg-charts-bar-race) |

## 🏗️ Architecture

BLG Charts consists of modular packages:

- **`@blg/charts-core`** - Core charting engine and interfaces
- **`@blg/charts-2d`** - Traditional 2D chart types  
- **`@blg/charts-3d`** - WebGL 3D rendering engine
- **`@blg/charts-streaming`** - Real-time data streaming
- **`@blg/charts-themes`** - Theming and styling system

## 📊 Performance Metrics

- **2D Charts**: Up to 100k data points at 60fps
- **3D Charts**: Up to 10k points with smooth interaction
- **Real-time**: 1000+ updates per second
- **Bundle Size**: ~80KB gzipped (2D), ~120KB (with 3D)
- **Memory**: Efficient garbage collection and cleanup

## 🌐 Browser Support

- **Chrome**: 90+ (recommended for 3D)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **WebGL**: Required for 3D charts

## 🚀 What's Next?

### Roadmap (v2.1.0)
- 🚧 **Machine Learning Integration** - Built-in ML insights
- 🚧 **AR/VR Support** - Immersive 3D visualization
- 🚧 **Advanced Animations** - Physics-based animations
- 🚧 **Custom Shaders** - WebGL shader customization
- 🚧 **Data Analytics** - Built-in statistical analysis

### Integration Examples
```typescript
// With Grid component
<blg-grid [data]="salesData" 
          (selectionChanged)="updateChart($event)">
</blg-grid>

<blg-chart [data]="selectedData" 
           type="bar3d">
</blg-chart>

// With Export component
<blg-export [sources]="[chart]" 
            formats="['png', 'pdf', 'svg']">
</blg-export>
```

## 🆘 Support & Community

- **[GitHub Issues](https://github.com/bigledger/charts/issues)** - Bug reports and features
- **[Discord](https://discord.gg/bigledger-charts)** - Community discussions
- **[Examples Gallery](https://charts.bigledger.com/examples)** - Inspiration and templates
- **[API Playground](https://charts.bigledger.com/playground)** - Interactive API explorer

---

**Ready to visualize your data?** Start with our [Quick Start Guide](./getting-started/quick-start.md) and create your first chart in minutes!

**Want to see what's possible?** Explore our [3D Examples](./examples/3d/) or check out the [Live Demos](https://charts.bigledger.com).