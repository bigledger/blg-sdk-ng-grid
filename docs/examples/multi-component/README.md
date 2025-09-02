# Multi-Component Examples

Comprehensive examples showing how to build complete applications using multiple BigLedger UI Kit components working together seamlessly.

## 🏢 Enterprise Applications

### Executive Dashboard
A comprehensive business dashboard combining data visualization, real-time updates, and export capabilities.

```typescript
@Component({
  selector: 'executive-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Header with AI Assistant -->
      <header class="dashboard-header">
        <h1>Executive Dashboard</h1>
        <blg-avatar [config]="executiveAssistant" 
                    class="ai-assistant">
        </blg-avatar>
      </header>
      
      <!-- KPI Cards with Real-time Data -->
      <section class="kpi-section">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <h3>{{ kpi.title }}</h3>
          <span class="kpi-value">{{ kpi.value | currency }}</span>
          <small [class]="kpi.trend">{{ kpi.change }}%</small>
        </div>
      </section>
      
      <!-- Main Data Grid -->
      <section class="data-section">
        <blg-grid [data]="salesData"
                  [config]="gridConfig"
                  (selectionChanged)="updateCharts($event)"
                  #salesGrid>
        </blg-grid>
      </section>
      
      <!-- Chart Visualizations -->
      <section class="charts-section">
        <div class="chart-container">
          <blg-chart [data]="revenueChartData"
                     type="line3d"
                     [config]="revenueChartConfig">
          </blg-chart>
        </div>
        
        <div class="chart-container">
          <blg-chart [data]="regionChartData"
                     type="bar3d"
                     [config]="regionChartConfig">
          </blg-chart>
        </div>
      </section>
      
      <!-- Report Generation -->
      <section class="export-section">
        <h3>Generate Reports</h3>
        <blg-export [sources]="reportSources"
                    [config]="exportConfig"
                    (exportComplete)="onReportComplete($event)">
        </blg-export>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: grid;
      grid-template-areas: 
        "header header"
        "kpis kpis"
        "data charts"
        "export export";
      grid-template-rows: auto auto 1fr auto;
      gap: 20px;
      padding: 20px;
      height: 100vh;
    }
    
    .dashboard-header {
      grid-area: header;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .kpi-section {
      grid-area: kpis;
      display: flex;
      gap: 20px;
    }
    
    .kpi-card {
      flex: 1;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .data-section {
      grid-area: data;
      min-height: 400px;
    }
    
    .charts-section {
      grid-area: charts;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .export-section {
      grid-area: export;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
  `]
})
export class ExecutiveDashboard {
  // KPI Data
  kpis = [
    { title: 'Total Revenue', value: 1250000, change: 15.2, trend: 'positive' },
    { title: 'Active Users', value: 45000, change: 8.7, trend: 'positive' },
    { title: 'Conversion Rate', value: 3.2, change: -2.1, trend: 'negative' },
    { title: 'Customer Satisfaction', value: 4.6, change: 5.8, trend: 'positive' }
  ];
  
  // Grid Configuration
  gridConfig = {
    columns: [
      { field: 'region', headerName: 'Region', width: 120 },
      { field: 'revenue', headerName: 'Revenue', type: 'currency' },
      { field: 'growth', headerName: 'Growth %', type: 'percentage' },
      { field: 'customers', headerName: 'Customers', type: 'number' }
    ],
    enableVirtualScrolling: true,
    enableRealTimeUpdates: true
  };
  
  // AI Assistant Configuration
  executiveAssistant = {
    type: '3d',
    model: 'business-advisor',
    voice: { language: 'en-US', pitch: 0.9 },
    behavior: { professional: true }
  };
  
  // Export Configuration
  exportConfig = {
    template: 'executive-report',
    formats: ['pdf', 'excel', 'powerpoint'],
    branding: { 
      logo: '/assets/company-logo.png',
      colors: ['#1a365d', '#2d3748']
    }
  };
  
  updateCharts(selectedRows: any[]) {
    // Update chart data based on grid selection
    this.revenueChartData = this.processRevenueData(selectedRows);
    this.regionChartData = this.processRegionData(selectedRows);
  }
  
  onReportComplete(event: any) {
    this.executiveAssistant.speak(
      `Your ${event.format} report has been generated successfully. 
       The file is ready for download.`
    );
  }
}
```

### Customer Service Platform
A complete customer service application with ticket management, real-time chat, and AI assistance.

```typescript
@Component({
  selector: 'customer-service-platform',
  template: `
    <div class="service-platform">
      <!-- Ticket Management Grid -->
      <section class="tickets-section">
        <h2>Support Tickets</h2>
        <blg-grid [data]="tickets"
                  [config]="ticketGridConfig"
                  (rowDoubleClick)="openTicket($event)"
                  #ticketGrid>
        </blg-grid>
      </section>
      
      <!-- Ticket Analytics -->
      <section class="analytics-section">
        <blg-chart [data]="ticketAnalytics"
                   type="dashboard"
                   [config]="analyticsConfig">
        </blg-chart>
      </section>
      
      <!-- AI Customer Service Avatar -->
      <section class="ai-assistant-section">
        <h3>AI Assistant</h3>
        <blg-avatar [config]="serviceAvatar"
                    (speechComplete)="onAssistantResponse($event)"
                    #serviceBot>
        </blg-avatar>
        
        <div class="assistant-controls">
          <button (click)="trainAssistant()">Train on New Data</button>
          <button (click)="generateSummary()">Generate Summary</button>
        </div>
      </section>
      
      <!-- Response Templates Editor -->
      <section class="templates-section">
        <h3>Response Templates</h3>
        <blg-editor [content]="templateContent"
                    [config]="editorConfig"
                    (contentChanged)="updateTemplate($event)"
                    #templateEditor>
        </blg-editor>
      </section>
      
      <!-- Export Reports -->
      <section class="reporting-section">
        <blg-export [sources]="reportSources"
                    [config]="serviceReportConfig">
        </blg-export>
      </section>
    </div>
  `
})
export class CustomerServicePlatform {
  tickets = [
    { 
      id: 'TKT-001', 
      customer: 'John Doe', 
      priority: 'High',
      status: 'Open',
      created: new Date('2024-01-15'),
      subject: 'Login Issues'
    }
    // ... more tickets
  ];
  
  serviceAvatar = {
    type: '3d',
    model: 'customer-service-rep',
    voice: { language: 'en-US', pitch: 1.1 },
    emotions: { empathetic: true },
    knowledgeBase: 'customer-service'
  };
  
  trainAssistant() {
    // Train AI on recent ticket resolutions
    this.serviceBot.speak(
      "I'm analyzing recent ticket resolutions to improve my responses. This will take a moment."
    );
  }
  
  generateSummary() {
    // Generate ticket summary with AI
    const summary = this.generateTicketSummary();
    this.serviceBot.speak(summary);
  }
}
```

### Learning Management System
Educational platform combining content creation, progress tracking, and interactive avatars.

```typescript
@Component({
  selector: 'learning-platform',
  template: `
    <div class="learning-platform">
      <!-- Course Content Editor -->
      <section class="content-creation">
        <h2>Course Content</h2>
        <blg-editor [content]="courseContent"
                    [config]="courseEditorConfig"
                    (contentChanged)="updateCourse($event)"
                    #courseEditor>
        </blg-editor>
      </section>
      
      <!-- Student Progress Grid -->
      <section class="progress-tracking">
        <h2>Student Progress</h2>
        <blg-grid [data]="studentProgress"
                  [config]="progressGridConfig"
                  (selectionChanged)="viewStudentDetails($event)"
                  #progressGrid>
        </blg-grid>
      </section>
      
      <!-- Learning Analytics -->
      <section class="analytics">
        <blg-chart [data]="learningAnalytics"
                   type="educational-dashboard"
                   [config]="analyticsConfig">
        </blg-chart>
      </section>
      
      <!-- Virtual Teacher Avatar -->
      <section class="virtual-teacher">
        <blg-avatar [config]="teacherConfig"
                    (interactionComplete)="onTeacherInteraction($event)"
                    #virtualTeacher>
        </blg-avatar>
        
        <div class="teaching-controls">
          <button (click)="explainConcept()">Explain Concept</button>
          <button (click)="provideEncouragement()">Encourage Student</button>
          <button (click)="assignHomework()">Assign Homework</button>
        </div>
      </section>
      
      <!-- Report Generation -->
      <section class="academic-reports">
        <blg-export [sources]="academicSources"
                    [config]="academicReportConfig">
        </blg-export>
      </section>
    </div>
  `
})
export class LearningPlatform {
  teacherConfig = {
    type: '3d',
    model: 'friendly-teacher',
    voice: { language: 'en-US', rate: 0.9 },
    gestures: ['point', 'thumbs-up', 'wave'],
    personality: 'encouraging'
  };
  
  explainConcept() {
    const selectedConcept = this.getSelectedConcept();
    this.virtualTeacher.speak(`Let me explain ${selectedConcept} in simple terms...`);
  }
  
  provideEncouragement() {
    const encouragements = [
      "You're doing great! Keep up the excellent work!",
      "I can see you're really understanding this concept.",
      "Your progress is impressive. You should be proud!"
    ];
    const message = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.virtualTeacher.speak(message, { emotion: 'joy' });
  }
}
```

## 🎯 Industry-Specific Examples

### Healthcare Management System
- **Grid**: Patient records and appointment scheduling
- **Charts**: Health metrics and treatment outcomes
- **Editor**: Medical notes and treatment plans
- **Avatar**: Patient education and accessibility support
- **Export**: Medical reports and compliance documents

### Financial Trading Platform
- **Grid**: Real-time market data and portfolios
- **Charts**: Price charts and technical analysis
- **Avatar**: Trading assistant with voice commands
- **Export**: Trade confirmations and regulatory reports

### Manufacturing Dashboard
- **Grid**: Production data and quality metrics
- **Charts**: Manufacturing KPIs and trends
- **Editor**: Standard operating procedures
- **Avatar**: Safety training and guidance
- **Export**: Production reports and compliance documentation

## 🚀 Quick Start Templates

Each example includes:
- Complete TypeScript component code
- HTML templates with proper layouts
- CSS styling for professional appearance
- Integration logic between components
- Sample data and configurations
- Export templates and branding
- Deployment instructions

## 📁 Available Examples

### Complete Applications
- [Executive Dashboard](./executive-dashboard/)
- [Customer Service Platform](./customer-service-platform/)
- [Learning Management System](./learning-management-system/)
- [Healthcare Management](./healthcare-management/)
- [Financial Trading Platform](./financial-trading-platform/)
- [Manufacturing Dashboard](./manufacturing-dashboard/)

### Integration Patterns
- [Grid + Charts Data Flow](./patterns/grid-charts-dataflow/)
- [Editor + Avatar Collaboration](./patterns/editor-avatar-collaboration/)
- [Export Multi-Source Reports](./patterns/export-multi-source/)
- [Real-time Dashboard Updates](./patterns/realtime-updates/)

---

**Ready to build a complete application?** Choose an example that matches your use case and customize it for your specific needs. All examples are production-ready and include best practices for performance, accessibility, and user experience.