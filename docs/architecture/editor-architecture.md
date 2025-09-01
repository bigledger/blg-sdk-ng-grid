# Angular-Optimized Rich Text Editor Architecture

**Audience: Library Architects and Core Development Team**

This document provides a comprehensive architecture design for a modern, Angular-optimized rich text editor that leverages the same patterns and performance optimizations used in the BLG Grid library. The editor is designed to be a production-ready, enterprise-grade solution that rivals existing solutions while being specifically optimized for Angular applications.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Design Principles](#core-design-principles)
- [Module Structure](#module-structure)
- [Signal-Based State Management](#signal-based-state-management)
- [Component Architecture](#component-architecture)
- [Plugin System](#plugin-system)
- [Content Model & Security](#content-model--security)
- [Performance Optimizations](#performance-optimizations)
- [Event System](#event-system)
- [TypeScript Interfaces](#typescript-interfaces)
- [Testing Strategy](#testing-strategy)

## Architecture Overview

**BLG Editor** is an enterprise-grade Angular rich text editor built using Angular 20+ with Signals, standalone components, and modern performance patterns. It follows the same architectural principles as the BLG Grid library.

### Key Characteristics

- **Angular-Native**: Built from the ground up for Angular with Signals and standalone components
- **Performance-First**: Optimized for large documents with virtual scrolling and efficient change detection
- **Plugin Architecture**: Extensible system for custom functionality and features
- **Security-Focused**: Comprehensive content sanitization and XSS protection
- **Type-Safe**: Full TypeScript support with comprehensive interfaces
- **Accessibility-Ready**: WCAG 2.1 AA compliant with screen reader support
- **Production-Ready**: Handles documents with 10k+ elements efficiently

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                Application Layer                │
│              (Consumer's App)                   │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                Editor Library                   │
│     ┌─────────────────────────────────────────┐ │
│     │          Editor Component               │ │
│     │         (Main Entry Point)             │ │
│     └─────────────────────────────────────────┘ │
│              │           │           │         │
│     ┌────────┴──┐   ┌────┴────┐   ┌──┴────┐   │
│     │ Toolbar   │   │ Content │   │Plugins│   │
│     │ Module    │   │ Module  │   │Module │   │
│     └───────────┘   └─────────┘   └───────┘   │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                Core Libraries                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Editor    │ │Formats   │ │     Media        │ │
│  │Core      │ │& Tables  │ │   & Themes       │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│              Foundation Layer                   │
│    ┌────────────┐  ┌─────────────┐ ┌─────────┐ │
│    │ Content    │  │  Security   │ │ Angular │ │
│    │  Model     │  │  Sanitizer  │ │   CDK   │ │
│    └────────────┘  └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────────┘
```

## Core Design Principles

### 1. Signal-First Reactive Architecture
All state management uses Angular Signals for optimal performance and predictable reactivity patterns.

### 2. Content Immutability
Document content is stored as immutable data structures with efficient structural sharing for performance.

### 3. Command Pattern Implementation
All editor operations are implemented as commands that can be undone/redone and batched for performance.

### 4. Security by Design
Content sanitization and XSS protection are built into the core architecture, not added as an afterthought.

### 5. Performance Optimized
Virtual scrolling, efficient change detection, and optimized DOM operations for large documents.

### 6. Modular & Extensible
Plugin architecture allows for custom functionality without modifying core code.

## Module Structure

### Nx Workspace Organization

```
libs/
├── editor-core/           # Foundation services and interfaces
│   ├── services/         # Core editor services
│   │   ├── editor-state.service.ts
│   │   ├── command.service.ts
│   │   ├── selection.service.ts
│   │   └── history.service.ts
│   ├── interfaces/       # Core interfaces and types
│   │   ├── editor-config.interface.ts
│   │   ├── content-model.interface.ts
│   │   ├── command.interface.ts
│   │   └── plugin.interface.ts
│   ├── models/          # Content model classes
│   │   ├── document.model.ts
│   │   ├── block.model.ts
│   │   └── inline.model.ts
│   └── utilities/       # Helper functions
│       ├── dom-utils.ts
│       ├── range-utils.ts
│       └── text-utils.ts
├── editor-toolbar/        # Toolbar components and controls
│   ├── components/       # Toolbar UI components
│   │   ├── toolbar.component.ts
│   │   ├── button-group.component.ts
│   │   ├── dropdown.component.ts
│   │   └── color-picker.component.ts
│   ├── controls/         # Individual toolbar controls
│   │   ├── bold-control.component.ts
│   │   ├── italic-control.component.ts
│   │   ├── link-control.component.ts
│   │   └── list-control.component.ts
│   └── services/         # Toolbar-specific services
│       └── toolbar-state.service.ts
├── editor-plugins/        # Plugin system and base plugins
│   ├── core/             # Plugin infrastructure
│   │   ├── plugin-registry.service.ts
│   │   ├── plugin-manager.service.ts
│   │   └── base-plugin.class.ts
│   ├── formatting/       # Text formatting plugins
│   │   ├── bold-plugin.ts
│   │   ├── italic-plugin.ts
│   │   ├── underline-plugin.ts
│   │   └── strike-plugin.ts
│   ├── blocks/           # Block-level plugins
│   │   ├── heading-plugin.ts
│   │   ├── paragraph-plugin.ts
│   │   ├── blockquote-plugin.ts
│   │   └── code-block-plugin.ts
│   └── extensions/       # Advanced feature plugins
│       ├── link-plugin.ts
│       ├── list-plugin.ts
│       └── emoji-plugin.ts
├── editor-formats/        # Text formatting and styling
│   ├── services/         # Formatting services
│   │   ├── format.service.ts
│   │   ├── style.service.ts
│   │   └── markup.service.ts
│   ├── formatters/       # Specific format handlers
│   │   ├── text-formatter.ts
│   │   ├── block-formatter.ts
│   │   └── inline-formatter.ts
│   └── interfaces/       # Format-specific types
│       └── format.interface.ts
├── editor-media/          # Media handling and embedding
│   ├── components/       # Media UI components
│   │   ├── image.component.ts
│   │   ├── video.component.ts
│   │   ├── file-upload.component.ts
│   │   └── embed.component.ts
│   ├── services/         # Media services
│   │   ├── media-upload.service.ts
│   │   ├── media-validation.service.ts
│   │   └── media-resize.service.ts
│   └── interfaces/       # Media-specific types
│       └── media.interface.ts
├── editor-tables/         # Table management and editing
│   ├── components/       # Table components
│   │   ├── table.component.ts
│   │   ├── table-row.component.ts
│   │   ├── table-cell.component.ts
│   │   └── table-toolbar.component.ts
│   ├── services/         # Table services
│   │   ├── table.service.ts
│   │   └── table-selection.service.ts
│   └── interfaces/       # Table-specific types
│       └── table.interface.ts
└── editor-themes/         # Theming and visual customization
    ├── services/         # Theme services
    │   ├── theme.service.ts
    │   └── css-variables.service.ts
    ├── themes/           # Predefined themes
    │   ├── default-theme.ts
    │   ├── dark-theme.ts
    │   └── minimal-theme.ts
    └── utilities/        # Theme utilities
        └── theme-utils.ts
```

## Signal-Based State Management

### Core State Architecture

```typescript
// Core editor state using Angular Signals
@Injectable({ providedIn: 'root' })
export class EditorStateService {
  // Private source signals
  private readonly _document = signal<DocumentModel>(createEmptyDocument());
  private readonly _selection = signal<SelectionState | null>(null);
  private readonly _config = signal<EditorConfig>(defaultEditorConfig);
  private readonly _mode = signal<EditorMode>('edit');
  private readonly _focus = signal<boolean>(false);
  
  // Public readonly computed signals
  readonly document = computed(() => this._document());
  readonly selection = computed(() => this._selection());
  readonly config = computed(() => this._config());
  readonly mode = computed(() => this._mode());
  readonly focus = computed(() => this._focus());
  
  // Content-derived signals
  readonly content = computed(() => this._document().content);
  readonly isEmpty = computed(() => this._document().blocks.length === 0);
  readonly wordCount = computed(() => this.calculateWordCount(this._document()));
  readonly characterCount = computed(() => this.calculateCharacterCount(this._document()));
  
  // Selection-derived signals
  readonly hasSelection = computed(() => {
    const selection = this._selection();
    return selection && !selection.collapsed;
  });
  
  readonly selectedText = computed(() => {
    const selection = this._selection();
    const document = this._document();
    return selection ? this.extractSelectedText(document, selection) : '';
  });
  
  readonly canUndo = computed(() => this.historyService.canUndo());
  readonly canRedo = computed(() => this.historyService.canRedo());
  
  // Editor state metadata
  readonly editorMetadata = computed(() => ({
    documentLength: this._document().blocks.length,
    wordCount: this.wordCount(),
    characterCount: this.characterCount(),
    hasUnsavedChanges: this.historyService.hasUnsavedChanges(),
    lastModified: this._document().lastModified,
    mode: this._mode(),
    isActive: this._focus()
  }));
  
  constructor(
    private historyService: HistoryService,
    private sanitizationService: SanitizationService
  ) {}
  
  // State update methods
  updateDocument(update: (current: DocumentModel) => DocumentModel): void {
    this._document.update(current => {
      const updated = update(current);
      return this.sanitizationService.sanitizeDocument(updated);
    });
  }
  
  updateSelection(selection: SelectionState | null): void {
    this._selection.set(selection);
  }
  
  updateConfig(config: Partial<EditorConfig>): void {
    this._config.update(current => ({ ...current, ...config }));
  }
  
  setMode(mode: EditorMode): void {
    this._mode.set(mode);
  }
  
  setFocus(focused: boolean): void {
    this._focus.set(focused);
  }
  
  // Batch multiple updates for performance
  batchUpdate(updates: () => void): void {
    batch(() => {
      updates();
    });
  }
}
```

### Specialized Signal Services

```typescript
// Formatting state management
@Injectable()
export class FormattingSignalService {
  private readonly _activeFormats = signal<Set<FormatType>>(new Set());
  private readonly _availableFormats = signal<FormatDefinition[]>([]);
  
  readonly activeFormats = computed(() => this._activeFormats());
  readonly availableFormats = computed(() => this._availableFormats());
  
  readonly formatStates = computed(() => {
    const active = this._activeFormats();
    const available = this._availableFormats();
    
    return available.map(format => ({
      ...format,
      isActive: active.has(format.type),
      isAvailable: this.isFormatAvailable(format)
    }));
  });
  
  readonly canFormat = computed(() => {
    const selection = this.editorState.selection();
    return selection && !selection.collapsed;
  });
  
  // Format operations
  toggleFormat(formatType: FormatType): void {
    this._activeFormats.update(current => {
      const newFormats = new Set(current);
      if (newFormats.has(formatType)) {
        newFormats.delete(formatType);
      } else {
        newFormats.add(formatType);
      }
      return newFormats;
    });
  }
  
  clearFormats(): void {
    this._activeFormats.set(new Set());
  }
  
  setActiveFormats(formats: FormatType[]): void {
    this._activeFormats.set(new Set(formats));
  }
}
```

## Component Architecture

### Main Editor Component

```typescript
@Component({
  selector: 'blg-editor',
  template: `
    <div 
      class="blg-editor-container"
      [class]="editorClasses()"
      [attr.data-mode]="mode()"
      [attr.aria-label]="config().ariaLabel">
      
      <blg-editor-toolbar
        *ngIf="config().showToolbar"
        [config]="toolbarConfig()"
        [editorState]="editorState()"
        (command)="executeCommand($event)">
      </blg-editor-toolbar>
      
      <blg-editor-content
        class="blg-editor-content"
        [document]="document()"
        [selection]="selection()"
        [config]="config()"
        [plugins]="enabledPlugins()"
        (documentChange)="onDocumentChange($event)"
        (selectionChange)="onSelectionChange($event)"
        (command)="executeCommand($event)">
      </blg-editor-content>
      
      <blg-editor-footer
        *ngIf="config().showFooter"
        [metadata]="editorMetadata()"
        [config]="footerConfig()">
      </blg-editor-footer>
      
      <blg-editor-dialogs
        [dialogState]="dialogState()"
        (dialogAction)="onDialogAction($event)">
      </blg-editor-dialogs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    BlgEditorToolbarComponent,
    BlgEditorContentComponent,
    BlgEditorFooterComponent,
    BlgEditorDialogsComponent
  ]
})
export class BlgEditorComponent implements OnInit, OnDestroy {
  // Input signals
  config = input.required<EditorConfig>();
  initialContent = input<DocumentModel>();
  
  // Output signals
  contentChange = output<DocumentModel>();
  selectionChange = output<SelectionState>();
  stateChange = output<EditorMetadata>();
  
  // Computed signals
  document = computed(() => this.editorState.document());
  selection = computed(() => this.editorState.selection());
  mode = computed(() => this.editorState.mode());
  editorMetadata = computed(() => this.editorState.editorMetadata());
  
  readonly editorClasses = computed(() => [
    'blg-editor',
    `blg-editor--${this.mode()}`,
    this.config().theme,
    {
      'blg-editor--focused': this.editorState.focus(),
      'blg-editor--readonly': this.mode() === 'readonly',
      'blg-editor--disabled': this.mode() === 'disabled'
    }
  ]);
  
  readonly toolbarConfig = computed(() => ({
    ...this.config().toolbar,
    plugins: this.enabledPlugins()
  }));
  
  readonly enabledPlugins = computed(() => 
    this.pluginManager.getEnabledPlugins()
  );
  
  private destroyRef = inject(DestroyRef);
  
  constructor(
    private editorState: EditorStateService,
    private commandService: CommandService,
    private pluginManager: PluginManagerService,
    private historyService: HistoryService
  ) {
    this.setupEffects();
  }
  
  ngOnInit(): void {
    // Initialize editor with configuration
    this.editorState.updateConfig(this.config());
    
    // Set initial content if provided
    const initialContent = this.initialContent();
    if (initialContent) {
      this.editorState.updateDocument(() => initialContent);
    }
    
    // Initialize plugins
    this.pluginManager.initializePlugins(this.config().plugins || []);
  }
  
  executeCommand(command: EditorCommand): void {
    this.commandService.execute(command);
  }
  
  onDocumentChange(document: DocumentModel): void {
    this.contentChange.emit(document);
  }
  
  onSelectionChange(selection: SelectionState): void {
    this.selectionChange.emit(selection);
  }
  
  onDialogAction(action: DialogAction): void {
    this.commandService.execute(action.command);
  }
  
  private setupEffects(): void {
    // Track state changes for output emission
    effect(() => {
      const metadata = this.editorMetadata();
      this.stateChange.emit(metadata);
    });
    
    // Save state to localStorage if configured
    effect(() => {
      const config = this.config();
      if (config.autoSave) {
        const document = this.document();
        this.saveToLocalStorage(document);
      }
    });
  }
  
  private saveToLocalStorage(document: DocumentModel): void {
    // Debounced save implementation
    // Implementation details...
  }
}
```

### Content Editor Component

```typescript
@Component({
  selector: 'blg-editor-content',
  template: `
    <div
      #editorContainer
      class="blg-editor-content-container"
      [contentEditable]="isEditable()"
      [attr.aria-multiline]="true"
      [attr.role]="'textbox'"
      [attr.aria-label]="'Rich text editor'"
      (input)="onInput($event)"
      (keydown)="onKeyDown($event)"
      (focus)="onFocus()"
      (blur)="onBlur()"
      (selectionchange)="onSelectionChange()"
      (paste)="onPaste($event)"
      (drop)="onDrop($event)">
      
      <blg-editor-block
        *ngFor="let block of document().blocks; trackBy: blockTrackBy"
        [block]="block"
        [selection]="selection()"
        [config]="config()"
        [plugins]="plugins()"
        (blockChange)="onBlockChange($event)"
        (command)="command.emit($event)">
      </blg-editor-block>
      
      <!-- Virtual scrolling for large documents -->
      <cdk-virtual-scroll-viewport
        *ngIf="shouldUseVirtualScrolling()"
        class="blg-editor-virtual-viewport"
        [itemSize]="estimatedBlockHeight()"
        [minBufferPx]="virtualScrollConfig().minBuffer"
        [maxBufferPx]="virtualScrollConfig().maxBuffer">
        
        <blg-editor-block
          *cdkVirtualFor="let block of document().blocks; 
                          index as i; 
                          trackBy: blockTrackBy"
          [block]="block"
          [index]="i"
          [selection]="selection()"
          [config]="config()"
          [plugins]="plugins()"
          (blockChange)="onBlockChange($event)"
          (command)="command.emit($event)">
        </blg-editor-block>
      </cdk-virtual-scroll-viewport>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgEditorContentComponent {
  document = input.required<DocumentModel>();
  selection = input<SelectionState>();
  config = input.required<EditorConfig>();
  plugins = input<EditorPlugin[]>();
  
  documentChange = output<DocumentModel>();
  selectionChange = output<SelectionState>();
  command = output<EditorCommand>();
  
  @ViewChild('editorContainer', { static: true }) 
  editorContainer!: ElementRef<HTMLDivElement>;
  
  readonly isEditable = computed(() => 
    this.config().mode === 'edit'
  );
  
  readonly shouldUseVirtualScrolling = computed(() => 
    this.document().blocks.length > this.config().virtualScrollThreshold
  );
  
  readonly estimatedBlockHeight = computed(() => 
    this.config().ui.lineHeight * 1.5
  );
  
  readonly virtualScrollConfig = computed(() => 
    this.config().virtualScroll
  );
  
  blockTrackBy = (index: number, block: BlockModel): string => 
    block.id;
  
  // Event handlers with optimized change detection
  onInput(event: Event): void {
    const target = event.target as HTMLElement;
    const document = this.parseContentToDocument(target);
    this.documentChange.emit(document);
  }
  
  onKeyDown(event: KeyboardEvent): void {
    // Handle keyboard shortcuts and commands
    const command = this.parseKeyboardEvent(event);
    if (command) {
      event.preventDefault();
      this.command.emit(command);
    }
  }
  
  onSelectionChange(): void {
    const selection = this.getCurrentSelection();
    this.selectionChange.emit(selection);
  }
  
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasteData = this.processPasteData(event);
    this.command.emit({
      type: 'paste',
      data: pasteData
    });
  }
  
  private parseContentToDocument(element: HTMLElement): DocumentModel {
    // Implementation for parsing DOM to document model
    return this.domParser.parseToDocument(element);
  }
  
  private getCurrentSelection(): SelectionState | null {
    // Implementation for getting current selection
    return this.selectionService.getCurrentSelection();
  }
}
```

## Plugin System

### Plugin Interface and Base Implementation

```typescript
// Core plugin interface
export interface EditorPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly dependencies?: string[];
  
  // Lifecycle hooks
  initialize?(editor: BlgEditorComponent): void;
  destroy?(): void;
  
  // Configuration
  getConfig?(): PluginConfig;
  setConfig?(config: Partial<PluginConfig>): void;
  
  // Command handling
  canExecuteCommand?(command: EditorCommand): boolean;
  executeCommand?(command: EditorCommand): CommandResult;
  
  // Content processing
  processContent?(content: string): string;
  validateContent?(content: string): ValidationResult;
  
  // UI integration
  getToolbarItems?(): ToolbarItem[];
  getMenuItems?(): MenuItem[];
  getKeyboardShortcuts?(): KeyboardShortcut[];
}

// Base plugin class with common functionality
export abstract class BaseEditorPlugin implements EditorPlugin {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  
  protected editor?: BlgEditorComponent;
  protected config: PluginConfig = {};
  protected destroyRef = new Subject<void>();
  
  initialize(editor: BlgEditorComponent): void {
    this.editor = editor;
    this.onInitialize();
  }
  
  destroy(): void {
    this.onDestroy();
    this.destroyRef.next();
    this.destroyRef.complete();
  }
  
  getConfig(): PluginConfig {
    return { ...this.config };
  }
  
  setConfig(config: Partial<PluginConfig>): void {
    this.config = { ...this.config, ...config };
    this.onConfigChange(config);
  }
  
  // Protected template methods
  protected onInitialize(): void {}
  protected onDestroy(): void {}
  protected onConfigChange(config: Partial<PluginConfig>): void {}
  
  // Utility methods for plugins
  protected executeCommand(command: EditorCommand): void {
    if (this.editor) {
      this.editor.executeCommand(command);
    }
  }
  
  protected getEditorState(): EditorStateService {
    return inject(EditorStateService);
  }
  
  protected subscribeToEditor<T>(
    selector: () => T,
    callback: (value: T) => void
  ): void {
    effect(() => {
      const value = selector();
      callback(value);
    }, { 
      manualCleanup: true,
      injector: this.editor?.injector 
    });
  }
}
```

### Plugin Manager Service

```typescript
@Injectable({ providedIn: 'root' })
export class PluginManagerService {
  private readonly _plugins = signal<Map<string, EditorPlugin>>(new Map());
  private readonly _enabledPlugins = signal<Set<string>>(new Set());
  private readonly _pluginOrder = signal<string[]>([]);
  
  readonly plugins = computed(() => this._plugins());
  readonly enabledPlugins = computed(() => 
    Array.from(this._enabledPlugins())
      .map(id => this._plugins().get(id))
      .filter(Boolean) as EditorPlugin[]
  );
  
  readonly pluginMetadata = computed(() => {
    const plugins = this._plugins();
    return Array.from(plugins.values()).map(plugin => ({
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      enabled: this._enabledPlugins().has(plugin.id),
      dependencies: plugin.dependencies || []
    }));
  });
  
  // Plugin registration
  registerPlugin(plugin: EditorPlugin): void {
    this._plugins.update(current => {
      const newPlugins = new Map(current);
      newPlugins.set(plugin.id, plugin);
      return newPlugins;
    });
  }
  
  unregisterPlugin(pluginId: string): void {
    const plugin = this._plugins().get(pluginId);
    if (plugin) {
      plugin.destroy?.();
      
      this._plugins.update(current => {
        const newPlugins = new Map(current);
        newPlugins.delete(pluginId);
        return newPlugins;
      });
      
      this._enabledPlugins.update(current => {
        const newEnabled = new Set(current);
        newEnabled.delete(pluginId);
        return newEnabled;
      });
    }
  }
  
  // Plugin activation
  enablePlugin(pluginId: string): void {
    const plugin = this._plugins().get(pluginId);
    if (plugin && this.validateDependencies(plugin)) {
      this._enabledPlugins.update(current => 
        new Set([...current, pluginId])
      );
    }
  }
  
  disablePlugin(pluginId: string): void {
    // Check if other plugins depend on this one
    const dependentPlugins = this.getDependentPlugins(pluginId);
    if (dependentPlugins.length > 0) {
      throw new Error(
        `Cannot disable plugin ${pluginId} - other plugins depend on it: ${dependentPlugins.join(', ')}`
      );
    }
    
    this._enabledPlugins.update(current => {
      const newEnabled = new Set(current);
      newEnabled.delete(pluginId);
      return newEnabled;
    });
  }
  
  // Plugin initialization
  initializePlugins(pluginConfigs: PluginConfiguration[]): void {
    // Sort by dependencies first
    const sortedPlugins = this.sortByDependencies(pluginConfigs);
    
    sortedPlugins.forEach(config => {
      const plugin = this._plugins().get(config.id);
      if (plugin) {
        try {
          plugin.setConfig?.(config.config || {});
          plugin.initialize?.(this.editor);
          
          if (config.enabled !== false) {
            this.enablePlugin(config.id);
          }
        } catch (error) {
          console.error(`Failed to initialize plugin ${config.id}:`, error);
        }
      }
    });
  }
  
  // Command handling
  canExecuteCommand(command: EditorCommand): EditorPlugin | null {
    const enabledPlugins = this.enabledPlugins();
    
    for (const plugin of enabledPlugins) {
      if (plugin.canExecuteCommand?.(command)) {
        return plugin;
      }
    }
    
    return null;
  }
  
  executeCommand(command: EditorCommand): CommandResult {
    const plugin = this.canExecuteCommand(command);
    if (plugin) {
      return plugin.executeCommand!(command);
    }
    
    return { success: false, error: 'No plugin can handle this command' };
  }
  
  // Utility methods
  private validateDependencies(plugin: EditorPlugin): boolean {
    if (!plugin.dependencies) return true;
    
    const enabled = this._enabledPlugins();
    return plugin.dependencies.every(dep => enabled.has(dep));
  }
  
  private getDependentPlugins(pluginId: string): string[] {
    const plugins = this._plugins();
    const dependent: string[] = [];
    
    plugins.forEach((plugin, id) => {
      if (plugin.dependencies?.includes(pluginId)) {
        dependent.push(id);
      }
    });
    
    return dependent;
  }
  
  private sortByDependencies(configs: PluginConfiguration[]): PluginConfiguration[] {
    const sorted: PluginConfiguration[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (config: PluginConfiguration) => {
      if (visited.has(config.id)) return;
      if (visiting.has(config.id)) {
        throw new Error(`Circular dependency detected for plugin ${config.id}`);
      }
      
      visiting.add(config.id);
      
      const plugin = this._plugins().get(config.id);
      if (plugin?.dependencies) {
        plugin.dependencies.forEach(depId => {
          const depConfig = configs.find(c => c.id === depId);
          if (depConfig) {
            visit(depConfig);
          }
        });
      }
      
      visiting.delete(config.id);
      visited.add(config.id);
      sorted.push(config);
    };
    
    configs.forEach(visit);
    return sorted;
  }
}
```

## Content Model & Security

### Document Model Structure

```typescript
// Core content model interfaces
export interface DocumentModel {
  readonly id: string;
  readonly version: string;
  readonly created: Date;
  readonly lastModified: Date;
  readonly metadata: DocumentMetadata;
  readonly blocks: ReadonlyArray<BlockModel>;
  readonly content: string; // Serialized representation
}

export interface BlockModel {
  readonly id: string;
  readonly type: BlockType;
  readonly content: string;
  readonly attributes: Record<string, any>;
  readonly children?: ReadonlyArray<BlockModel>;
  readonly inline?: ReadonlyArray<InlineModel>;
}

export interface InlineModel {
  readonly type: InlineType;
  readonly content: string;
  readonly attributes: Record<string, any>;
  readonly start: number;
  readonly end: number;
}

// Document creation and manipulation
export class DocumentBuilder {
  private document: DocumentModel;
  
  constructor(initialDocument?: Partial<DocumentModel>) {
    this.document = {
      id: generateId(),
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date(),
      metadata: {},
      blocks: [],
      content: '',
      ...initialDocument
    };
  }
  
  addBlock(block: BlockModel): DocumentBuilder {
    this.document = {
      ...this.document,
      blocks: [...this.document.blocks, block],
      lastModified: new Date()
    };
    return this;
  }
  
  insertBlock(index: number, block: BlockModel): DocumentBuilder {
    const blocks = [...this.document.blocks];
    blocks.splice(index, 0, block);
    
    this.document = {
      ...this.document,
      blocks,
      lastModified: new Date()
    };
    return this;
  }
  
  updateBlock(blockId: string, updater: (block: BlockModel) => BlockModel): DocumentBuilder {
    const blocks = this.document.blocks.map(block =>
      block.id === blockId ? updater(block) : block
    );
    
    this.document = {
      ...this.document,
      blocks,
      lastModified: new Date()
    };
    return this;
  }
  
  removeBlock(blockId: string): DocumentBuilder {
    const blocks = this.document.blocks.filter(block => block.id !== blockId);
    
    this.document = {
      ...this.document,
      blocks,
      lastModified: new Date()
    };
    return this;
  }
  
  build(): DocumentModel {
    // Update content representation
    const content = this.serializeToHtml(this.document);
    return {
      ...this.document,
      content,
      lastModified: new Date()
    };
  }
  
  private serializeToHtml(document: DocumentModel): string {
    // Implementation for converting document model to HTML
    return document.blocks
      .map(block => this.blockToHtml(block))
      .join('');
  }
  
  private blockToHtml(block: BlockModel): string {
    // Convert block to HTML representation
    const tag = this.getBlockTag(block.type);
    const attributes = this.serializeAttributes(block.attributes);
    const content = block.inline 
      ? this.inlineToHtml(block.inline)
      : block.content;
    
    return `<${tag}${attributes}>${content}</${tag}>`;
  }
  
  private inlineToHtml(inline: ReadonlyArray<InlineModel>): string {
    // Convert inline models to HTML
    return inline
      .map(item => {
        const tag = this.getInlineTag(item.type);
        const attributes = this.serializeAttributes(item.attributes);
        return `<${tag}${attributes}>${item.content}</${tag}>`;
      })
      .join('');
  }
}
```

### Content Security Layer

```typescript
@Injectable({ providedIn: 'root' })
export class ContentSecurityService {
  private readonly allowedTags = new Set([
    'p', 'div', 'span', 'br', 'strong', 'em', 'u', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img'
  ]);
  
  private readonly allowedAttributes = new Map([
    ['*', ['id', 'class', 'data-*']],
    ['a', ['href', 'target', 'rel', 'title']],
    ['img', ['src', 'alt', 'title', 'width', 'height']],
    ['table', ['border', 'cellpadding', 'cellspacing']],
    ['th', ['colspan', 'rowspan', 'scope']],
    ['td', ['colspan', 'rowspan']]
  ]);
  
  private readonly dangerousProtocols = new Set([
    'javascript:', 'vbscript:', 'data:', 'file:'
  ]);
  
  // Sanitize HTML content
  sanitizeHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    this.sanitizeElement(doc.body);
    return doc.body.innerHTML;
  }
  
  // Sanitize document model
  sanitizeDocument(document: DocumentModel): DocumentModel {
    const sanitizedBlocks = document.blocks.map(block => 
      this.sanitizeBlock(block)
    );
    
    return {
      ...document,
      blocks: sanitizedBlocks,
      content: this.sanitizeHtml(document.content)
    };
  }
  
  // Validate and sanitize user input
  validateInput(input: string, context: InputContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitized: input,
      warnings: [],
      errors: []
    };
    
    try {
      // Check for malicious content
      if (this.containsMaliciousContent(input)) {
        result.errors.push('Content contains potentially malicious code');
        result.isValid = false;
      }
      
      // Sanitize the input
      result.sanitized = this.sanitizeHtml(input);
      
      // Check content length
      if (input.length > context.maxLength) {
        result.warnings.push(`Content exceeds maximum length of ${context.maxLength}`);
        result.sanitized = result.sanitized.substring(0, context.maxLength);
      }
      
      // Validate URLs if present
      const urlViolations = this.validateUrls(input);
      if (urlViolations.length > 0) {
        result.warnings.push(...urlViolations);
      }
      
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }
    
    return result;
  }
  
  private sanitizeElement(element: Element): void {
    // Remove disallowed tags
    if (!this.allowedTags.has(element.tagName.toLowerCase())) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    
    // Sanitize attributes
    const allowedAttrs = this.getAllowedAttributes(element.tagName.toLowerCase());
    Array.from(element.attributes).forEach(attr => {
      if (!this.isAttributeAllowed(attr.name, allowedAttrs)) {
        element.removeAttribute(attr.name);
      } else {
        // Sanitize attribute values
        element.setAttribute(attr.name, this.sanitizeAttributeValue(attr));
      }
    });
    
    // Recursively sanitize child elements
    Array.from(element.children).forEach(child => {
      this.sanitizeElement(child);
    });
  }
  
  private sanitizeBlock(block: BlockModel): BlockModel {
    return {
      ...block,
      content: this.sanitizeHtml(block.content),
      attributes: this.sanitizeAttributes(block.attributes),
      children: block.children?.map(child => this.sanitizeBlock(child)),
      inline: block.inline?.map(inline => this.sanitizeInline(inline))
    };
  }
  
  private sanitizeInline(inline: InlineModel): InlineModel {
    return {
      ...inline,
      content: this.sanitizeHtml(inline.content),
      attributes: this.sanitizeAttributes(inline.attributes)
    };
  }
  
  private sanitizeAttributes(attributes: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (this.isAttributeNameSafe(key)) {
        sanitized[key] = this.sanitizeAttributeValue({ name: key, value: String(value) });
      }
    });
    
    return sanitized;
  }
  
  private containsMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b/gi,
      /<object\b/gi,
      /<embed\b/gi,
      /<link\b/gi,
      /<meta\b/gi
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(content));
  }
  
  private validateUrls(content: string): string[] {
    const violations: string[] = [];
    const urlPattern = /https?:\/\/[^\s"'<>]+/gi;
    const urls = content.match(urlPattern) || [];
    
    urls.forEach(url => {
      try {
        const parsed = new URL(url);
        
        // Check for dangerous protocols
        if (this.dangerousProtocols.has(parsed.protocol)) {
          violations.push(`Dangerous protocol detected: ${parsed.protocol}`);
        }
        
        // Check for suspicious domains (implement your own logic)
        if (this.isSuspiciousDomain(parsed.hostname)) {
          violations.push(`Suspicious domain detected: ${parsed.hostname}`);
        }
        
      } catch (error) {
        violations.push(`Invalid URL format: ${url}`);
      }
    });
    
    return violations;
  }
  
  private getAllowedAttributes(tagName: string): string[] {
    const globalAttrs = this.allowedAttributes.get('*') || [];
    const tagAttrs = this.allowedAttributes.get(tagName) || [];
    return [...globalAttrs, ...tagAttrs];
  }
  
  private isAttributeAllowed(attrName: string, allowedAttrs: string[]): boolean {
    return allowedAttrs.some(allowed => {
      if (allowed.endsWith('*')) {
        const prefix = allowed.slice(0, -1);
        return attrName.startsWith(prefix);
      }
      return allowed === attrName;
    });
  }
  
  private isAttributeNameSafe(name: string): boolean {
    // Prevent attribute names that could be dangerous
    const dangerousPatterns = [
      /^on/i,        // Event handlers
      /^javascript:/i,
      /^vbscript:/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(name));
  }
  
  private sanitizeAttributeValue(attr: { name: string; value: string }): string {
    let value = attr.value;
    
    // URL sanitization
    if (attr.name === 'href' || attr.name === 'src') {
      try {
        const url = new URL(value, window.location.origin);
        if (this.dangerousProtocols.has(url.protocol)) {
          return '#'; // Safe fallback
        }
        value = url.href;
      } catch {
        return '#'; // Invalid URL, use safe fallback
      }
    }
    
    // HTML encode the value
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  private isSuspiciousDomain(hostname: string): boolean {
    // Implement your own suspicious domain logic
    const suspiciousDomains = [
      // Add domains to block
    ];
    
    return suspiciousDomains.some(domain => 
      hostname.includes(domain)
    );
  }
}
```

## Performance Optimizations

### Virtual Scrolling for Large Documents

```typescript
@Component({
  selector: 'blg-editor-virtual-content',
  template: `
    <cdk-virtual-scroll-viewport
      class="blg-editor-virtual-viewport"
      [itemSize]="itemSize()"
      [minBufferPx]="bufferConfig().min"
      [maxBufferPx]="bufferConfig().max">
      
      <blg-editor-block
        *cdkVirtualFor="let block of blocks(); 
                        index as i; 
                        trackBy: trackByFn"
        [block]="block"
        [index]="i"
        [isVirtual]="true"
        [selection]="selection()"
        [config]="config()"
        (blockChange)="onBlockChange(i, $event)">
      </blg-editor-block>
    </cdk-virtual-scroll-viewport>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgEditorVirtualContentComponent {
  blocks = input.required<BlockModel[]>();
  selection = input<SelectionState>();
  config = input.required<EditorConfig>();
  
  blockChange = output<{ index: number; block: BlockModel }>();
  
  readonly itemSize = computed(() => {
    const lineHeight = this.config().ui.lineHeight;
    const density = this.config().ui.density;
    
    const multiplier = density === 'compact' ? 1.2 : 
                      density === 'comfortable' ? 1.5 : 1.8;
    
    return Math.ceil(lineHeight * multiplier);
  });
  
  readonly bufferConfig = computed(() => {
    const viewportHeight = window.innerHeight;
    const itemSize = this.itemSize();
    
    return {
      min: Math.ceil(viewportHeight / itemSize) * itemSize,
      max: Math.ceil(viewportHeight / itemSize) * itemSize * 2
    };
  });
  
  trackByFn = (index: number, block: BlockModel): string => block.id;
  
  onBlockChange(index: number, block: BlockModel): void {
    this.blockChange.emit({ index, block });
  }
}
```

### Optimized Change Detection Strategy

```typescript
// Change detection optimization service
@Injectable()
export class ChangeDetectionOptimizationService {
  private changeBuffer = new Map<string, any>();
  private batchTimeout: number | null = null;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  // Batch multiple changes for optimal performance
  batchChanges<T>(key: string, value: T, callback: () => void): void {
    this.changeBuffer.set(key, value);
    
    if (this.batchTimeout === null) {
      this.batchTimeout = window.setTimeout(() => {
        this.flushChanges();
        callback();
        this.batchTimeout = null;
      }, 16); // ~60fps
    }
  }
  
  private flushChanges(): void {
    if (this.changeBuffer.size > 0) {
      this.cdr.detectChanges();
      this.changeBuffer.clear();
    }
  }
  
  // Optimized signal updates with batching
  createOptimizedSignal<T>(
    initialValue: T,
    equalityFn?: (a: T, b: T) => boolean
  ): WritableSignal<T> {
    return signal(initialValue, {
      equal: equalityFn || ((a, b) => a === b)
    });
  }
  
  // Throttled updates for high-frequency events
  throttleUpdates<T>(
    signal: WritableSignal<T>,
    throttleMs: number = 16
  ): (value: T) => void {
    let lastUpdate = 0;
    let pendingValue: T | undefined = undefined;
    let timeoutId: number | null = null;
    
    return (value: T) => {
      const now = Date.now();
      
      if (now - lastUpdate >= throttleMs) {
        signal.set(value);
        lastUpdate = now;
      } else {
        pendingValue = value;
        
        if (timeoutId === null) {
          const remaining = throttleMs - (now - lastUpdate);
          timeoutId = window.setTimeout(() => {
            if (pendingValue !== undefined) {
              signal.set(pendingValue);
              pendingValue = undefined;
              lastUpdate = Date.now();
            }
            timeoutId = null;
          }, remaining);
        }
      }
    };
  }
}
```

## Event System

### Command Pattern Implementation

```typescript
// Command interface and base implementations
export interface EditorCommand {
  readonly type: string;
  readonly data?: any;
  readonly metadata?: CommandMetadata;
  
  execute(context: EditorContext): CommandResult;
  undo?(context: EditorContext): CommandResult;
  redo?(context: EditorContext): CommandResult;
  canUndo?(): boolean;
  canRedo?(): boolean;
}

export interface CommandResult {
  success: boolean;
  error?: string;
  data?: any;
  changes?: DocumentChange[];
}

// Base command implementation
export abstract class BaseEditorCommand implements EditorCommand {
  abstract readonly type: string;
  
  constructor(
    public readonly data?: any,
    public readonly metadata?: CommandMetadata
  ) {}
  
  abstract execute(context: EditorContext): CommandResult;
  
  undo(context: EditorContext): CommandResult {
    return { success: false, error: 'Undo not implemented' };
  }
  
  redo(context: EditorContext): CommandResult {
    return this.execute(context);
  }
  
  canUndo(): boolean {
    return false;
  }
  
  canRedo(): boolean {
    return true;
  }
}

// Text formatting command
export class FormatTextCommand extends BaseEditorCommand {
  readonly type = 'format-text';
  
  constructor(
    data: {
      format: FormatType;
      range: SelectionRange;
      value?: any;
    }
  ) {
    super(data);
  }
  
  execute(context: EditorContext): CommandResult {
    try {
      const { format, range, value } = this.data;
      const document = context.document;
      
      // Apply formatting to the specified range
      const updatedDocument = this.applyFormatting(document, format, range, value);
      
      context.updateDocument(updatedDocument);
      
      return {
        success: true,
        data: { format, range, value },
        changes: [
          {
            type: 'format',
            blockId: this.getBlockId(document, range),
            range,
            format,
            value
          }
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to apply formatting: ${error.message}`
      };
    }
  }
  
  undo(context: EditorContext): CommandResult {
    // Implementation for undoing text formatting
    return { success: true };
  }
  
  canUndo(): boolean {
    return true;
  }
  
  private applyFormatting(
    document: DocumentModel, 
    format: FormatType, 
    range: SelectionRange,
    value?: any
  ): DocumentModel {
    // Implementation for applying formatting
    return document; // Placeholder
  }
  
  private getBlockId(document: DocumentModel, range: SelectionRange): string {
    // Implementation for getting block ID from range
    return 'block-id'; // Placeholder
  }
}
```

### Command Service with History

```typescript
@Injectable({ providedIn: 'root' })
export class CommandService {
  private readonly _history = signal<CommandHistory>({
    commands: [],
    currentIndex: -1,
    maxSize: 100
  });
  
  private readonly _isExecuting = signal<boolean>(false);
  
  readonly history = computed(() => this._history());
  readonly canUndo = computed(() => this._history().currentIndex >= 0);
  readonly canRedo = computed(() => {
    const history = this._history();
    return history.currentIndex < history.commands.length - 1;
  });
  readonly isExecuting = computed(() => this._isExecuting());
  
  constructor(
    private editorState: EditorStateService,
    private pluginManager: PluginManagerService
  ) {}
  
  // Execute a command
  async execute(command: EditorCommand): Promise<CommandResult> {
    if (this._isExecuting()) {
      return { success: false, error: 'Another command is currently executing' };
    }
    
    this._isExecuting.set(true);
    
    try {
      const context = this.createContext();
      
      // Check if a plugin can handle this command
      const plugin = this.pluginManager.canExecuteCommand(command);
      
      let result: CommandResult;
      if (plugin) {
        result = await plugin.executeCommand!(command);
      } else {
        result = await command.execute(context);
      }
      
      if (result.success) {
        this.addToHistory(command);
        
        // Emit command executed event
        this.emitCommandEvent('executed', command, result);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Command execution failed: ${error.message}`
      };
    } finally {
      this._isExecuting.set(false);
    }
  }
  
  // Undo the last command
  async undo(): Promise<CommandResult> {
    if (!this.canUndo() || this._isExecuting()) {
      return { success: false, error: 'Cannot undo' };
    }
    
    this._isExecuting.set(true);
    
    try {
      const history = this._history();
      const command = history.commands[history.currentIndex];
      
      if (!command.canUndo?.()) {
        return { success: false, error: 'Command cannot be undone' };
      }
      
      const context = this.createContext();
      const result = await command.undo!(context);
      
      if (result.success) {
        this._history.update(current => ({
          ...current,
          currentIndex: current.currentIndex - 1
        }));
        
        this.emitCommandEvent('undone', command, result);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Undo failed: ${error.message}`
      };
    } finally {
      this._isExecuting.set(false);
    }
  }
  
  // Redo the next command
  async redo(): Promise<CommandResult> {
    if (!this.canRedo() || this._isExecuting()) {
      return { success: false, error: 'Cannot redo' };
    }
    
    this._isExecuting.set(true);
    
    try {
      const history = this._history();
      const command = history.commands[history.currentIndex + 1];
      
      const context = this.createContext();
      const result = await command.redo!(context);
      
      if (result.success) {
        this._history.update(current => ({
          ...current,
          currentIndex: current.currentIndex + 1
        }));
        
        this.emitCommandEvent('redone', command, result);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Redo failed: ${error.message}`
      };
    } finally {
      this._isExecuting.set(false);
    }
  }
  
  // Batch multiple commands
  async executeBatch(commands: EditorCommand[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];
    
    // Execute commands sequentially
    for (const command of commands) {
      const result = await this.execute(command);
      results.push(result);
      
      // Stop on first failure if not configured to continue
      if (!result.success && !command.metadata?.continueOnError) {
        break;
      }
    }
    
    return results;
  }
  
  // Clear command history
  clearHistory(): void {
    this._history.set({
      commands: [],
      currentIndex: -1,
      maxSize: 100
    });
  }
  
  private createContext(): EditorContext {
    return {
      document: this.editorState.document(),
      selection: this.editorState.selection(),
      config: this.editorState.config(),
      updateDocument: (doc: DocumentModel) => {
        this.editorState.updateDocument(() => doc);
      },
      updateSelection: (selection: SelectionState | null) => {
        this.editorState.updateSelection(selection);
      }
    };
  }
  
  private addToHistory(command: EditorCommand): void {
    this._history.update(current => {
      const newCommands = [...current.commands];
      
      // Remove commands after current index (for redo scenarios)
      newCommands.splice(current.currentIndex + 1);
      
      // Add new command
      newCommands.push(command);
      
      // Maintain max size
      if (newCommands.length > current.maxSize) {
        newCommands.shift();
      }
      
      return {
        ...current,
        commands: newCommands,
        currentIndex: newCommands.length - 1
      };
    });
  }
  
  private emitCommandEvent(
    type: 'executed' | 'undone' | 'redone',
    command: EditorCommand,
    result: CommandResult
  ): void {
    // Emit to event bus or notify listeners
    // Implementation depends on your event system
  }
}
```

## TypeScript Interfaces

### Core Type Definitions

```typescript
// Editor Configuration Interface
export interface EditorConfig {
  // Core settings
  mode: EditorMode;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  
  // Content settings
  maxLength?: number;
  allowedFormats?: FormatType[];
  allowedBlocks?: BlockType[];
  
  // UI settings
  showToolbar?: boolean;
  showFooter?: boolean;
  theme?: string;
  ui: EditorUIConfig;
  
  // Feature toggles
  features: EditorFeatures;
  
  // Toolbar configuration
  toolbar?: ToolbarConfig;
  
  // Plugin configuration
  plugins?: PluginConfiguration[];
  
  // Performance settings
  virtualScrollThreshold?: number;
  virtualScroll?: VirtualScrollConfig;
  
  // Security settings
  security?: SecurityConfig;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface EditorUIConfig {
  density: 'compact' | 'comfortable' | 'spacious';
  lineHeight: number;
  fontFamily?: string;
  fontSize?: number;
  borderRadius?: number;
  showLineNumbers?: boolean;
  highlightActiveLine?: boolean;
}

export interface EditorFeatures {
  formatting: boolean | FormattingConfig;
  links: boolean | LinkConfig;
  media: boolean | MediaConfig;
  tables: boolean | TableConfig;
  lists: boolean | ListConfig;
  collaboration: boolean | CollaborationConfig;
  spellcheck: boolean | SpellcheckConfig;
  autoSave: boolean | AutoSaveConfig;
  history: boolean | HistoryConfig;
}

// Content Model Types
export type EditorMode = 'edit' | 'readonly' | 'preview' | 'disabled';

export type BlockType = 
  | 'paragraph'
  | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6'
  | 'blockquote'
  | 'code-block'
  | 'list-item'
  | 'table'
  | 'media'
  | 'divider'
  | 'custom';

export type InlineType =
  | 'text'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'link'
  | 'emoji'
  | 'custom';

export type FormatType =
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'subscript' | 'superscript'
  | 'highlight' | 'color'
  | 'font-family' | 'font-size'
  | 'alignment' | 'line-height'
  | 'indent' | 'outdent';

// Selection and Range Types
export interface SelectionState {
  readonly start: SelectionPoint;
  readonly end: SelectionPoint;
  readonly collapsed: boolean;
  readonly direction: 'forward' | 'backward' | 'none';
  readonly type: 'range' | 'caret';
}

export interface SelectionPoint {
  readonly blockId: string;
  readonly offset: number;
  readonly inline?: boolean;
}

export interface SelectionRange {
  readonly startBlockId: string;
  readonly startOffset: number;
  readonly endBlockId: string;
  readonly endOffset: number;
}

// Command System Types
export interface CommandMetadata {
  readonly timestamp: number;
  readonly userId?: string;
  readonly description?: string;
  readonly continueOnError?: boolean;
  readonly skipHistory?: boolean;
}

export interface CommandHistory {
  readonly commands: EditorCommand[];
  readonly currentIndex: number;
  readonly maxSize: number;
}

export interface EditorContext {
  readonly document: DocumentModel;
  readonly selection: SelectionState | null;
  readonly config: EditorConfig;
  updateDocument(document: DocumentModel): void;
  updateSelection(selection: SelectionState | null): void;
}

export interface DocumentChange {
  readonly type: 'insert' | 'delete' | 'format' | 'move';
  readonly blockId?: string;
  readonly range?: SelectionRange;
  readonly data?: any;
  readonly format?: FormatType;
  readonly value?: any;
}

// Plugin System Types
export interface PluginConfiguration {
  readonly id: string;
  readonly enabled?: boolean;
  readonly config?: Record<string, any>;
  readonly dependencies?: string[];
}

export interface PluginConfig {
  [key: string]: any;
}

export interface ToolbarItem {
  readonly id: string;
  readonly type: 'button' | 'dropdown' | 'separator' | 'group';
  readonly label?: string;
  readonly icon?: string;
  readonly shortcut?: string;
  readonly command?: EditorCommand;
  readonly items?: ToolbarItem[];
  readonly visible?: () => boolean;
  readonly enabled?: () => boolean;
}

export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly shortcut?: string;
  readonly command?: EditorCommand;
  readonly submenu?: MenuItem[];
  readonly separator?: boolean;
}

export interface KeyboardShortcut {
  readonly key: string;
  readonly command: EditorCommand;
  readonly context?: string;
  readonly preventDefault?: boolean;
}

// Media and Upload Types
export interface MediaItem {
  readonly id: string;
  readonly type: 'image' | 'video' | 'audio' | 'file';
  readonly url: string;
  readonly title?: string;
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
  readonly size?: number;
  readonly mimeType?: string;
}

export interface UploadOptions {
  readonly maxFileSize: number;
  readonly allowedTypes: string[];
  readonly uploadUrl?: string;
  readonly headers?: Record<string, string>;
  readonly onProgress?: (progress: number) => void;
  readonly onComplete?: (media: MediaItem) => void;
  readonly onError?: (error: string) => void;
}

// Security Types
export interface SecurityConfig {
  readonly allowedTags?: string[];
  readonly allowedAttributes?: Record<string, string[]>;
  readonly sanitizeHtml?: boolean;
  readonly maxDocumentSize?: number;
  readonly validateUrls?: boolean;
  readonly contentSecurityPolicy?: ContentSecurityPolicy;
}

export interface ContentSecurityPolicy {
  readonly allowInlineStyles?: boolean;
  readonly allowInlineScripts?: boolean;
  readonly allowExternalResources?: boolean;
  readonly allowedDomains?: string[];
  readonly blockedDomains?: string[];
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly sanitized: string;
  readonly warnings: string[];
  readonly errors: string[];
}

export interface InputContext {
  readonly maxLength: number;
  readonly allowedFormats?: FormatType[];
  readonly allowedBlocks?: BlockType[];
}

// Performance Types
export interface VirtualScrollConfig {
  readonly enabled: boolean;
  readonly itemHeight: number;
  readonly minBuffer: number;
  readonly maxBuffer: number;
  readonly threshold: number;
}

export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly changeDetectionTime: number;
  readonly commandExecutionTime: number;
  readonly documentSize: number;
  readonly memoryUsage?: number;
}

// Theme Types
export interface ThemeConfig {
  readonly id: string;
  readonly name: string;
  readonly colors: ColorScheme;
  readonly typography: TypographyConfig;
  readonly spacing: SpacingConfig;
  readonly borders: BorderConfig;
  readonly shadows: ShadowConfig;
}

export interface ColorScheme {
  readonly primary: string;
  readonly secondary: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly border: string;
  readonly focus: string;
  readonly error: string;
  readonly warning: string;
  readonly success: string;
}

// Event Types
export interface EditorEvent<T = any> {
  readonly type: string;
  readonly data: T;
  readonly timestamp: number;
  readonly target?: EventTarget;
}

export interface DocumentEvent extends EditorEvent<DocumentModel> {
  readonly type: 'document-changed';
}

export interface SelectionEvent extends EditorEvent<SelectionState> {
  readonly type: 'selection-changed';
}

export interface CommandEvent extends EditorEvent<EditorCommand> {
  readonly type: 'command-executed' | 'command-undone' | 'command-redone';
}
```

## Testing Strategy

### Signal-Based Testing Utilities

```typescript
// Editor-specific testing utilities
export class EditorTestingUtils {
  // Create mock editor state for testing
  static createMockEditorState(overrides?: Partial<EditorStateService>): MockEditorState {
    const mockDocument = this.createMockDocument();
    const mockSelection = this.createMockSelection();
    const mockConfig = this.createMockConfig();
    
    return {
      document: signal(mockDocument),
      selection: signal(mockSelection),
      config: signal(mockConfig),
      mode: signal('edit' as EditorMode),
      focus: signal(false),
      updateDocument: jest.fn(),
      updateSelection: jest.fn(),
      updateConfig: jest.fn(),
      setMode: jest.fn(),
      setFocus: jest.fn(),
      ...overrides
    };
  }
  
  // Test command execution
  static async testCommandExecution(
    command: EditorCommand,
    initialState: Partial<EditorContext>,
    expectedResult: Partial<CommandResult>
  ): Promise<void> {
    const context = {
      document: this.createMockDocument(),
      selection: null,
      config: this.createMockConfig(),
      updateDocument: jest.fn(),
      updateSelection: jest.fn(),
      ...initialState
    };
    
    const result = await command.execute(context);
    
    expect(result).toMatchObject(expectedResult);
  }
  
  // Test plugin functionality
  static testPlugin(
    plugin: EditorPlugin,
    testCases: Array<{
      command: EditorCommand;
      expectedResult: Partial<CommandResult>;
    }>
  ): void {
    const mockEditor = this.createMockEditor();
    plugin.initialize?.(mockEditor);
    
    testCases.forEach(({ command, expectedResult }, index) => {
      const canExecute = plugin.canExecuteCommand?.(command) ?? false;
      expect(canExecute).toBe(true, `Plugin should handle command at index ${index}`);
      
      if (canExecute && plugin.executeCommand) {
        const result = plugin.executeCommand(command);
        expect(result).toMatchObject(expectedResult);
      }
    });
  }
  
  // Performance testing for large documents
  static async benchmarkDocumentOperations(
    operations: Array<() => void>,
    documentSize: number,
    iterations: number = 100
  ): Promise<PerformanceBenchmark> {
    const document = this.createLargeDocument(documentSize);
    
    const startTime = performance.now();
    let totalOperationTime = 0;
    
    for (let i = 0; i < iterations; i++) {
      const operationStart = performance.now();
      operations[i % operations.length]();
      totalOperationTime += performance.now() - operationStart;
    }
    
    const totalTime = performance.now() - startTime;
    
    return {
      totalTime,
      averageOperationTime: totalOperationTime / iterations,
      operationsPerSecond: iterations / (totalTime / 1000),
      documentSize,
      iterations
    };
  }
  
  // Mock creation utilities
  private static createMockDocument(): DocumentModel {
    return {
      id: 'mock-document',
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date(),
      metadata: {},
      blocks: [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'Mock paragraph content',
          attributes: {}
        }
      ],
      content: '<p>Mock paragraph content</p>'
    };
  }
  
  private static createMockSelection(): SelectionState {
    return {
      start: { blockId: 'block-1', offset: 0 },
      end: { blockId: 'block-1', offset: 5 },
      collapsed: false,
      direction: 'forward',
      type: 'range'
    };
  }
  
  private static createMockConfig(): EditorConfig {
    return {
      mode: 'edit',
      ui: {
        density: 'comfortable',
        lineHeight: 1.5
      },
      features: {
        formatting: true,
        links: true,
        media: true,
        tables: true,
        lists: true,
        collaboration: false,
        spellcheck: true,
        autoSave: false,
        history: true
      }
    };
  }
  
  private static createLargeDocument(size: number): DocumentModel {
    const blocks: BlockModel[] = [];
    
    for (let i = 0; i < size; i++) {
      blocks.push({
        id: `block-${i}`,
        type: 'paragraph',
        content: `This is paragraph number ${i} with some content to test performance.`,
        attributes: {}
      });
    }
    
    return {
      id: 'large-document',
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date(),
      metadata: { size },
      blocks,
      content: blocks.map(b => `<p>${b.content}</p>`).join('')
    };
  }
}

// Example test cases
describe('EditorStateService', () => {
  let editorState: EditorStateService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditorStateService, HistoryService, ContentSecurityService]
    });
    
    editorState = TestBed.inject(EditorStateService);
  });
  
  it('should update document reactively', () => {
    const newDocument = EditorTestingUtils.createMockDocument();
    
    SignalTestingUtils.testSignalReactivity(
      editorState.document,
      [
        {
          action: () => editorState.updateDocument(() => newDocument),
          expectedValue: newDocument
        }
      ]
    );
  });
  
  it('should compute word count correctly', () => {
    const document = {
      ...EditorTestingUtils.createMockDocument(),
      blocks: [
        {
          id: 'block-1',
          type: 'paragraph' as BlockType,
          content: 'Hello world this is a test',
          attributes: {}
        }
      ]
    };
    
    editorState.updateDocument(() => document);
    
    expect(editorState.wordCount()).toBe(6);
  });
  
  it('should handle large documents efficiently', async () => {
    const benchmark = await EditorTestingUtils.benchmarkDocumentOperations(
      [
        () => editorState.updateDocument(doc => ({ 
          ...doc, 
          lastModified: new Date() 
        })),
        () => editorState.updateSelection({
          start: { blockId: 'block-1', offset: 0 },
          end: { blockId: 'block-1', offset: 5 },
          collapsed: false,
          direction: 'forward',
          type: 'range'
        })
      ],
      1000, // 1000 blocks
      100   // 100 iterations
    );
    
    expect(benchmark.averageOperationTime).toBeLessThan(10); // < 10ms per operation
    expect(benchmark.operationsPerSecond).toBeGreaterThan(100);
  });
});
```

## Key Architectural Decisions Summary

The BLG Editor architecture leverages the following Angular optimizations and design patterns:

### 1. **Signal-Based Reactivity**
- Uses Angular Signals throughout for fine-grained reactivity
- Computed signals for derived state eliminate unnecessary recalculations
- Batched updates prevent signal thrashing during complex operations

### 2. **Standalone Component Architecture**
- All components are standalone, eliminating NgModule overhead
- Lazy loading of feature modules for optimal bundle sizes
- Tree-shakable plugin system for customization

### 3. **Performance-First Design**
- Virtual scrolling for large documents (>1000 blocks)
- OnPush change detection strategy throughout
- Optimized TrackBy functions for list rendering
- Memory-efficient DOM recycling

### 4. **Command Pattern with History**
- All operations are commands that can be undone/redone
- Batched command execution for performance
- Plugin-extensible command system

### 5. **Content Security by Design**
- Built-in HTML sanitization and XSS protection
- Configurable content security policies
- URL validation and protocol filtering

### 6. **Plugin Architecture**
- Dependency injection based plugin system
- Life-cycle aware plugins with proper cleanup
- Type-safe plugin interfaces with full IntelliSense support

### 7. **Accessibility-First Approach**
- WCAG 2.1 AA compliance built-in
- Screen reader optimizations
- Keyboard navigation support

This architecture provides a solid foundation for building a production-ready, Angular-optimized rich text editor that can scale to enterprise requirements while maintaining excellent developer experience and user performance.