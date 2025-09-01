# @ng-ui/charts-bi

A comprehensive Business Intelligence toolkit for Angular applications, built specifically for BigLedger Charts. This library provides enterprise-grade BI capabilities including interactive dashboards, advanced analytics, real-time data visualization, and powerful reporting features.

## 🎯 Key Features

### 📊 Interactive Dashboards
- **Drag-and-Drop Builder**: Intuitive dashboard creation with grid layout system
- **Real-Time Updates**: WebSocket support for live data streaming  
- **Cross-Chart Filtering**: Interactive filters that synchronize across all widgets
- **Drill-Down Navigation**: Multi-level data exploration with breadcrumb navigation
- **Responsive Design**: Adaptive layouts for desktop, tablet, and mobile

### 🤖 Advanced Analytics
- **Predictive Analytics**: Machine learning models for sales forecasting and trend prediction
- **Anomaly Detection**: Statistical and ML-based outlier detection with real-time alerts
- **Trend Analysis**: Advanced time series analysis with seasonal decomposition
- **What-If Scenarios**: Interactive scenario planning with parameter simulation
- **Comparative Analysis**: Period-over-period, cohort, and benchmark comparisons

### 📈 KPI Monitoring
- **Dynamic KPI Cards**: Customizable performance indicators with targets and thresholds
- **Scorecards**: Multi-category performance tracking with weighted scoring
- **Sparkline Trends**: Embedded micro-charts showing historical performance
- **Alert System**: Automated notifications for threshold breaches

### 🔄 Pivot Tables
- **Dynamic Pivoting**: Drag-and-drop dimensions and measures
- **Advanced Aggregations**: Sum, average, count, percentiles, and custom calculations
- **Conditional Formatting**: Data bars, color scales, and icon sets
- **Export Options**: Excel, CSV, PDF with full formatting preservation

### 🔌 Data Connectivity
- **REST APIs**: HTTP/HTTPS with authentication support
- **GraphQL**: Query optimization and schema introspection
- **WebSocket**: Real-time streaming data
- **File Import**: CSV, Excel with data type detection
- **Database Direct**: PostgreSQL, MySQL, SQL Server connections
- **BigQuery**: Google Cloud BigQuery integration

### 📤 Export & Reporting
- **PDF Reports**: Professional layouts with charts and tables
- **Excel Export**: Formatted spreadsheets with formulas
- **PowerPoint**: Dashboard embedding for presentations
- **Scheduled Reports**: Automated distribution via email
- **Custom Templates**: Branded report designs

## 🚀 Installation

```bash
npm install @ng-ui/charts-bi
```

## 📖 Quick Start

```typescript
import { NgModule } from '@angular/core';
import { ChartsBIModule } from '@ng-ui/charts-bi';

@NgModule({
  imports: [
    ChartsBIModule.forRoot({
      apiUrl: 'https://api.example.com',
      enableAnalytics: true,
      enableRealTime: true
    })
  ]
})
export class AppModule {}
```

Built with ❤️ by the BigLedger team for the Angular community.
