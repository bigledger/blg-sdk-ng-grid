/**
 * BigLedger Set Filter - Demo & Examples
 * 
 * Comprehensive examples showing how to use the most advanced set filter implementation
 * available, surpassing both Excel and ag-grid in functionality.
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  SetFilterComponent,
  SetFilterBuilder,
  SetFilterTestUtils,
  provideSetFilterForLargeDatasets,
  provideSetFilterLightweight,
  SetFilterFeatureDetection,
  SetFilterConfig
} from './index';

// ============================================
// Basic Set Filter Demo
// ============================================

@Component({
  selector: 'demo-basic-set-filter',
  standalone: true,
  imports: [CommonModule, SetFilterComponent],
  template: `
    <div class="demo-container">
      <h2>Basic Set Filter</h2>
      <p>Simple set filter with default configuration</p>
      
      <blg-set-filter
        [data]="sampleData()"
        [columnKey]="'category'"
        [columnName]="'Product Category'"
        (filterChanged)="onFilterChanged($event)"
        (valueSelected)="onValueSelected($event)">
      </blg-set-filter>
      
      <div class="demo-output">
        <h4>Selected Values:</h4>
        <pre>{{ selectedValues() | json }}</pre>
      </div>
    </div>
  `
})
export class BasicSetFilterDemo implements OnInit {
  sampleData = signal<any[]>([]);
  selectedValues = signal<any[]>([]);

  ngOnInit() {
    this.sampleData.set(SetFilterTestUtils.createMockData(1000));
  }

  onFilterChanged(filter: any) {
    this.selectedValues.set(Array.from(filter.selectedValues));
  }

  onValueSelected(event: any) {
    console.log('Value selected:', event);
  }
}

// ============================================
// Advanced Set Filter Demo
// ============================================

@Component({
  selector: 'demo-advanced-set-filter',
  standalone: true,
  imports: [CommonModule, SetFilterComponent],
  providers: [provideSetFilterForLargeDatasets()],
  template: `
    <div class="demo-container">
      <h2>Advanced Set Filter</h2>
      <p>Full-featured set filter with all advanced capabilities enabled</p>
      
      <blg-set-filter
        [data]="largeDataset()"
        [columnKey]="'name'"
        [columnName]="'Product Name'"
        [config]="advancedConfig()"
        [showPerformanceMetrics]="true"
        (filterChanged)="onAdvancedFilterChanged($event)"
        (searchChanged)="onSearchChanged($event)"
        (performanceMetrics)="onPerformanceUpdate($event)">
      </blg-set-filter>
      
      <div class="demo-metrics">
        <h4>Performance Metrics:</h4>
        <div class="metrics-grid">
          <div class="metric">
            <span>Search Time:</span>
            <span>{{ performanceMetrics()?.searchTime || 0 }}ms</span>
          </div>
          <div class="metric">
            <span>Unique Values:</span>
            <span>{{ performanceMetrics()?.uniqueValueCount || 0 }}</span>
          </div>
          <div class="metric">
            <span>Virtual Scrolling:</span>
            <span>{{ performanceMetrics()?.virtualScrollingActive ? 'Active' : 'Inactive' }}</span>
          </div>
          <div class="metric">
            <span>Web Workers:</span>
            <span>{{ performanceMetrics()?.webWorkerUsed ? 'Used' : 'Not Used' }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdvancedSetFilterDemo implements OnInit {
  largeDataset = signal<any[]>([]);
  advancedConfig = signal<SetFilterConfig>({} as SetFilterConfig);
  performanceMetrics = signal<any>(null);

  ngOnInit() {
    // Create large dataset for performance testing
    this.largeDataset.set(SetFilterTestUtils.createPerformanceTestData(50000));
    
    // Configure advanced features
    const config = SetFilterBuilder.create()
      .enableVirtualScrolling(1000)
      .enableAdvancedSearch()
      .enableSmartFeatures()
      .enablePerformanceOptimizations()
      .enableAnalytics()
      .setTheme('auto')
      .build();
      
    this.advancedConfig.set(config);
  }

  onAdvancedFilterChanged(filter: any) {
    console.log('Advanced filter changed:', filter);
  }

  onSearchChanged(event: any) {
    console.log('Search changed:', event);
  }

  onPerformanceUpdate(metrics: any) {
    this.performanceMetrics.set(metrics);
  }
}

// ============================================
// Hierarchical Set Filter Demo
// ============================================

@Component({
  selector: 'demo-hierarchical-set-filter',
  standalone: true,
  imports: [CommonModule, SetFilterComponent],
  template: `
    <div class="demo-container">
      <h2>Hierarchical Set Filter</h2>
      <p>Tree-structured set filter with partial selection support</p>
      
      <blg-set-filter
        [data]="hierarchicalData()"
        [columnKey]="'category'"
        [columnName]="'Category Hierarchy'"
        [config]="hierarchicalConfig()"
        (filterChanged)="onHierarchicalFilterChanged($event)"
        (groupToggled)="onGroupToggled($event)">
      </blg-set-filter>
    </div>
  `
})
export class HierarchicalSetFilterDemo implements OnInit {
  hierarchicalData = signal<any[]>([]);
  hierarchicalConfig = signal<SetFilterConfig>({} as SetFilterConfig);

  ngOnInit() {
    // Create hierarchical data structure
    const data = [];
    const mainCategories = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];
    const subCategories = {
      'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Accessories'],
      'Clothing': ['Men', 'Women', 'Children', 'Shoes'],
      'Books': ['Fiction', 'Non-Fiction', 'Science', 'History'],
      'Home & Garden': ['Furniture', 'Tools', 'Plants', 'Decor']
    };

    for (let i = 0; i < 5000; i++) {
      const mainCat = mainCategories[i % mainCategories.length];
      const subCat = subCategories[mainCat as keyof typeof subCategories][Math.floor(Math.random() * 4)];
      
      data.push({
        id: i,
        name: `Product ${i}`,
        category: `${mainCat} > ${subCat}`,
        mainCategory: mainCat,
        subCategory: subCat,
        price: Math.floor(Math.random() * 1000) + 10
      });
    }
    
    this.hierarchicalData.set(data);
    
    // Configure hierarchical view
    const config = SetFilterBuilder.create()
      .enableHierarchicalView('category')
      .enableAnalytics()
      .build();
      
    this.hierarchicalConfig.set(config);
  }

  onHierarchicalFilterChanged(filter: any) {
    console.log('Hierarchical filter changed:', filter);
  }

  onGroupToggled(event: any) {
    console.log('Group toggled:', event);
  }
}

// ============================================
// Voice Search Demo
// ============================================

@Component({
  selector: 'demo-voice-search-filter',
  standalone: true,
  imports: [CommonModule, SetFilterComponent],
  template: `
    <div class="demo-container">
      <h2>Voice Search Set Filter</h2>
      <p>Set filter with voice search capability</p>
      
      <div class="voice-status" *ngIf="voiceSearchSupported()">
        <i class="icon-microphone"></i>
        Voice search is supported in your browser
      </div>
      
      <div class="voice-status warning" *ngIf="!voiceSearchSupported()">
        <i class="icon-warning"></i>
        Voice search is not supported in your browser
      </div>
      
      <blg-set-filter
        [data]="voiceSearchData()"
        [columnKey]="'description'"
        [columnName]="'Product Description'"
        [config]="voiceConfig()"
        (voiceSearchStarted)="onVoiceSearchStarted()"
        (voiceSearchEnded)="onVoiceSearchEnded($event)">
      </blg-set-filter>
      
      <div class="demo-output" *ngIf="lastVoiceTranscript()">
        <h4>Last Voice Search:</h4>
        <p>"{{ lastVoiceTranscript() }}"</p>
      </div>
    </div>
  `
})
export class VoiceSearchFilterDemo implements OnInit {
  voiceSearchData = signal<any[]>([]);
  voiceConfig = signal<SetFilterConfig>({} as SetFilterConfig);
  voiceSearchSupported = signal(false);
  lastVoiceTranscript = signal('');

  ngOnInit() {
    // Check voice search support
    const capabilities = SetFilterFeatureDetection.detectBrowserCapabilities();
    this.voiceSearchSupported.set(capabilities.voiceSearchSupported);
    
    // Create sample data with descriptive text
    const descriptions = [
      'High-quality wireless headphones',
      'Comfortable running shoes',
      'Professional laptop computer',
      'Organic cotton t-shirt',
      'Stainless steel water bottle',
      'Bluetooth wireless speaker',
      'Smart fitness tracker',
      'Premium leather wallet'
    ];
    
    const data = [];
    for (let i = 0; i < 1000; i++) {
      data.push({
        id: i,
        name: `Product ${i}`,
        description: descriptions[i % descriptions.length] + ` - Model ${i}`,
        price: Math.floor(Math.random() * 500) + 20
      });
    }
    
    this.voiceSearchData.set(data);
    
    // Configure voice search
    const config = SetFilterBuilder.create()
      .enableAdvancedSearch()
      .build();
      
    // Ensure voice search is enabled
    config.searchConfig.enableVoiceSearch = true;
    
    this.voiceConfig.set(config);
  }

  onVoiceSearchStarted() {
    console.log('Voice search started');
  }

  onVoiceSearchEnded(transcript: string) {
    this.lastVoiceTranscript.set(transcript);
    console.log('Voice search ended:', transcript);
  }
}

// ============================================
// Performance Comparison Demo
// ============================================

@Component({
  selector: 'demo-performance-comparison',
  standalone: true,
  imports: [CommonModule, SetFilterComponent],
  template: `
    <div class="demo-container">
      <h2>Performance Comparison</h2>
      <p>Compare set filter performance with different configurations</p>
      
      <div class="comparison-controls">
        <label>
          Dataset Size:
          <select [value]="datasetSize()" (change)="onDatasetSizeChange($event)">
            <option value="1000">1K rows</option>
            <option value="10000">10K rows</option>
            <option value="50000">50K rows</option>
            <option value="100000">100K rows</option>
          </select>
        </label>
        
        <button (click)="regenerateData()">Regenerate Data</button>
        <button (click)="clearMetrics()">Clear Metrics</button>
      </div>
      
      <div class="comparison-grid">
        <!-- Lightweight Configuration -->
        <div class="comparison-item">
          <h4>Lightweight Config</h4>
          <blg-set-filter
            [data]="comparisonData()"
            [columnKey]="'value'"
            [columnName]="'Values (Lightweight)'"
            [config]="lightweightConfig()"
            [showPerformanceMetrics]="true"
            (performanceMetrics)="onLightweightMetrics($event)">
          </blg-set-filter>
          
          <div class="metrics" *ngIf="lightweightMetrics()">
            <div>Search Time: {{ lightweightMetrics()?.searchTime }}ms</div>
            <div>Render Time: {{ lightweightMetrics()?.renderingTime }}ms</div>
          </div>
        </div>
        
        <!-- Full-Featured Configuration -->
        <div class="comparison-item">
          <h4>Full-Featured Config</h4>
          <blg-set-filter
            [data]="comparisonData()"
            [columnKey]="'value'"
            [columnName]="'Values (Full-Featured)'"
            [config]="fullFeaturedConfig()"
            [showPerformanceMetrics]="true"
            (performanceMetrics)="onFullFeaturedMetrics($event)">
          </blg-set-filter>
          
          <div class="metrics" *ngIf="fullFeaturedMetrics()">
            <div>Search Time: {{ fullFeaturedMetrics()?.searchTime }}ms</div>
            <div>Render Time: {{ fullFeaturedMetrics()?.renderingTime }}ms</div>
            <div>Web Workers: {{ fullFeaturedMetrics()?.webWorkerUsed ? 'Yes' : 'No' }}</div>
          </div>
        </div>
      </div>
      
      <div class="performance-summary">
        <h4>Performance Summary</h4>
        <div class="summary-grid">
          <div>Dataset Size: {{ datasetSize().toLocaleString() }} rows</div>
          <div>Unique Values: {{ uniqueValueCount() }}</div>
          <div>Lightweight Avg Search: {{ lightweightAvg() }}ms</div>
          <div>Full-Featured Avg Search: {{ fullFeaturedAvg() }}ms</div>
        </div>
      </div>
    </div>
  `,
  providers: [
    provideSetFilterLightweight(),
    provideSetFilterForLargeDatasets()
  ]
})
export class PerformanceComparisonDemo implements OnInit {
  datasetSize = signal(10000);
  comparisonData = signal<any[]>([]);
  uniqueValueCount = signal(0);
  
  lightweightConfig = signal<SetFilterConfig>({} as SetFilterConfig);
  fullFeaturedConfig = signal<SetFilterConfig>({} as SetFilterConfig);
  
  lightweightMetrics = signal<any>(null);
  fullFeaturedMetrics = signal<any>(null);
  
  private lightweightTimes: number[] = [];
  private fullFeaturedTimes: number[] = [];

  readonly lightweightAvg = signal(0);
  readonly fullFeaturedAvg = signal(0);

  ngOnInit() {
    this.setupConfigurations();
    this.regenerateData();
  }

  private setupConfigurations() {
    // Lightweight configuration
    const lightweight = SetFilterBuilder.create()
      .setTheme('light')
      .build();
    
    lightweight.uiConfig.showMiniCharts = false;
    lightweight.uiConfig.showColorCoding = false;
    lightweight.uiConfig.compactMode = true;
    lightweight.enableSmartFeatures = false;
    lightweight.enableAnalytics = false;
    
    this.lightweightConfig.set(lightweight);
    
    // Full-featured configuration
    const fullFeatured = SetFilterBuilder.create()
      .enableVirtualScrolling()
      .enableAdvancedSearch()
      .enableSmartFeatures()
      .enablePerformanceOptimizations()
      .enableAnalytics()
      .build();
      
    this.fullFeaturedConfig.set(fullFeatured);
  }

  onDatasetSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.datasetSize.set(parseInt(target.value));
    this.regenerateData();
  }

  regenerateData() {
    const data = SetFilterTestUtils.createPerformanceTestData(this.datasetSize());
    this.comparisonData.set(data);
    
    // Calculate unique values
    const uniqueValues = new Set(data.map(item => item.value));
    this.uniqueValueCount.set(uniqueValues.size);
  }

  clearMetrics() {
    this.lightweightMetrics.set(null);
    this.fullFeaturedMetrics.set(null);
    this.lightweightTimes.length = 0;
    this.fullFeaturedTimes.length = 0;
    this.lightweightAvg.set(0);
    this.fullFeaturedAvg.set(0);
  }

  onLightweightMetrics(metrics: any) {
    this.lightweightMetrics.set(metrics);
    
    if (metrics?.searchTime) {
      this.lightweightTimes.push(metrics.searchTime);
      this.updateLightweightAverage();
    }
  }

  onFullFeaturedMetrics(metrics: any) {
    this.fullFeaturedMetrics.set(metrics);
    
    if (metrics?.searchTime) {
      this.fullFeaturedTimes.push(metrics.searchTime);
      this.updateFullFeaturedAverage();
    }
  }

  private updateLightweightAverage() {
    const avg = this.lightweightTimes.reduce((sum, time) => sum + time, 0) / this.lightweightTimes.length;
    this.lightweightAvg.set(Math.round(avg));
  }

  private updateFullFeaturedAverage() {
    const avg = this.fullFeaturedTimes.reduce((sum, time) => sum + time, 0) / this.fullFeaturedTimes.length;
    this.fullFeaturedAvg.set(Math.round(avg));
  }
}

// ============================================
// Main Demo Component
// ============================================

@Component({
  selector: 'blg-set-filter-demo',
  standalone: true,
  imports: [
    CommonModule,
    BasicSetFilterDemo,
    AdvancedSetFilterDemo,
    HierarchicalSetFilterDemo,
    VoiceSearchFilterDemo,
    PerformanceComparisonDemo
  ],
  template: `
    <div class="set-filter-demos">
      <header class="demo-header">
        <h1>BigLedger Advanced Set Filter Demos</h1>
        <p>The most comprehensive set filter implementation available, surpassing both Excel and ag-grid</p>
        
        <div class="feature-highlights">
          <div class="feature-badge">Virtual Scrolling</div>
          <div class="feature-badge">Voice Search</div>
          <div class="feature-badge">AI Categorization</div>
          <div class="feature-badge">Hierarchical View</div>
          <div class="feature-badge">Performance Optimized</div>
          <div class="feature-badge">Visual Analytics</div>
        </div>
      </header>

      <nav class="demo-nav">
        <button 
          *ngFor="let demo of demos; trackBy: trackDemo"
          [class.active]="activeDemo() === demo.id"
          (click)="setActiveDemo(demo.id)">
          {{ demo.title }}
        </button>
      </nav>

      <main class="demo-content">
        <demo-basic-set-filter *ngIf="activeDemo() === 'basic'"></demo-basic-set-filter>
        <demo-advanced-set-filter *ngIf="activeDemo() === 'advanced'"></demo-advanced-set-filter>
        <demo-hierarchical-set-filter *ngIf="activeDemo() === 'hierarchical'"></demo-hierarchical-set-filter>
        <demo-voice-search-filter *ngIf="activeDemo() === 'voice'"></demo-voice-search-filter>
        <demo-performance-comparison *ngIf="activeDemo() === 'performance'"></demo-performance-comparison>
      </main>
      
      <footer class="demo-footer">
        <div class="demo-info">
          <h3>Key Features That Surpass Competition:</h3>
          <ul>
            <li><strong>Virtual Scrolling:</strong> Handle millions of values smoothly</li>
            <li><strong>Voice Search:</strong> Speak your filter criteria (Chrome/Edge)</li>
            <li><strong>AI Categorization:</strong> Smart grouping of similar values</li>
            <li><strong>Advanced Search:</strong> Fuzzy, regex, phonetic, and semantic search</li>
            <li><strong>Hierarchical Trees:</strong> Partial selection support</li>
            <li><strong>Visual Analytics:</strong> Distribution charts and color coding</li>
            <li><strong>Performance Monitoring:</strong> Real-time metrics</li>
            <li><strong>Template System:</strong> Save and share filter configurations</li>
            <li><strong>Web Workers:</strong> Background processing for large datasets</li>
            <li><strong>IndexedDB Caching:</strong> Persistent performance optimization</li>
          </ul>
        </div>
        
        <div class="browser-support">
          <h3>Browser Compatibility:</h3>
          <div class="browser-grid">
            <div class="browser-item">Chrome 90+</div>
            <div class="browser-item">Firefox 88+</div>
            <div class="browser-item">Safari 14+</div>
            <div class="browser-item">Edge 90+</div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .set-filter-demos {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .demo-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .demo-header h1 {
      color: #2d3748;
      margin-bottom: 10px;
    }
    
    .demo-header p {
      color: #718096;
      font-size: 18px;
      margin-bottom: 20px;
    }
    
    .feature-highlights {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .feature-badge {
      padding: 4px 12px;
      background: linear-gradient(135deg, #3182ce, #63b3ed);
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .demo-nav {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    
    .demo-nav button {
      padding: 8px 16px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .demo-nav button:hover {
      border-color: #3182ce;
      background: #f7fafc;
    }
    
    .demo-nav button.active {
      background: #3182ce;
      color: white;
      border-color: #3182ce;
    }
    
    .demo-content {
      min-height: 600px;
    }
    
    .demo-container {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .demo-container h2 {
      margin-top: 0;
      color: #2d3748;
    }
    
    .demo-output {
      margin-top: 20px;
      padding: 15px;
      background: #f7fafc;
      border-radius: 6px;
    }
    
    .demo-output h4 {
      margin-top: 0;
      color: #4a5568;
    }
    
    .demo-footer {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
    }
    
    .demo-info ul {
      color: #4a5568;
    }
    
    .demo-info li {
      margin-bottom: 8px;
    }
    
    .browser-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .browser-item {
      padding: 8px;
      background: #edf2f7;
      border-radius: 4px;
      text-align: center;
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .demo-footer {
        grid-template-columns: 1fr;
      }
      
      .demo-nav {
        flex-direction: column;
        align-items: center;
      }
      
      .feature-highlights {
        justify-content: center;
      }
    }
  `]
})
export class SetFilterDemoComponent implements OnInit {
  activeDemo = signal('basic');
  
  demos = [
    { id: 'basic', title: 'Basic Usage' },
    { id: 'advanced', title: 'Advanced Features' },
    { id: 'hierarchical', title: 'Hierarchical View' },
    { id: 'voice', title: 'Voice Search' },
    { id: 'performance', title: 'Performance Comparison' }
  ];

  ngOnInit() {
    // Set up demo
  }

  setActiveDemo(demoId: string) {
    this.activeDemo.set(demoId);
  }

  trackDemo = (index: number, demo: any) => demo.id;
}