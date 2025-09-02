# Component Integration Examples

This section demonstrates how to integrate multiple BigLedger UI Kit components to create powerful, cohesive applications.

## 🔗 Integration Scenarios

### 1. Grid + Charts Dashboard
Interactive dashboards where grid selection drives chart visualization.

```typescript
@Component({
  template: `
    <div class="dashboard">
      <blg-grid [data]="salesData" 
                (selectionChanged)="updateChart($event)"
                #salesGrid>
      </blg-grid>
      
      <blg-chart [data]="chartData" 
                 type="line3d"
                 [config]="chartConfig">
      </blg-chart>
    </div>
  `
})
export class GridChartsIntegration {
  salesData = [...]; // Your sales data
  chartData = [];
  
  updateChart(selectedRows: any[]) {
    this.chartData = selectedRows.map(row => ({
      x: row.month,
      y: row.revenue,
      z: row.profit
    }));
  }
}
```

### 2. Editor + Avatar Content Creation
Rich text editor with AI assistant avatar for content help.

```typescript
@Component({
  template: `
    <div class="content-creator">
      <blg-editor [content]="editorContent"
                  (contentChanged)="onContentChanged($event)"
                  #editor>
      </blg-editor>
      
      <blg-avatar [config]="assistantConfig"
                  (speechComplete)="onAssistantResponse($event)"
                  #assistant>
      </blg-avatar>
      
      <button (click)="getWritingHelp()">Get Writing Help</button>
    </div>
  `
})
export class EditorAvatarIntegration {
  editorContent = '';
  assistantConfig = {
    type: '3d',
    model: 'writer-assistant',
    voice: { language: 'en-US' }
  };
  
  getWritingHelp() {
    const currentText = this.editor.getSelectedText();
    this.assistant.speak(`Let me help you improve this text: "${currentText}"`);
  }
}
```

### 3. All Components Enterprise Suite
Complete business application with all 5 components working together.

```typescript
@Component({
  template: `
    <div class="enterprise-app">
      <!-- Data Grid -->
      <blg-grid [data]="businessData" 
                (selectionChanged)="onDataSelection($event)"
                #dataGrid>
      </blg-grid>
      
      <!-- Visualization -->
      <blg-chart [data]="chartData"
                 type="dashboard"
                 #analyticsChart>
      </blg-chart>
      
      <!-- Content Management -->
      <blg-editor [content]="reportContent"
                  (contentChanged)="onReportChanged($event)"
                  #reportEditor>
      </blg-editor>
      
      <!-- AI Assistant -->
      <blg-avatar [config]="aiConfig"
                  (interactionComplete)="onAIInteraction($event)"
                  #aiAssistant>
      </blg-avatar>
      
      <!-- Export System -->
      <blg-export [sources]="allSources"
                  [formats]="['excel', 'pdf', 'pptx']"
                  #exportSystem>
      </blg-export>
    </div>
  `
})
export class EnterpriseIntegration {
  get allSources() {
    return [
      { component: this.dataGrid, title: 'Business Data', type: 'grid' },
      { component: this.analyticsChart, title: 'Analytics', type: 'chart' },
      { component: this.reportEditor, title: 'Report', type: 'editor' }
    ];
  }
}
```

## 📊 Real-world Examples

### Financial Trading Platform
- **Grid**: Real-time price data
- **Charts**: Price trends and volume analysis  
- **Avatar**: Trading assistant with voice commands
- **Export**: Trade reports and compliance documents

### Content Management System
- **Grid**: Content listings and metadata
- **Editor**: Rich text content creation
- **Avatar**: Content reviewer and SEO assistant
- **Export**: Multi-format publishing

### Business Intelligence Dashboard
- **Grid**: Raw data exploration
- **Charts**: Interactive visualizations
- **Export**: Executive reports and presentations
- **Avatar**: Data insights narrator

## 🎮 Live Integration Examples

| Integration | Components Used | Live Demo |
|-------------|-----------------|-----------|
| **Financial Dashboard** | Grid + Charts + Export | [StackBlitz](https://stackblitz.com/edit/blg-financial-integration) |
| **Content Platform** | Editor + Avatar + Export | [StackBlitz](https://stackblitz.com/edit/blg-content-integration) |
| **Analytics Suite** | Grid + Charts + Avatar | [StackBlitz](https://stackblitz.com/edit/blg-analytics-integration) |
| **Complete Enterprise** | All 5 Components | [StackBlitz](https://stackblitz.com/edit/blg-enterprise-integration) |

## 📁 Example Files

- [Grid + Charts Integration](./grid-charts-integration.md)
- [Editor + Avatar Integration](./editor-avatar-integration.md)
- [Export Multi-Component](./export-multi-component.md)
- [Complete Enterprise Example](./complete-enterprise-example.md)