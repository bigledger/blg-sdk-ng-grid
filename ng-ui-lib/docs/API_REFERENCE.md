# BLG Angular UI Kit - Complete API Reference

This document provides comprehensive API reference for all components in the BLG Angular UI Kit, including interfaces, types, methods, and configuration options.

## 📦 Package Overview

### Core Package (`@ng-ui-lib/core`)
Contains shared interfaces, types, and utilities used across all components.

### Grid Package (`@ng-ui-lib/grid`)
Data grid component with virtual scrolling, filtering, sorting, and export capabilities.

### Editor Package (`@ng-ui-lib/editor-core`)
Rich text editor with formatting, media support, and document export features.

### Charts Package (`@ng-ui-lib/charts-core`)
Charting components with 2D/3D visualizations and interactive features.

## 🔧 Core Interfaces and Types

### Base Configuration Interface
```typescript
interface BaseConfig {
  theme?: string;
  accessibility?: AccessibilityConfig;
  exportable?: boolean;
  exportFormats?: ExportFormat[];
  responsive?: boolean;
}

interface AccessibilityConfig {
  enabled?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  keyboardNavigation?: boolean;
  announceChanges?: boolean;
  focusable?: boolean;
}

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'html' | 'docx' | 'png' | 'svg' | 'json' | 'markdown';
```

### Export System Types
```typescript
interface ExportOptions {
  filename?: string;
  format: ExportFormat;
  quality?: number;
  compression?: boolean;
  metadata?: ExportMetadata;
  template?: ExportTemplate;
  progress?: (progress: number) => void;
  onComplete?: (result: ExportResult) => void;
  onError?: (error: ExportError) => void;
}

interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  size: number;
  downloadUrl?: string;
  metadata?: any;
  timestamp: Date;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  settings: any;
  customFields?: TemplateField[];
}

interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'file' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: any[];
}

interface ExportMetadata {
  title?: string;
  author?: string;
  subject?: string;
  description?: string;
  keywords?: string[];
  created?: Date;
  modified?: Date;
}
```

## 📊 Grid Component API

### Grid Component
```typescript
@Component({
  selector: 'ng-ui-lib-grid',
  // ...
})
export class GridComponent implements OnInit, OnDestroy {
  // Input Properties
  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() config: GridConfig = {};
  @Input() selectedRows: any[] = [];
  @Input() sortModel: SortModel[] = [];
  @Input() filterModel: FilterModel = {};
  @Input() loading: boolean = false;
  @Input() loadingTemplate?: TemplateRef<any>;
  @Input() noDataTemplate?: TemplateRef<any>;
  @Input() errorTemplate?: TemplateRef<any>;

  // Output Events
  @Output() rowSelectionChanged = new EventEmitter<RowSelectionEvent>();
  @Output() cellValueChanged = new EventEmitter<CellEditEvent>();
  @Output() sortChanged = new EventEmitter<SortModel[]>();
  @Output() filterChanged = new EventEmitter<FilterModel>();
  @Output() dataExported = new EventEmitter<ExportResult>();
  @Output() columnResized = new EventEmitter<ColumnResizeEvent>();
  @Output() columnMoved = new EventEmitter<ColumnMoveEvent>();
  @Output() rowClicked = new EventEmitter<RowClickEvent>();
  @Output() rowDoubleClicked = new EventEmitter<RowDoubleClickEvent>();
  @Output() cellClicked = new EventEmitter<CellClickEvent>();
  @Output() cellDoubleClicked = new EventEmitter<CellDoubleClickEvent>();

  // Public Methods
  setRowData(data: any[]): void;
  getRowData(): any[];
  addRow(rowData: any, index?: number): void;
  removeRow(index: number): void;
  updateRow(index: number, data: any): void;
  selectRow(index: number): void;
  selectRows(indices: number[]): void;
  deselectRow(index: number): void;
  clearSelection(): void;
  getSelectedRows(): any[];
  sortColumn(colId: string, direction: SortDirection): void;
  clearSort(): void;
  applyFilter(colId: string, filter: FilterCondition): void;
  clearFilters(): void;
  resizeColumn(colId: string, width: number): void;
  hideColumn(colId: string): void;
  showColumn(colId: string): void;
  pinColumn(colId: string, side: 'left' | 'right'): void;
  unpinColumn(colId: string): void;
  autoSizeColumn(colId: string): void;
  autoSizeAllColumns(): void;
  scrollToRow(index: number): void;
  scrollToColumn(colId: string): void;
  
  // Export Methods
  exportToExcel(options?: ExcelExportOptions): Promise<ExportResult>;
  exportToPDF(options?: PDFExportOptions): Promise<ExportResult>;
  exportToCSV(options?: CSVExportOptions): Promise<ExportResult>;
  exportToJSON(options?: JSONExportOptions): Promise<ExportResult>;
  exportToHTML(options?: HTMLExportOptions): Promise<ExportResult>;
}
```

### Grid Configuration Interface
```typescript
interface GridConfig extends BaseConfig {
  // Display Options
  virtualScrolling?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  alternatingRows?: boolean;
  
  // Selection Options
  selectable?: boolean;
  multiSelect?: boolean;
  checkboxSelection?: boolean;
  rowDeselection?: boolean;
  suppressRowClickSelection?: boolean;
  
  // Interaction Options
  sortable?: boolean;
  multiSort?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  editable?: boolean;
  
  // Virtual Scrolling Options
  rowBuffer?: number;
  maxBlocksInCache?: number;
  cacheOverflowSize?: number;
  enableRangeSelection?: boolean;
  
  // Performance Options
  deltaRowDataMode?: boolean;
  suppressRowDeselection?: boolean;
  suppressColumnMoveAnimation?: boolean;
  suppressRowTransform?: boolean;
  
  // Styling Options
  rowClassRules?: { [cssClass: string]: (params: any) => boolean };
  getRowStyle?: (params: any) => any;
  getRowClass?: (params: any) => string;
  
  // Pagination
  pagination?: boolean;
  paginationPageSize?: number;
  paginationAutoPageSize?: boolean;
  
  // Default Sort/Filter
  defaultSort?: SortModel[];
  defaultFilter?: FilterModel;
}
```

### Column Definition Interface
```typescript
interface ColumnDefinition {
  // Basic Properties
  id: string;
  field?: string;
  header?: string;
  type?: ColumnType;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  
  // Display Options
  hidden?: boolean;
  pinned?: 'left' | 'right' | false;
  lockPosition?: boolean;
  suppressMovable?: boolean;
  suppressResize?: boolean;
  
  // Data Options
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  exportable?: boolean;
  
  // Rendering
  cellRenderer?: string | ComponentType<any> | ((params: CellRendererParams) => string);
  cellEditor?: string | ComponentType<any>;
  headerRenderer?: string | ComponentType<any>;
  
  // Value Processing
  valueGetter?: (params: ValueGetterParams) => any;
  valueSetter?: (params: ValueSetterParams) => boolean;
  valueParser?: (params: ValueParserParams) => any;
  valueFormatter?: (params: ValueFormatterParams) => string;
  
  // Styling
  cellClass?: string | string[] | ((params: CellClassParams) => string | string[]);
  cellStyle?: any | ((params: CellStyleParams) => any);
  headerClass?: string | string[];
  
  // Filtering
  filter?: string | ComponentType<any>;
  filterParams?: any;
  
  // Sorting
  comparator?: (valueA: any, valueB: any, nodeA: any, nodeB: any) => number;
  
  // Formatting
  format?: ColumnFormat;
  
  // Aggregation
  aggFunc?: string | ((params: any[]) => any);
  
  // Context Menu
  contextMenu?: ContextMenuItem[];
}

type ColumnType = 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'custom';

interface ColumnFormat {
  // Number formatting
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  
  // Currency formatting
  currency?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  
  // Date formatting
  dateFormat?: 'short' | 'medium' | 'long' | 'full' | string;
  
  // Boolean formatting
  trueValue?: string;
  falseValue?: string;
  
  // Custom formatter
  formatter?: (value: any) => string;
}
```

### Grid Events
```typescript
interface RowSelectionEvent {
  selectedRows: any[];
  addedRows: any[];
  removedRows: any[];
  source: 'checkbox' | 'row' | 'api';
}

interface CellEditEvent {
  rowIndex: number;
  colId: string;
  oldValue: any;
  newValue: any;
  data: any;
  node: any;
}

interface ColumnResizeEvent {
  colId: string;
  oldWidth: number;
  newWidth: number;
  source: 'uiColumnResized' | 'autosizeColumns' | 'api';
}

interface ColumnMoveEvent {
  colId: string;
  oldIndex: number;
  newIndex: number;
  toIndex: number;
}

interface RowClickEvent {
  rowIndex: number;
  data: any;
  event: MouseEvent;
}

interface CellClickEvent {
  rowIndex: number;
  colId: string;
  value: any;
  data: any;
  event: MouseEvent;
}
```

## 📝 Editor Component API

### Editor Component
```typescript
@Component({
  selector: 'ng-ui-lib-editor',
  // ...
})
export class RichTextEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  // Input Properties
  @Input() config: EditorConfig = {};
  @Input() initialContent: string = '';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() maxLength: number | null = null;
  @Input() autoFocus: boolean = false;
  @Input() spellCheck: boolean = true;
  @Input() customToolbar?: TemplateRef<any>;

  // Output Events
  @Output() contentChanged = new EventEmitter<string>();
  @Output() selectionChanged = new EventEmitter<SelectionEvent>();
  @Output() formatChanged = new EventEmitter<FormatEvent>();
  @Output() imageUploaded = new EventEmitter<ImageUploadEvent>();
  @Output() documentExported = new EventEmitter<ExportResult>();
  @Output() collaboratorJoined = new EventEmitter<CollaboratorEvent>();
  @Output() collaboratorLeft = new EventEmitter<CollaboratorEvent>();
  @Output() commentAdded = new EventEmitter<CommentEvent>();
  @Output() suggestionMade = new EventEmitter<SuggestionEvent>();
  @Output() documentSaved = new EventEmitter<SaveEvent>();
  @Output() errorOccurred = new EventEmitter<EditorError>();

  // Public Methods
  setContent(content: string): void;
  getContent(format?: 'html' | 'text' | 'markdown'): string;
  insertHtml(html: string, position?: 'cursor' | 'start' | 'end'): void;
  insertText(text: string, position?: 'cursor' | 'start' | 'end'): void;
  format(command: FormatCommand, value?: any): void;
  getFormat(range?: SelectionRange): FormatState;
  selectAll(): void;
  getSelection(): SelectionRange;
  setSelection(range: SelectionRange): void;
  focus(): void;
  blur(): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  save(): Promise<SaveResult>;
  
  // Image methods
  insertImage(options: InsertImageOptions): void;
  uploadImage(file: File): Promise<ImageUploadResult>;
  
  // Table methods
  insertTable(options: InsertTableOptions): void;
  
  // Link methods
  insertLink(options: InsertLinkOptions): void;
  removeLink(): void;
  
  // Export Methods
  exportToHTML(options?: HTMLExportOptions): Promise<ExportResult>;
  exportToPDF(options?: PDFExportOptions): Promise<ExportResult>;
  exportToDocx(options?: DocxExportOptions): Promise<ExportResult>;
  exportToMarkdown(options?: MarkdownExportOptions): Promise<ExportResult>;
  
  // Collaboration methods
  enableCollaboration(options: CollaborationOptions): void;
  disableCollaboration(): void;
  addComment(text: string, range?: SelectionRange): void;
  removeComment(commentId: string): void;
  addSuggestion(type: SuggestionType, data: any): void;
}
```

### Editor Configuration Interface
```typescript
interface EditorConfig extends BaseConfig {
  // Toolbar Configuration
  toolbar?: ToolbarConfig;
  
  // Content Options
  allowedContent?: string[];
  disallowedContent?: string[];
  removeEmptyElements?: boolean;
  preserveWhitespace?: boolean;
  
  // Upload Configuration
  mediaUpload?: MediaUploadConfig;
  
  // Collaboration
  collaboration?: CollaborationConfig;
  
  // Auto-save
  autoSave?: AutoSaveConfig;
  
  // Spell checking
  spellCheck?: SpellCheckConfig;
  
  // Formatting Options
  formatOptions?: FormatOptions;
  
  // Plugins
  plugins?: PluginConfig[];
}

interface ToolbarConfig {
  items: (ToolbarItem | string)[];
  floating?: boolean;
  sticky?: boolean;
  showOnSelection?: boolean;
  position?: 'top' | 'bottom' | 'auto';
  grouping?: boolean;
  customButtons?: CustomButton[];
}

type ToolbarItem = 
  | 'bold' | 'italic' | 'underline' | 'strikethrough'
  | 'fontSize' | 'fontFamily' | 'fontColor' | 'backgroundColor'
  | 'alignment' | 'outdent' | 'indent'
  | 'bulletedList' | 'numberedList'
  | 'link' | 'imageUpload' | 'insertTable' | 'horizontalLine'
  | 'codeBlock' | 'blockQuote' | 'specialCharacters'
  | 'findAndReplace' | 'spellChecker' | 'wordCount'
  | 'undo' | 'redo'
  | 'export' | '|';

interface MediaUploadConfig {
  enabled: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  uploadUrl?: string;
  resizeImages?: boolean;
  maxImageWidth?: number;
  maxImageHeight?: number;
  imageQuality?: number;
  showProgress?: boolean;
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: any) => void;
}

interface CollaborationConfig {
  enabled: boolean;
  websocketUrl: string;
  documentId: string;
  userId: string;
  userName: string;
  userColor?: string;
  conflictResolution?: 'operational-transform' | 'last-writer-wins';
  showCursors?: boolean;
  showSelections?: boolean;
  showUsers?: boolean;
  enableComments?: boolean;
  enableSuggestions?: boolean;
}
```

### Editor Events
```typescript
interface SelectionEvent {
  range: SelectionRange;
  text: string;
  html: string;
  isEmpty: boolean;
  isCollapsed: boolean;
}

interface FormatEvent {
  format: FormatState;
  range: SelectionRange;
}

interface ImageUploadEvent {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface CollaboratorEvent {
  userId: string;
  userName: string;
  userColor: string;
  timestamp: Date;
}

interface CommentEvent {
  id: string;
  userId: string;
  userName: string;
  text: string;
  range: SelectionRange;
  timestamp: Date;
}
```

## 📈 Charts Component API

### Chart Component
```typescript
@Component({
  selector: 'ng-ui-lib-chart',
  // ...
})
export class Chart2DComponent implements OnInit, OnDestroy {
  // Input Properties
  @Input() type: ChartType = 'line';
  @Input() data: ChartData = {};
  @Input() config: ChartConfig = {};
  @Input() width: number | null = null;
  @Input() height: number | null = null;
  @Input() theme: string = 'default';
  @Input() responsive: boolean = true;
  @Input() maintainAspectRatio: boolean = true;

  // Output Events
  @Output() chartClicked = new EventEmitter<ChartClickEvent>();
  @Output() dataPointHovered = new EventEmitter<DataPointEvent>();
  @Output() dataPointClicked = new EventEmitter<DataPointEvent>();
  @Output() legendToggled = new EventEmitter<LegendEvent>();
  @Output() chartExported = new EventEmitter<ExportResult>();
  @Output() animationCompleted = new EventEmitter<AnimationEvent>();
  @Output() chartResized = new EventEmitter<ChartResizeEvent>();
  @Output() dataUpdated = new EventEmitter<DataUpdateEvent>();

  // Public Methods
  updateData(data: ChartData, options?: UpdateOptions): void;
  addData(value: any, label?: string, datasetIndex?: number): void;
  removeData(index: number, datasetIndex?: number): void;
  setData(data: ChartData): void;
  getData(): ChartData;
  resetZoom(): void;
  zoomToRange(min: number, max: number): void;
  panToPoint(x: number, y: number): void;
  resize(width?: number, height?: number): void;
  refresh(): void;
  destroy(): void;
  
  // Animation methods
  animate(options?: AnimationOptions): void;
  stopAnimation(): void;
  
  // Export Methods
  exportToPNG(options?: ImageExportOptions): Promise<ExportResult>;
  exportToSVG(options?: SVGExportOptions): Promise<ExportResult>;
  exportToPDF(options?: PDFExportOptions): Promise<ExportResult>;
  exportToExcel(options?: ExcelExportOptions): Promise<ExportResult>;
  exportToJSON(options?: JSONExportOptions): Promise<ExportResult>;
  
  // Utility methods
  getDataAtPoint(x: number, y: number): any;
  getElementsAtEvent(event: Event): any[];
  getDatasetAtEvent(event: Event): any;
}
```

### Chart Configuration Interface
```typescript
interface ChartConfig extends BaseConfig {
  // Animation Options
  animation?: AnimationConfig;
  
  // Interaction Options
  interaction?: InteractionConfig;
  
  // Layout Options
  layout?: LayoutConfig;
  
  // Chart-specific options
  options?: ChartOptions;
  
  // Colors
  colors?: ColorConfig;
  
  // Responsive behavior
  breakpoints?: ResponsiveBreakpoint[];
}

interface ChartData {
  labels?: string[] | number[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label?: string;
  data: any[];
  backgroundColor?: string | string[] | CanvasGradient;
  borderColor?: string | string[];
  borderWidth?: number | number[];
  fill?: boolean | string | number;
  tension?: number;
  pointRadius?: number | number[];
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointBorderWidth?: number | number[];
  lineTension?: number;
  stepped?: boolean | 'before' | 'after' | 'middle';
  spanGaps?: boolean | number;
  
  // 3D properties
  depth?: number;
  height?: number | ((value: number) => number);
  
  // Custom properties
  [key: string]: any;
}

type ChartType = 
  | 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea'
  | 'scatter' | 'bubble' | 'area' | 'column' | 'candlestick'
  | 'heatmap' | 'treemap' | 'sankey' | 'funnel' | 'gauge'
  | 'bar3d' | 'line3d' | 'scatter3d' | 'surface3d';

interface AnimationConfig {
  enabled?: boolean;
  duration?: number;
  easing?: EasingFunction;
  delay?: number;
  loop?: boolean;
  animateIn?: AnimationType;
  animateUpdate?: AnimationType;
  animateOut?: AnimationType;
  stagger?: StaggerConfig;
}

interface InteractionConfig {
  intersect?: boolean;
  mode?: 'index' | 'dataset' | 'point' | 'nearest' | 'x' | 'y';
  axis?: 'x' | 'y' | 'xy';
}

interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
  
  // Plugins
  plugins?: PluginsConfig;
  
  // Scales
  scales?: ScalesConfig;
  
  // Elements
  elements?: ElementsConfig;
  
  // Events
  events?: string[];
  onClick?: (event: Event, elements: any[]) => void;
  onHover?: (event: Event, elements: any[]) => void;
  onResize?: (chart: any, size: any) => void;
}

interface PluginsConfig {
  title?: TitleConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  subtitle?: SubtitleConfig;
}

interface ScalesConfig {
  x?: ScaleConfig;
  y?: ScaleConfig;
  [key: string]: ScaleConfig | undefined;
}
```

### Chart Events
```typescript
interface ChartClickEvent {
  event: MouseEvent;
  point: { x: number; y: number };
  datasetIndex?: number;
  dataIndex?: number;
  value?: any;
}

interface DataPointEvent {
  datasetIndex: number;
  dataIndex: number;
  value: any;
  label: string;
  color: string;
  point: { x: number; y: number };
}

interface LegendEvent {
  datasetIndex: number;
  label: string;
  visible: boolean;
  color: string;
}

interface AnimationEvent {
  chart: any;
  duration: number;
}

interface ChartResizeEvent {
  chart: any;
  newSize: { width: number; height: number };
  oldSize: { width: number; height: number };
}
```

## 🎨 Theming API

### Theme Configuration
```typescript
interface ThemeConfig {
  name: string;
  colors: ColorScheme;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  transitions: TransitionConfig;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Component-specific colors
  grid?: GridColorScheme;
  editor?: EditorColorScheme;
  chart?: ChartColorScheme;
}

interface GridColorScheme {
  headerBackground: string;
  headerText: string;
  rowBackground: string;
  rowAlternateBackground: string;
  rowHover: string;
  rowSelected: string;
  cellBorder: string;
  sortIndicator: string;
  filterBackground: string;
}

interface EditorColorScheme {
  toolbarBackground: string;
  toolbarBorder: string;
  toolbarButton: string;
  toolbarButtonHover: string;
  toolbarButtonActive: string;
  contentBackground: string;
  contentBorder: string;
  selectionBackground: string;
  cursorColor: string;
}

interface ChartColorScheme {
  palette: string[];
  gridLines: string;
  axisLines: string;
  axisText: string;
  tooltipBackground: string;
  tooltipText: string;
  legendText: string;
}
```

## 🔧 Service APIs

### Export Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  // Core export methods
  exportToExcel(data: any, options: ExcelExportOptions): Promise<ExportResult>;
  exportToPDF(data: any, options: PDFExportOptions): Promise<ExportResult>;
  exportToCSV(data: any, options: CSVExportOptions): Promise<ExportResult>;
  exportToHTML(data: any, options: HTMLExportOptions): Promise<ExportResult>;
  exportToDocx(data: any, options: DocxExportOptions): Promise<ExportResult>;
  exportToPNG(data: any, options: ImageExportOptions): Promise<ExportResult>;
  exportToSVG(data: any, options: SVGExportOptions): Promise<ExportResult>;
  exportToJSON(data: any, options: JSONExportOptions): Promise<ExportResult>;
  exportToMarkdown(data: any, options: MarkdownExportOptions): Promise<ExportResult>;

  // Batch operations
  batchExport(jobs: ExportJob[]): Observable<BatchExportResult>;
  createArchive(options: ArchiveOptions): Promise<ExportResult>;

  // Template management
  getTemplates(format: ExportFormat): Promise<ExportTemplate[]>;
  saveTemplate(template: ExportTemplate): Promise<void>;
  deleteTemplate(templateId: string): Promise<void>;
  validateTemplate(template: ExportTemplate): ValidationResult;

  // Google integration
  authenticateGoogle(): Promise<void>;
  exportToGoogleSheets(data: any, options: GoogleSheetsOptions): Promise<ExportResult>;
  exportToGoogleDocs(data: any, options: GoogleDocsOptions): Promise<ExportResult>;
  exportToGoogleDrive(file: Blob, options: GoogleDriveOptions): Promise<ExportResult>;

  // Utility methods
  validateExportOptions(options: ExportOptions): ValidationResult;
  estimateFileSize(data: any, format: ExportFormat): Promise<number>;
  getExportHistory(): Promise<ExportHistoryItem[]>;
  clearExportHistory(): Promise<void>;
  
  // Progress tracking
  getExportProgress(jobId: string): Observable<ExportProgress>;
  cancelExport(jobId: string): Promise<void>;
}
```

### Theme Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Theme management
  getCurrentTheme(): ThemeConfig;
  setTheme(theme: string | ThemeConfig): void;
  getAvailableThemes(): string[];
  registerTheme(theme: ThemeConfig): void;
  unregisterTheme(themeName: string): void;
  
  // Color utilities
  getColorScheme(): ColorScheme;
  updateColorScheme(updates: Partial<ColorScheme>): void;
  generateColorPalette(baseColor: string, count: number): string[];
  
  // CSS variable management
  setCSSVariable(name: string, value: string): void;
  getCSSVariable(name: string): string;
  updateCSSVariables(variables: Record<string, string>): void;
  
  // Theme switching
  enableDarkMode(): void;
  enableLightMode(): void;
  toggleDarkMode(): void;
  isDarkMode(): boolean;
  
  // Responsive themes
  setBreakpointTheme(breakpoint: string, theme: Partial<ThemeConfig>): void;
  getBreakpointTheme(breakpoint: string): Partial<ThemeConfig>;
  
  // Theme persistence
  saveThemePreference(theme: string): void;
  loadThemePreference(): string | null;
}
```

## 🔍 Utility Functions

### Data Processing Utilities
```typescript
// Data transformation utilities
export function transformData<T, R>(data: T[], transformer: (item: T) => R): R[];
export function filterData<T>(data: T[], predicate: (item: T) => boolean): T[];
export function sortData<T>(data: T[], compareFn: (a: T, b: T) => number): T[];
export function groupData<T>(data: T[], keyFn: (item: T) => string): Record<string, T[]>;
export function aggregateData<T>(data: T[], aggregator: AggregationFunction<T>): any;

// Validation utilities
export function validateColumnDefinition(column: ColumnDefinition): ValidationResult;
export function validateGridConfig(config: GridConfig): ValidationResult;
export function validateExportOptions(options: ExportOptions): ValidationResult;
export function sanitizeHtml(html: string): string;
export function sanitizeFilename(filename: string): string;

// Format utilities
export function formatNumber(value: number, options: NumberFormatOptions): string;
export function formatDate(value: Date, format: string): string;
export function formatCurrency(value: number, currency: string): string;
export function formatBytes(bytes: number): string;
export function parseValue(value: string, type: ColumnType): any;

// File utilities
export function downloadFile(blob: Blob, filename: string): void;
export function readFileAsText(file: File): Promise<string>;
export function readFileAsDataURL(file: File): Promise<string>;
export function getFileExtension(filename: string): string;
export function getMimeType(filename: string): string;
```

### Type Guards and Validators
```typescript
// Type guards
export function isGridComponent(component: any): component is GridComponent;
export function isEditorComponent(component: any): component is RichTextEditorComponent;
export function isChartComponent(component: any): component is Chart2DComponent;
export function isExportResult(result: any): result is ExportResult;

// Validators
export function isValidEmail(email: string): boolean;
export function isValidUrl(url: string): boolean;
export function isValidHtml(html: string): boolean;
export function isValidJson(json: string): boolean;
export function isValidCss(css: string): boolean;

// Data validators
export function validateDataType(value: any, expectedType: ColumnType): boolean;
export function validateRequired(value: any): boolean;
export function validateRange(value: number, min: number, max: number): boolean;
export function validatePattern(value: string, pattern: RegExp): boolean;
```

## 📊 Constants and Enums

### Enums
```typescript
export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
  None = 'none'
}

export enum FilterType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean',
  Custom = 'custom'
}

export enum ExportFormat {
  Excel = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
  HTML = 'html',
  Word = 'docx',
  PNG = 'png',
  SVG = 'svg',
  JSON = 'json',
  Markdown = 'markdown'
}

export enum ChartType {
  Line = 'line',
  Bar = 'bar',
  Pie = 'pie',
  Doughnut = 'doughnut',
  Radar = 'radar',
  PolarArea = 'polarArea',
  Scatter = 'scatter',
  Bubble = 'bubble'
}

export enum AnimationType {
  FadeIn = 'fadeIn',
  FadeOut = 'fadeOut',
  SlideIn = 'slideIn',
  SlideOut = 'slideOut',
  ZoomIn = 'zoomIn',
  ZoomOut = 'zoomOut',
  Bounce = 'bounce',
  Elastic = 'elastic'
}

export enum EditorFormat {
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  Strikethrough = 'strikethrough',
  Code = 'code',
  Link = 'link',
  Image = 'image',
  List = 'list',
  Table = 'table'
}
```

### Constants
```typescript
export const DEFAULT_GRID_CONFIG: GridConfig = {
  virtualScrolling: true,
  rowHeight: 32,
  headerHeight: 40,
  selectable: false,
  sortable: true,
  filterable: true,
  resizable: true,
  theme: 'default'
};

export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  toolbar: {
    items: ['bold', 'italic', 'underline', '|', 'link', 'image', '|', 'undo', 'redo'],
    floating: false,
    sticky: true
  },
  mediaUpload: {
    enabled: true,
    maxFileSize: 10485760, // 10MB
    allowedTypes: ['image/*']
  },
  theme: 'default'
};

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  responsive: true,
  maintainAspectRatio: true,
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'easeInOutQuart'
  },
  theme: 'default'
};

export const EXPORT_FORMATS: ExportFormat[] = [
  ExportFormat.Excel,
  ExportFormat.CSV,
  ExportFormat.PDF,
  ExportFormat.HTML,
  ExportFormat.Word,
  ExportFormat.PNG,
  ExportFormat.SVG,
  ExportFormat.JSON,
  ExportFormat.Markdown
];

export const CHART_TYPES: ChartType[] = [
  ChartType.Line,
  ChartType.Bar,
  ChartType.Pie,
  ChartType.Doughnut,
  ChartType.Radar,
  ChartType.PolarArea,
  ChartType.Scatter,
  ChartType.Bubble
];
```

## 🔌 Plugin System

### Plugin Interface
```typescript
interface Plugin {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
  
  install(component: any, options?: any): void;
  uninstall(component: any): void;
  configure(options: any): void;
  
  // Lifecycle hooks
  onInit?(component: any): void;
  onDestroy?(component: any): void;
  onDataChange?(data: any): void;
  onConfigChange?(config: any): void;
}

interface PluginRegistry {
  register(plugin: Plugin): void;
  unregister(pluginName: string): void;
  get(pluginName: string): Plugin | undefined;
  list(): Plugin[];
  isRegistered(pluginName: string): boolean;
}

// Global plugin registry
export const pluginRegistry: PluginRegistry;
```

### Custom Plugin Example
```typescript
export class CustomExportPlugin implements Plugin {
  name = 'custom-export';
  version = '1.0.0';
  description = 'Custom export functionality';

  install(component: GridComponent | RichTextEditorComponent | Chart2DComponent) {
    // Add custom export method
    (component as any).exportToCustomFormat = (options: any) => {
      return this.performCustomExport(component, options);
    };
  }

  uninstall(component: any) {
    delete component.exportToCustomFormat;
  }

  configure(options: any) {
    // Configure plugin settings
  }

  private performCustomExport(component: any, options: any): Promise<ExportResult> {
    // Custom export logic
    return Promise.resolve({
      success: true,
      filename: options.filename || 'export.custom',
      format: 'custom' as ExportFormat,
      size: 0,
      timestamp: new Date()
    });
  }
}

// Register plugin
pluginRegistry.register(new CustomExportPlugin());
```

## 🔗 Related Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Basic usage and setup
- **[Component Documentation](./components/)** - Detailed component guides
- **[Export System](./features/export/)** - Export functionality
- **[Examples](./examples/)** - Code examples and demos
- **[Migration Guide](./migration/)** - Upgrading and migration

## 📞 Support

For questions about the API or implementation details:

1. **Check Examples** - Look for similar patterns in our examples
2. **TypeScript IntelliSense** - Use IDE autocompletion for available methods
3. **Community** - Ask questions in our GitHub discussions
4. **Documentation** - Refer to component-specific documentation

---

This API reference is automatically updated with each release. For the most current information, always refer to the TypeScript definitions in your node_modules or the official documentation website.