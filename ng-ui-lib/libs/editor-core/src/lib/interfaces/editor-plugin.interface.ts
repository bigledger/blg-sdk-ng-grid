/**
 * Editor Plugin Interface
 * Defines the plugin system architecture for the BLG Editor
 */

export interface EditorPlugin {
  /** Plugin name */
  name: string;

  /** Plugin version */
  version: string;

  /** Plugin description */
  description?: string;

  /** Plugin author */
  author?: string;

  /** Plugin dependencies */
  dependencies?: string[];

  /** Plugin configuration options */
  options?: Record<string, any>;

  /** Plugin initialization function */
  init: (editor: any, options?: Record<string, any>) => Promise<void> | void;

  /** Plugin destruction function */
  destroy?: () => Promise<void> | void;

  /** Plugin commands */
  commands?: Record<string, EditorCommand>;

  /** Plugin toolbar contributions */
  toolbar?: ToolbarContribution[];

  /** Plugin event handlers */
  eventHandlers?: Record<string, EditorEventHandler>;

  /** Plugin styles */
  styles?: string;

  /** Plugin templates */
  templates?: Record<string, string>;

  /** Plugin configuration schema */
  configSchema?: PluginConfigSchema;
}

export interface PluginManager {
  /** Register a plugin */
  register(plugin: EditorPlugin): Promise<void>;

  /** Unregister a plugin */
  unregister(pluginName: string): Promise<void>;

  /** Get a registered plugin */
  get(pluginName: string): EditorPlugin | null;

  /** Get all registered plugins */
  getAll(): EditorPlugin[];

  /** Check if plugin is registered */
  has(pluginName: string): boolean;

  /** Load a plugin */
  load(pluginName: string, options?: Record<string, any>): Promise<void>;

  /** Unload a plugin */
  unload(pluginName: string): Promise<void>;

  /** Get loaded plugins */
  getLoaded(): string[];

  /** Check if plugin is loaded */
  isLoaded(pluginName: string): boolean;

  /** Enable a plugin */
  enable(pluginName: string): Promise<void>;

  /** Disable a plugin */
  disable(pluginName: string): Promise<void>;

  /** Check if plugin is enabled */
  isEnabled(pluginName: string): boolean;
}

export interface ToolbarContribution {
  /** Contribution ID */
  id: string;

  /** Toolbar group to contribute to */
  group: string;

  /** Button configuration */
  button?: ToolbarButtonConfig;

  /** Dropdown configuration */
  dropdown?: ToolbarDropdownConfig;

  /** Position within group */
  position?: number;

  /** Visibility condition */
  when?: (context: any) => boolean;
}

export interface ToolbarButtonConfig {
  /** Button text */
  text?: string;

  /** Button icon */
  icon?: string;

  /** Button tooltip */
  tooltip?: string;

  /** Command to execute on click */
  command: string;

  /** Command parameters */
  commandParams?: Record<string, any>;

  /** Whether button is active */
  active?: (context: any) => boolean;

  /** Whether button is enabled */
  enabled?: (context: any) => boolean;
}

export interface ToolbarDropdownConfig {
  /** Dropdown text */
  text?: string;

  /** Dropdown icon */
  icon?: string;

  /** Dropdown tooltip */
  tooltip?: string;

  /** Dropdown items */
  items: ToolbarDropdownItem[];

  /** Currently selected value */
  value?: (context: any) => string;
}

export interface ToolbarDropdownItem {
  /** Item value */
  value: string;

  /** Item text */
  text: string;

  /** Item icon */
  icon?: string;

  /** Command to execute on select */
  command: string;

  /** Command parameters */
  commandParams?: Record<string, any>;
}

export interface PluginConfigSchema {
  /** Schema type */
  type: 'object';

  /** Schema properties */
  properties: Record<string, PluginConfigProperty>;

  /** Required properties */
  required?: string[];

  /** Additional properties allowed */
  additionalProperties?: boolean;
}

export interface PluginConfigProperty {
  /** Property type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';

  /** Property description */
  description?: string;

  /** Default value */
  default?: any;

  /** Enumerated values */
  enum?: any[];

  /** Minimum value (for numbers) */
  minimum?: number;

  /** Maximum value (for numbers) */
  maximum?: number;

  /** Array item schema */
  items?: PluginConfigProperty;

  /** Object properties */
  properties?: Record<string, PluginConfigProperty>;
}

export interface PluginContext {
  /** Editor instance */
  editor: any;

  /** Plugin options */
  options: Record<string, any>;

  /** Utility functions */
  utils: PluginUtils;

  /** Event emitter */
  events: any;

  /** Logger instance */
  logger: PluginLogger;
}

export interface PluginUtils {
  /** Create DOM element */
  createElement(tag: string, attributes?: Record<string, string>): Element;

  /** Find elements by selector */
  findElements(selector: string, root?: Element): Element[];

  /** Add CSS class */
  addClass(element: Element, className: string): void;

  /** Remove CSS class */
  removeClass(element: Element, className: string): void;

  /** Toggle CSS class */
  toggleClass(element: Element, className: string): void;

  /** Generate unique ID */
  generateId(prefix?: string): string;

  /** Debounce function */
  debounce(func: Function, delay: number): Function;

  /** Throttle function */
  throttle(func: Function, delay: number): Function;
}

export interface PluginLogger {
  /** Log debug message */
  debug(message: string, ...args: any[]): void;

  /** Log info message */
  info(message: string, ...args: any[]): void;

  /** Log warning message */
  warn(message: string, ...args: any[]): void;

  /** Log error message */
  error(message: string, ...args: any[]): void;
}

export interface PluginRegistration {
  /** Plugin instance */
  plugin: EditorPlugin;

  /** Registration options */
  options: Record<string, any>;

  /** Registration timestamp */
  timestamp: number;

  /** Whether plugin is loaded */
  loaded: boolean;

  /** Whether plugin is enabled */
  enabled: boolean;

  /** Plugin state */
  state: Record<string, any>;
}