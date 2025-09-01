import { Component, ViewChild, ElementRef, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';
import { TableEditorComponent } from '@ng-ui/editor-tables';
import { ImageEditorComponent } from '@ng-ui/editor-media';

/**
 * Comprehensive Editor Demo Component for E2E Testing
 * Showcases all editor features in a single test-friendly interface
 */
@Component({
  selector: 'ng-ui-editor-demo',
  standalone: true,
  imports: [
    CommonModule,
    EditorCoreComponent,
    ToolbarComponent,
    TableEditorComponent,
    ImageEditorComponent
  ],
  template: `
    <div class="editor-demo-container" data-testid="editor-demo">
      <h1>BLG Editor Comprehensive Demo</h1>
      
      <!-- Configuration Panel -->
      <div class="config-panel" data-testid="config-panel">
        <h3>Configuration</h3>
        <div class="config-options">
          <label>
            <input type="checkbox" 
                   [checked]="showToolbar()"
                   (change)="showToolbar.set($event.target.checked)"
                   data-testid="show-toolbar-checkbox">
            Show Toolbar
          </label>
          <label>
            <input type="checkbox" 
                   [checked]="compactMode()"
                   (change)="compactMode.set($event.target.checked)"
                   data-testid="compact-mode-checkbox">
            Compact Mode
          </label>
          <label>
            <input type="checkbox" 
                   [checked]="readonlyMode()"
                   (change)="readonlyMode.set($event.target.checked)"
                   data-testid="readonly-mode-checkbox">
            Readonly Mode
          </label>
          <label>
            <input type="checkbox" 
                   [checked]="darkTheme()"
                   (change)="darkTheme.set($event.target.checked)"
                   data-testid="dark-theme-checkbox">
            Dark Theme
          </label>
        </div>
      </div>

      <!-- Toolbar -->
      <ng-ui-editor-toolbar
        *ngIf="showToolbar()"
        [compact]="compactMode()"
        [disabled]="readonlyMode()"
        [theme]="darkTheme() ? 'dark' : 'light'"
        (formatChange)="onFormatChange($event)"
        (commandExecuted)="onCommandExecuted($event)"
        data-testid="editor-toolbar"
        class="editor-toolbar">
      </blg-editor-toolbar>

      <!-- Main Editor -->
      <ng-ui-editor-core
        [config]="editorConfig()"
        (contentChange)="onContentChange($event)"
        (selectionChange)="onSelectionChange($event)"
        (focus)="onEditorFocus()"
        (blur)="onEditorBlur()"
        data-testid="main-editor"
        class="main-editor">
      </blg-editor-core>

      <!-- Secondary Editor for Copy/Paste Testing -->
      <div class="secondary-editor-section">
        <h3>Secondary Editor (for copy/paste testing)</h3>
        <ng-ui-editor-core
          [config]="secondaryEditorConfig()"
          (contentChange)="onSecondaryContentChange($event)"
          data-testid="secondary-editor"
          class="secondary-editor">
        </blg-editor-core>
      </div>

      <!-- Table Editor Section -->
      <div class="table-section" data-testid="table-section">
        <h3>Table Editor</h3>
        <ng-ui-table-editor
          [config]="tableConfig()"
          (tableChange)="onTableChange($event)"
          data-testid="table-editor"
          class="table-editor">
        </blg-table-editor>
        
        <div class="table-controls">
          <button (click)="insertTable(3, 3)" data-testid="insert-table-3x3">Insert 3x3 Table</button>
          <button (click)="insertTable(5, 4)" data-testid="insert-table-5x4">Insert 5x4 Table</button>
          <button (click)="importCsvData()" data-testid="import-csv-data">Import CSV Data</button>
        </div>
      </div>

      <!-- Image Editor Section -->
      <div class="image-section" data-testid="image-section">
        <h3>Image Editor</h3>
        <ng-ui-image-editor
          [config]="imageConfig()"
          (imageChange)="onImageChange($event)"
          data-testid="image-editor"
          class="image-editor">
        </blg-image-editor>
        
        <div class="image-controls">
          <input type="file" 
                 accept="image/*" 
                 (change)="onFileSelected($event)"
                 data-testid="image-file-input"
                 #fileInput>
          <button (click)="fileInput.click()" data-testid="upload-image-button">Upload Image</button>
          <button (click)="insertImageByUrl()" data-testid="insert-image-url-button">Insert by URL</button>
          <button (click)="insertYouTubeVideo()" data-testid="insert-youtube-button">Insert YouTube</button>
          <button (click)="insertVimeoVideo()" data-testid="insert-vimeo-button">Insert Vimeo</button>
        </div>
      </div>

      <!-- Test Content Buttons -->
      <div class="test-controls" data-testid="test-controls">
        <h3>Test Content</h3>
        <div class="test-buttons">
          <button (click)="loadSampleContent()" data-testid="load-sample-content">Load Sample Content</button>
          <button (click)="loadLargeDocument()" data-testid="load-large-document">Load Large Document (10k words)</button>
          <button (click)="loadComplexFormatting()" data-testid="load-complex-formatting">Load Complex Formatting</button>
          <button (click)="clearAllContent()" data-testid="clear-all-content">Clear All</button>
        </div>
      </div>

      <!-- Status Panel -->
      <div class="status-panel" data-testid="status-panel">
        <div class="status-item">
          <label>Words: <span data-testid="word-count">{{ wordCount() }}</span></label>
        </div>
        <div class="status-item">
          <label>Characters: <span data-testid="char-count">{{ charCount() }}</span></label>
        </div>
        <div class="status-item">
          <label>Editor State: <span data-testid="editor-state">{{ editorState() }}</span></label>
        </div>
        <div class="status-item">
          <label>Has Selection: <span data-testid="has-selection">{{ hasSelection() }}</span></label>
        </div>
        <div class="status-item">
          <label>Can Undo: <span data-testid="can-undo">{{ canUndo() }}</span></label>
        </div>
        <div class="status-item">
          <label>Can Redo: <span data-testid="can-redo">{{ canRedo() }}</span></label>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="performance-panel" data-testid="performance-panel">
        <h3>Performance Metrics</h3>
        <div class="metric-item">
          <label>Render Time: <span data-testid="render-time">{{ renderTime() }}ms</span></label>
        </div>
        <div class="metric-item">
          <label>Memory Usage: <span data-testid="memory-usage">{{ memoryUsage() }}MB</span></label>
        </div>
      </div>

      <!-- Accessibility Testing Aids -->
      <div class="a11y-panel" data-testid="accessibility-panel" [hidden]="true">
        <button data-testid="focus-editor">Focus Editor</button>
        <button data-testid="focus-toolbar">Focus Toolbar</button>
        <div role="status" aria-live="polite" data-testid="screen-reader-status">{{ screenReaderStatus() }}</div>
      </div>
    </div>
  `,
  styles: [`
    .editor-demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .config-panel {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .config-options {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .config-options label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .editor-toolbar {
      border: 1px solid #ddd;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
    }

    .main-editor {
      min-height: 400px;
      border: 1px solid #ddd;
      border-radius: 0 0 4px 4px;
    }

    .secondary-editor-section {
      margin: 40px 0;
    }

    .secondary-editor {
      min-height: 200px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .table-section, .image-section {
      margin: 40px 0;
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;
    }

    .table-controls, .image-controls {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .test-controls {
      margin: 40px 0;
      padding: 20px;
      background: #e3f2fd;
      border-radius: 8px;
    }

    .test-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .status-panel, .performance-panel {
      margin: 20px 0;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .status-item, .metric-item {
      display: inline-block;
      margin-right: 20px;
      padding: 4px 8px;
      background: white;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    button {
      padding: 8px 16px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    button:hover {
      background: #1976d2;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Dark theme styles */
    :host-context(.dark-theme) .editor-demo-container {
      background: #1a1a1a;
      color: #ffffff;
    }

    :host-context(.dark-theme) .config-panel,
    :host-context(.dark-theme) .status-panel,
    :host-context(.dark-theme) .performance-panel {
      background: #2a2a2a;
      color: #ffffff;
    }

    /* Mobile responsive styles */
    @media (max-width: 768px) {
      .editor-demo-container {
        padding: 10px;
      }

      .config-options, .test-buttons, .table-controls, .image-controls {
        flex-direction: column;
        gap: 8px;
      }

      .main-editor {
        min-height: 300px;
      }

      button {
        width: 100%;
        justify-content: center;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .editor-demo-container {
        border: 2px solid #000;
      }
      
      button {
        border: 2px solid #000;
      }
    }
  `]
})
export class EditorDemoComponent {
  // Configuration signals
  showToolbar = signal(true);
  compactMode = signal(false);
  readonlyMode = signal(false);
  darkTheme = signal(false);

  // Content signals
  private _content = signal('');
  private _secondaryContent = signal('');
  private _selection = signal<any>(null);
  
  // State signals
  private _editorState = signal('ready');
  private _wordCount = signal(0);
  private _charCount = signal(0);
  private _canUndo = signal(false);
  private _canRedo = signal(false);
  private _renderTime = signal(0);
  private _memoryUsage = signal(0);
  private _screenReaderStatus = signal('');

  // Computed values
  readonly editorConfig = computed(() => ({
    content: this._content(),
    placeholder: 'Start typing to test the editor...',
    autoFocus: false,
    readonly: this.readonlyMode(),
    theme: this.darkTheme() ? 'dark' : 'light'
  }));

  readonly secondaryEditorConfig = computed(() => ({
    content: this._secondaryContent(),
    placeholder: 'Secondary editor for testing...',
    autoFocus: false,
    readonly: false,
    theme: this.darkTheme() ? 'dark' : 'light'
  }));

  readonly tableConfig = computed(() => ({
    allowResize: true,
    allowSort: true,
    theme: this.darkTheme() ? 'dark' : 'light'
  }));

  readonly imageConfig = computed(() => ({
    allowResize: true,
    allowCrop: true,
    maxWidth: 800,
    theme: this.darkTheme() ? 'dark' : 'light'
  }));

  // Public readonly signals
  readonly wordCount = this._wordCount.asReadonly();
  readonly charCount = this._charCount.asReadonly();
  readonly editorState = this._editorState.asReadonly();
  readonly hasSelection = computed(() => this._selection() !== null);
  readonly canUndo = this._canUndo.asReadonly();
  readonly canRedo = this._canRedo.asReadonly();
  readonly renderTime = this._renderTime.asReadonly();
  readonly memoryUsage = this._memoryUsage.asReadonly();
  readonly screenReaderStatus = this._screenReaderStatus.asReadonly();

  constructor() {
    // Effect to update theme class
    effect(() => {
      const element = document.documentElement;
      if (this.darkTheme()) {
        element.classList.add('dark-theme');
      } else {
        element.classList.remove('dark-theme');
      }
    });

    // Performance monitoring
    this.startPerformanceMonitoring();
  }

  // Event handlers
  onContentChange(content: string): void {
    this._content.set(content);
    this.updateWordAndCharCount(content);
  }

  onSecondaryContentChange(content: string): void {
    this._secondaryContent.set(content);
  }

  onSelectionChange(selection: any): void {
    this._selection.set(selection);
    this.updateScreenReaderStatus('Selection changed');
  }

  onEditorFocus(): void {
    this._editorState.set('focused');
  }

  onEditorBlur(): void {
    this._editorState.set('blurred');
  }

  onFormatChange(format: any): void {
    console.log('Format changed:', format);
  }

  onCommandExecuted(command: any): void {
    console.log('Command executed:', command);
    this.updateScreenReaderStatus(`Command ${command.name} executed`);
  }

  onTableChange(table: any): void {
    console.log('Table changed:', table);
  }

  onImageChange(image: any): void {
    console.log('Image changed:', image);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      // Handle file upload logic
    }
  }

  // Test content methods
  loadSampleContent(): void {
    const sampleContent = `
      <h1>Welcome to BLG Editor</h1>
      <p>This is a <strong>comprehensive</strong> editor with <em>rich text</em> capabilities.</p>
      <p>Features include:</p>
      <ul>
        <li>Text formatting (<strong>bold</strong>, <em>italic</em>, <u>underline</u>)</li>
        <li>Lists and headings</li>
        <li>Tables and media</li>
        <li>Keyboard shortcuts</li>
      </ul>
      <blockquote>
        <p>"The best editor for modern web applications"</p>
      </blockquote>
    `;
    this._content.set(sampleContent);
  }

  loadLargeDocument(): void {
    // Generate a large document for performance testing
    let content = '<h1>Large Document for Performance Testing</h1>';
    for (let i = 1; i <= 100; i++) {
      content += `
        <h2>Section ${i}</h2>
        <p>This is paragraph ${i} with some <strong>bold text</strong> and <em>italic text</em>. `;
      
      // Add random content
      const words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
      for (let j = 0; j < 50; j++) {
        content += words[Math.floor(Math.random() * words.length)] + ' ';
      }
      content += '</p>';
    }
    this._content.set(content);
  }

  loadComplexFormatting(): void {
    const complexContent = `
      <h1>Complex Formatting Test</h1>
      <p style="color: red; font-size: 18px;">Colored text with custom font size</p>
      <p style="background-color: yellow;">Text with background color</p>
      <table border="1">
        <tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr>
        <tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr>
        <tr><td colspan="2">Merged cell</td><td>Cell 6</td></tr>
      </table>
      <pre><code>// Code block example
function test() {
  return "Hello World";
}</code></pre>
      <hr>
      <p align="center">Centered paragraph</p>
      <p align="right">Right-aligned paragraph</p>
    `;
    this._content.set(complexContent);
  }

  clearAllContent(): void {
    this._content.set('');
    this._secondaryContent.set('');
  }

  // Table operations
  insertTable(rows: number, cols: number): void {
    console.log(`Inserting ${rows}x${cols} table`);
    // Implementation would insert table into editor
  }

  importCsvData(): void {
    console.log('Importing CSV data');
    // Implementation would import CSV data
  }

  // Image operations
  insertImageByUrl(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      console.log('Inserting image from URL:', url);
      // Implementation would insert image
    }
  }

  insertYouTubeVideo(): void {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      console.log('Inserting YouTube video:', url);
      // Implementation would insert video
    }
  }

  insertVimeoVideo(): void {
    const url = prompt('Enter Vimeo URL:');
    if (url) {
      console.log('Inserting Vimeo video:', url);
      // Implementation would insert video
    }
  }

  // Utility methods
  private updateWordAndCharCount(content: string): void {
    const text = this.stripHtml(content);
    this._charCount.set(text.length);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    this._wordCount.set(words.length);
  }

  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private updateScreenReaderStatus(status: string): void {
    this._screenReaderStatus.set(status);
    // Clear after 3 seconds
    setTimeout(() => this._screenReaderStatus.set(''), 3000);
  }

  private startPerformanceMonitoring(): void {
    const updateMetrics = () => {
      // Measure render time
      const start = performance.now();
      requestAnimationFrame(() => {
        const end = performance.now();
        this._renderTime.set(Math.round(end - start));
      });

      // Measure memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this._memoryUsage.set(Math.round(memory.usedJSHeapSize / 1024 / 1024));
      }
    };

    // Update metrics every 2 seconds
    setInterval(updateMetrics, 2000);
    updateMetrics();
  }
}