# TypeScript Interface Patterns Extracted from Charting Libraries

## Core Interfaces for Modern Charting Libraries

Based on the reverse engineering analysis, here are the essential TypeScript interfaces that modern charting libraries should implement:

## 1. Rendering System Interfaces

```typescript
// Multi-renderer support pattern from ECharts/Plotly
interface RenderingEngine {
  readonly type: 'canvas' | 'svg' | 'webgl' | 'hybrid';
  readonly capabilities: RenderingCapabilities;
  
  initialize(container: HTMLElement, options: RenderOptions): Promise<void>;
  render(scene: RenderScene): Promise<void>;
  resize(width: number, height: number): void;
  dispose(): void;
}

interface RenderingCapabilities {
  readonly supportsTransparency: boolean;
  readonly supportsAntialiasing: boolean;
  readonly maxDataPoints: number;
  readonly supportsAnimation: boolean;
  readonly supports3D: boolean;
  readonly supportsInteraction: boolean;
}

interface RenderOptions {
  readonly devicePixelRatio?: number;
  readonly antialias?: boolean;
  readonly alpha?: boolean;
  readonly preserveDrawingBuffer?: boolean;
  readonly powerPreference?: 'default' | 'high-performance' | 'low-power';
}

// Adaptive rendering strategy
interface AdaptiveRenderer extends RenderingEngine {
  selectOptimalRenderer(data: DataCharacteristics): RenderingEngine;
  switchRenderer(newRenderer: RenderingEngine): Promise<void>;
}

interface DataCharacteristics {
  readonly pointCount: number;
  readonly hasTransparency: boolean;
  readonly hasAnimation: boolean;
  readonly interactionComplexity: 'low' | 'medium' | 'high';
  readonly updateFrequency: number; // Hz
}
```

## 2. Performance Optimization Interfaces

```typescript
// Memory management patterns from all libraries
interface ObjectPool<T> {
  acquire(): T;
  release(item: T): void;
  clear(): void;
  readonly size: number;
  readonly available: number;
}

interface CacheManager {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttl?: number): void;
  invalidate(pattern: string | RegExp): void;
  clear(): void;
  readonly stats: CacheStats;
}

interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly memoryUsage: number;
}

// Virtual scrolling pattern for large datasets
interface VirtualScroller<T> {
  readonly visibleRange: Range;
  readonly totalItems: number;
  
  setData(data: T[]): void;
  scrollToIndex(index: number): void;
  getVisibleItems(): T[];
  onScroll(handler: (range: Range) => void): void;
}

interface Range {
  readonly start: number;
  readonly end: number;
  readonly count: number;
}

// Batching system from Chart.js
interface BatchProcessor {
  schedule<T>(operation: BatchOperation<T>): Promise<T>;
  flush(): Promise<void>;
  configure(options: BatchOptions): void;
}

interface BatchOperation<T> {
  readonly priority: 'low' | 'normal' | 'high';
  readonly estimatedCost: number;
  execute(): T | Promise<T>;
}

interface BatchOptions {
  readonly maxBatchSize: number;
  readonly maxWaitTime: number; // ms
  readonly scheduler: 'immediate' | 'raf' | 'idle';
}
```

## 3. Event System Interfaces

```typescript
// Advanced event system from Chart.js
interface EventEmitter<T extends EventMap = EventMap> {
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): Unsubscribe;
  off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): void;
  emit<K extends keyof T>(event: K, data: T[K]): boolean;
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): Unsubscribe;
  listenerCount<K extends keyof T>(event: K): number;
}

type EventListener<T> = (data: T) => void | boolean;
type Unsubscribe = () => void;

interface EventMap {
  [key: string]: unknown;
}

// Chart-specific events
interface ChartEventMap extends EventMap {
  'data:update': DataUpdateEvent;
  'render:start': RenderStartEvent;
  'render:complete': RenderCompleteEvent;
  'interaction:hover': HoverEvent;
  'interaction:click': ClickEvent;
  'interaction:zoom': ZoomEvent;
  'interaction:pan': PanEvent;
  'error': ErrorEvent;
}

interface InteractionEvent {
  readonly type: string;
  readonly target: ChartElement | null;
  readonly position: Point;
  readonly nativeEvent: Event;
  readonly timestamp: number;
  preventDefault(): void;
  stopPropagation(): void;
}

interface HoverEvent extends InteractionEvent {
  readonly data: unknown;
  readonly dataIndex: number;
  readonly seriesIndex: number;
}

// Gesture recognition from touch libraries
interface GestureRecognizer {
  recognize(events: TouchEvent[]): Gesture[];
  configure(options: GestureOptions): void;
}

interface Gesture {
  readonly type: 'tap' | 'pinch' | 'pan' | 'rotate' | 'swipe';
  readonly confidence: number;
  readonly center: Point;
  readonly data: GestureData;
}

interface PinchGesture extends Gesture {
  readonly type: 'pinch';
  readonly data: {
    readonly scale: number;
    readonly startDistance: number;
    readonly currentDistance: number;
  };
}
```

## 4. Data Processing Interfaces

```typescript
// Reactive data system inspired by all libraries
interface DataModel<T> {
  readonly data: readonly T[];
  readonly version: number;
  readonly isDirty: boolean;
  
  setData(data: T[]): void;
  updateItem(index: number, item: Partial<T>): void;
  addItem(item: T, index?: number): void;
  removeItem(index: number): void;
  
  subscribe(callback: DataChangeCallback<T>): Unsubscribe;
  transform<U>(transformer: DataTransformer<T, U>): DataModel<U>;
}

interface DataChangeCallback<T> {
  (change: DataChange<T>): void;
}

interface DataChange<T> {
  readonly type: 'add' | 'remove' | 'update' | 'reset';
  readonly items: readonly T[];
  readonly indices: readonly number[];
  readonly oldData?: readonly T[];
}

type DataTransformer<T, U> = (data: readonly T[]) => readonly U[];

// Streaming data pattern from real-time charts
interface DataStream<T> {
  readonly isConnected: boolean;
  readonly bufferSize: number;
  readonly sampleRate: number; // Hz
  
  connect(): Promise<void>;
  disconnect(): void;
  push(item: T): void;
  getBuffer(): readonly T[];
  clearBuffer(): void;
  
  onData(callback: (item: T) => void): Unsubscribe;
  onBuffer(callback: (buffer: readonly T[]) => void): Unsubscribe;
}

// Data aggregation patterns
interface DataAggregator<T, U = T> {
  aggregate(data: readonly T[], config: AggregationConfig): readonly U[];
  reduce(data: readonly T[], reducer: DataReducer<T, U>): U;
}

interface AggregationConfig {
  readonly groupBy?: string | ((item: unknown) => string);
  readonly timeWindow?: number; // ms
  readonly maxGroups?: number;
  readonly algorithm: 'sum' | 'average' | 'median' | 'min' | 'max' | 'custom';
}

type DataReducer<T, U> = (accumulator: U, current: T, index: number) => U;
```

## 5. Plugin Architecture Interfaces

```typescript
// Chart.js plugin system with lifecycle hooks
interface Plugin<TChart = unknown, TOptions = unknown> {
  readonly id: string;
  readonly version?: string;
  readonly dependencies?: readonly string[];
  
  // Lifecycle hooks
  install?(chart: TChart, options: TOptions): void | Promise<void>;
  uninstall?(chart: TChart): void | Promise<void>;
  
  // Render hooks
  beforeRender?(chart: TChart, args: BeforeRenderArgs): boolean | void;
  afterRender?(chart: TChart, args: AfterRenderArgs): void;
  
  // Data hooks
  beforeDataUpdate?(chart: TChart, args: BeforeDataUpdateArgs): boolean | void;
  afterDataUpdate?(chart: TChart, args: AfterDataUpdateArgs): void;
  
  // Event hooks
  beforeEvent?(chart: TChart, args: BeforeEventArgs): boolean | void;
  afterEvent?(chart: TChart, args: AfterEventArgs): void;
}

interface PluginRegistry {
  register(plugin: Plugin): void;
  unregister(pluginId: string): void;
  get(pluginId: string): Plugin | undefined;
  list(): readonly Plugin[];
  isEnabled(pluginId: string): boolean;
  enable(pluginId: string): void;
  disable(pluginId: string): void;
}

interface PluginContext<TChart = unknown> {
  readonly chart: TChart;
  readonly plugin: Plugin;
  readonly options: unknown;
  
  emit<T>(event: string, data: T): boolean;
  getService<T>(serviceId: string): T | undefined;
}

// Extension point system
interface ExtensionPoint<T = unknown> {
  readonly name: string;
  readonly type: ExtensionType;
  
  extend(extension: T): void;
  getExtensions(): readonly T[];
  clear(): void;
}

type ExtensionType = 'component' | 'renderer' | 'interaction' | 'animation' | 'data';
```

## 6. Animation System Interfaces

```typescript
// Animation framework from all libraries
interface AnimationEngine {
  animate<T>(
    target: T,
    properties: AnimationProperties<T>,
    options: AnimationOptions
  ): Animation;
  
  createTimeline(): AnimationTimeline;
  setGlobalSpeed(speed: number): void;
  pause(): void;
  resume(): void;
  stop(): void;
}

interface Animation {
  readonly id: string;
  readonly isPlaying: boolean;
  readonly progress: number; // 0-1
  readonly duration: number;
  readonly delay: number;
  
  play(): void;
  pause(): void;
  stop(): void;
  reverse(): void;
  seek(progress: number): void;
  
  onComplete(callback: () => void): Unsubscribe;
  onUpdate(callback: (progress: number) => void): Unsubscribe;
}

interface AnimationOptions {
  readonly duration?: number;
  readonly delay?: number;
  readonly easing?: EasingFunction | string;
  readonly repeat?: number;
  readonly yoyo?: boolean;
  readonly autoPlay?: boolean;
}

interface AnimationProperties<T> {
  readonly from?: Partial<T>;
  readonly to: Partial<T>;
  readonly interpolator?: PropertyInterpolator<T>;
}

type EasingFunction = (t: number) => number;
type PropertyInterpolator<T> = (from: T, to: T, progress: number) => T;

interface AnimationTimeline {
  readonly duration: number;
  readonly isPlaying: boolean;
  
  add(animation: Animation, time?: number): this;
  remove(animation: Animation): this;
  play(): void;
  pause(): void;
  seek(time: number): void;
}
```

## 7. Theming and Style Interfaces

```typescript
// Design system interfaces
interface ThemeSystem {
  readonly currentTheme: Theme;
  readonly availableThemes: readonly string[];
  
  setTheme(theme: Theme | string): void;
  createTheme(definition: ThemeDefinition): Theme;
  extendTheme(baseTheme: Theme, overrides: Partial<ThemeDefinition>): Theme;
  
  onThemeChange(callback: (theme: Theme) => void): Unsubscribe;
}

interface Theme {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly colors: ColorPalette;
  readonly typography: Typography;
  readonly spacing: SpacingScale;
  readonly borders: BorderStyles;
  readonly shadows: ShadowStyles;
  readonly animations: AnimationPresets;
}

interface ColorPalette {
  readonly primary: ColorScale;
  readonly secondary: ColorScale;
  readonly accent: ColorScale;
  readonly neutral: ColorScale;
  readonly semantic: SemanticColors;
  readonly data: readonly string[]; // Data visualization colors
}

interface ColorScale {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string;
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
}

interface SemanticColors {
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
}

// CSS-in-JS pattern for dynamic styling
interface StyleEngine {
  createStyles<T extends Record<string, CSSProperties>>(styles: T): StyleSheet<T>;
  injectGlobal(styles: CSSProperties): void;
  setTheme(theme: Theme): void;
}

interface StyleSheet<T> {
  readonly classes: { readonly [K in keyof T]: string };
  update(newStyles: Partial<T>): void;
  dispose(): void;
}
```

## 8. Accessibility Interfaces

```typescript
// ARIA and accessibility support
interface AccessibilityProvider {
  readonly isEnabled: boolean;
  readonly mode: 'full' | 'reduced' | 'off';
  
  enable(): void;
  disable(): void;
  setMode(mode: AccessibilityProvider['mode']): void;
  
  announceChange(message: string, priority?: 'polite' | 'assertive'): void;
  setFocus(element: ChartElement): void;
  
  onKeyNavigation(callback: KeyNavigationHandler): Unsubscribe;
}

type KeyNavigationHandler = (event: KeyboardEvent) => boolean | void;

interface AriaDescriptor {
  readonly role: string;
  readonly label: string;
  readonly description?: string;
  readonly value?: string | number;
  readonly min?: number;
  readonly max?: number;
  readonly expanded?: boolean;
  readonly selected?: boolean;
  readonly level?: number;
  readonly setSize?: number;
  readonly posInSet?: number;
}

interface AccessibilityAnnouncer {
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  clear(): void;
}
```

## 9. State Management Interfaces

```typescript
// Signal-based reactivity (inspired by Chart.js patterns)
interface Signal<T> {
  readonly value: T;
  readonly version: number;
  
  set(value: T): void;
  update(updater: (current: T) => T): void;
  subscribe(callback: SignalCallback<T>): Unsubscribe;
  
  readonly(): ReadonlySignal<T>;
  derive<U>(derivation: (value: T) => U): ComputedSignal<U>;
}

interface ReadonlySignal<T> {
  readonly value: T;
  readonly version: number;
  subscribe(callback: SignalCallback<T>): Unsubscribe;
  derive<U>(derivation: (value: T) => U): ComputedSignal<U>;
}

interface ComputedSignal<T> extends ReadonlySignal<T> {
  readonly dependencies: readonly ReadonlySignal<unknown>[];
  invalidate(): void;
}

type SignalCallback<T> = (value: T, previousValue: T) => void;

// Store pattern for complex state
interface Store<T> {
  readonly state: ReadonlySignal<T>;
  
  dispatch(action: Action<T>): void;
  subscribe(selector: StateSelector<T, unknown>, callback: StateCallback): Unsubscribe;
  
  middleware(middleware: Middleware<T>): void;
}

interface Action<T> {
  readonly type: string;
  readonly payload?: unknown;
  readonly meta?: ActionMeta;
}

interface ActionMeta {
  readonly timestamp: number;
  readonly source?: string;
  readonly batch?: boolean;
}

type StateSelector<T, U> = (state: T) => U;
type StateCallback = (value: unknown, previousValue: unknown) => void;
type Middleware<T> = (store: Store<T>) => (next: Dispatch<T>) => Dispatch<T>;
type Dispatch<T> = (action: Action<T>) => void;
```

## 10. Configuration and Options Interfaces

```typescript
// Configuration system with validation
interface ConfigurationManager<T = unknown> {
  readonly schema: ConfigSchema<T>;
  readonly defaults: T;
  readonly current: T;
  
  set(config: DeepPartial<T>): ValidationResult;
  get<K extends keyof T>(key: K): T[K];
  reset(): void;
  validate(config: unknown): ValidationResult<T>;
  
  onConfigChange(callback: ConfigChangeCallback<T>): Unsubscribe;
}

interface ConfigSchema<T> {
  readonly properties: { [K in keyof T]: PropertySchema };
  readonly required?: readonly (keyof T)[];
  readonly additionalProperties?: boolean;
}

interface PropertySchema {
  readonly type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  readonly description?: string;
  readonly default?: unknown;
  readonly enum?: readonly unknown[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly pattern?: string;
  readonly items?: PropertySchema;
  readonly properties?: Record<string, PropertySchema>;
  readonly validator?: (value: unknown) => boolean;
}

interface ValidationResult<T = unknown> {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
  readonly value?: T;
}

interface ValidationError {
  readonly path: string;
  readonly message: string;
  readonly code: string;
  readonly value: unknown;
}

interface ValidationWarning {
  readonly path: string;
  readonly message: string;
  readonly suggestion?: string;
}

type ConfigChangeCallback<T> = (newConfig: T, previousConfig: T, changes: ConfigChange[]) => void;

interface ConfigChange {
  readonly path: string;
  readonly oldValue: unknown;
  readonly newValue: unknown;
  readonly type: 'added' | 'removed' | 'changed';
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

These TypeScript interfaces represent the most sophisticated patterns discovered in the reverse engineering analysis and provide a comprehensive foundation for building modern, performant, and extensible charting libraries.