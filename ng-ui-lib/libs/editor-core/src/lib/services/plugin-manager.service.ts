import { Injectable, signal, computed } from '@angular/core';
import {
  EditorPlugin,
  PluginManager,
  PluginRegistration,
  PluginContext,
  PluginUtils,
  PluginLogger
} from '../interfaces';

/**
 * Plugin Manager Service
 * Manages plugin registration, loading, and lifecycle
 */
@Injectable({
  providedIn: 'root'
})
export class PluginManagerService implements PluginManager {
  // Private state
  private _plugins = signal<Map<string, PluginRegistration>>(new Map());
  private _loadedPlugins = signal<Set<string>>(new Set());
  private _enabledPlugins = signal<Set<string>>(new Set());
  private _editorInstance: any = null;

  // Public readonly state
  readonly plugins = this._plugins.asReadonly();
  readonly loadedPlugins = this._loadedPlugins.asReadonly();
  readonly enabledPlugins = this._enabledPlugins.asReadonly();

  // Computed values
  readonly pluginCount = computed(() => this._plugins().size);
  readonly loadedCount = computed(() => this._loadedPlugins().size);
  readonly enabledCount = computed(() => this._enabledPlugins().size);

  // Plugin utilities
  private utils: PluginUtils = {
    createElement: (tag: string, attributes?: Record<string, string>) => {
      const element = document.createElement(tag);
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      return element;
    },
    
    findElements: (selector: string, root?: Element) => {
      const container = root || document;
      return Array.from(container.querySelectorAll(selector));
    },
    
    addClass: (element: Element, className: string) => {
      element.classList.add(className);
    },
    
    removeClass: (element: Element, className: string) => {
      element.classList.remove(className);
    },
    
    toggleClass: (element: Element, className: string) => {
      element.classList.toggle(className);
    },
    
    generateId: (prefix: string = 'plugin') => {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    debounce: (func: Function, delay: number) => {
      let timeoutId: number;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func.apply(null, args), delay);
      };
    },
    
    throttle: (func: Function, delay: number) => {
      let lastCall = 0;
      return (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          func.apply(null, args);
        }
      };
    }
  };

  // Plugin logger
  private createLogger(pluginName: string): PluginLogger {
    const prefix = `[${pluginName}]`;
    return {
      debug: (message: string, ...args: any[]) => {
        console.debug(prefix, message, ...args);
      },
      info: (message: string, ...args: any[]) => {
        console.info(prefix, message, ...args);
      },
      warn: (message: string, ...args: any[]) => {
        console.warn(prefix, message, ...args);
      },
      error: (message: string, ...args: any[]) => {
        console.error(prefix, message, ...args);
      }
    };
  }

  /**
   * Initialize plugin manager with editor instance
   */
  initialize(editorInstance: any): void {
    this._editorInstance = editorInstance;
  }

  /**
   * Register a plugin
   */
  async register(plugin: EditorPlugin): Promise<void> {
    if (this.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }

    // Validate plugin
    this.validatePlugin(plugin);

    // Check dependencies
    await this.checkDependencies(plugin);

    // Create registration
    const registration: PluginRegistration = {
      plugin,
      options: {},
      timestamp: Date.now(),
      loaded: false,
      enabled: false,
      state: {}
    };

    // Add to plugins map
    const plugins = new Map(this._plugins());
    plugins.set(plugin.name, registration);
    this._plugins.set(plugins);

    console.info(`Plugin '${plugin.name}' registered successfully`);
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginName: string): Promise<void> {
    const registration = this.getRegistration(pluginName);
    if (!registration) {
      throw new Error(`Plugin '${pluginName}' is not registered`);
    }

    // Unload if loaded
    if (this.isLoaded(pluginName)) {
      await this.unload(pluginName);
    }

    // Remove from plugins map
    const plugins = new Map(this._plugins());
    plugins.delete(pluginName);
    this._plugins.set(plugins);

    console.info(`Plugin '${pluginName}' unregistered successfully`);
  }

  /**
   * Get a registered plugin
   */
  get(pluginName: string): EditorPlugin | null {
    const registration = this.getRegistration(pluginName);
    return registration ? registration.plugin : null;
  }

  /**
   * Get all registered plugins
   */
  getAll(): EditorPlugin[] {
    const plugins = this._plugins();
    return Array.from(plugins.values()).map(reg => reg.plugin);
  }

  /**
   * Check if plugin is registered
   */
  has(pluginName: string): boolean {
    return this._plugins().has(pluginName);
  }

  /**
   * Load a plugin
   */
  async load(pluginName: string, options?: Record<string, any>): Promise<void> {
    const registration = this.getRegistration(pluginName);
    if (!registration) {
      throw new Error(`Plugin '${pluginName}' is not registered`);
    }

    if (this.isLoaded(pluginName)) {
      console.warn(`Plugin '${pluginName}' is already loaded`);
      return;
    }

    try {
      // Create plugin context
      const context = this.createPluginContext(registration.plugin, options);

      // Initialize plugin
      await registration.plugin.init(this._editorInstance, options);

      // Update registration
      registration.loaded = true;
      registration.options = options || {};

      // Add to loaded set
      const loadedPlugins = new Set(this._loadedPlugins());
      loadedPlugins.add(pluginName);
      this._loadedPlugins.set(loadedPlugins);

      // Auto-enable if not disabled
      if (!options?.disabled) {
        await this.enable(pluginName);
      }

      console.info(`Plugin '${pluginName}' loaded successfully`);
    } catch (error) {
      console.error(`Failed to load plugin '${pluginName}':`, error);
      throw error;
    }
  }

  /**
   * Unload a plugin
   */
  async unload(pluginName: string): Promise<void> {
    const registration = this.getRegistration(pluginName);
    if (!registration) {
      throw new Error(`Plugin '${pluginName}' is not registered`);
    }

    if (!this.isLoaded(pluginName)) {
      console.warn(`Plugin '${pluginName}' is not loaded`);
      return;
    }

    try {
      // Disable if enabled
      if (this.isEnabled(pluginName)) {
        await this.disable(pluginName);
      }

      // Destroy plugin if it has destroy method
      if (registration.plugin.destroy) {
        await registration.plugin.destroy();
      }

      // Update registration
      registration.loaded = false;
      registration.state = {};

      // Remove from loaded set
      const loadedPlugins = new Set(this._loadedPlugins());
      loadedPlugins.delete(pluginName);
      this._loadedPlugins.set(loadedPlugins);

      console.info(`Plugin '${pluginName}' unloaded successfully`);
    } catch (error) {
      console.error(`Failed to unload plugin '${pluginName}':`, error);
      throw error;
    }
  }

  /**
   * Get loaded plugins
   */
  getLoaded(): string[] {
    return Array.from(this._loadedPlugins());
  }

  /**
   * Check if plugin is loaded
   */
  isLoaded(pluginName: string): boolean {
    return this._loadedPlugins().has(pluginName);
  }

  /**
   * Enable a plugin
   */
  async enable(pluginName: string): Promise<void> {
    if (!this.isLoaded(pluginName)) {
      throw new Error(`Plugin '${pluginName}' is not loaded`);
    }

    if (this.isEnabled(pluginName)) {
      console.warn(`Plugin '${pluginName}' is already enabled`);
      return;
    }

    const registration = this.getRegistration(pluginName)!;
    registration.enabled = true;

    // Add to enabled set
    const enabledPlugins = new Set(this._enabledPlugins());
    enabledPlugins.add(pluginName);
    this._enabledPlugins.set(enabledPlugins);

    console.info(`Plugin '${pluginName}' enabled successfully`);
  }

  /**
   * Disable a plugin
   */
  async disable(pluginName: string): Promise<void> {
    if (!this.isEnabled(pluginName)) {
      console.warn(`Plugin '${pluginName}' is not enabled`);
      return;
    }

    const registration = this.getRegistration(pluginName)!;
    registration.enabled = false;

    // Remove from enabled set
    const enabledPlugins = new Set(this._enabledPlugins());
    enabledPlugins.delete(pluginName);
    this._enabledPlugins.set(enabledPlugins);

    console.info(`Plugin '${pluginName}' disabled successfully`);
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(pluginName: string): boolean {
    return this._enabledPlugins().has(pluginName);
  }

  /**
   * Get plugin registration
   */
  private getRegistration(pluginName: string): PluginRegistration | null {
    return this._plugins().get(pluginName) || null;
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: EditorPlugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }

    if (!plugin.version) {
      throw new Error('Plugin must have a version');
    }

    if (typeof plugin.init !== 'function') {
      throw new Error('Plugin must have an init function');
    }

    // Validate semantic version format
    const versionPattern = /^\d+\.\d+\.\d+/;
    if (!versionPattern.test(plugin.version)) {
      throw new Error('Plugin version must follow semantic versioning (x.y.z)');
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(plugin: EditorPlugin): Promise<void> {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return;
    }

    for (const dependency of plugin.dependencies) {
      if (!this.has(dependency)) {
        throw new Error(`Plugin '${plugin.name}' depends on '${dependency}' which is not registered`);
      }
    }
  }

  /**
   * Create plugin context
   */
  private createPluginContext(plugin: EditorPlugin, options: Record<string, any> = {}): PluginContext {
    return {
      editor: this._editorInstance,
      options,
      utils: this.utils,
      events: this._editorInstance?.eventService,
      logger: this.createLogger(plugin.name)
    };
  }

  /**
   * Load plugins in dependency order
   */
  async loadAll(options?: Record<string, Record<string, any>>): Promise<void> {
    const plugins = Array.from(this._plugins().keys());
    const loadOrder = this.resolveDependencyOrder(plugins);

    for (const pluginName of loadOrder) {
      const pluginOptions = options?.[pluginName] || {};
      if (!this.isLoaded(pluginName)) {
        await this.load(pluginName, pluginOptions);
      }
    }
  }

  /**
   * Resolve plugin dependency order
   */
  private resolveDependencyOrder(pluginNames: string[]): string[] {
    const resolved: string[] = [];
    const resolving: Set<string> = new Set();

    const resolve = (name: string): void => {
      if (resolved.includes(name)) return;
      if (resolving.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      resolving.add(name);
      
      const plugin = this.get(name);
      if (plugin?.dependencies) {
        for (const dependency of plugin.dependencies) {
          if (pluginNames.includes(dependency)) {
            resolve(dependency);
          }
        }
      }

      resolving.delete(name);
      resolved.push(name);
    };

    for (const name of pluginNames) {
      resolve(name);
    }

    return resolved;
  }

  /**
   * Destroy plugin manager and cleanup
   */
  destroy(): void {
    // Unload all plugins
    const loadedPlugins = Array.from(this._loadedPlugins());
    loadedPlugins.forEach(pluginName => {
      try {
        this.unload(pluginName);
      } catch (error) {
        console.error(`Failed to unload plugin ${pluginName}:`, error);
      }
    });

    // Clear all state
    this._plugins.set(new Map());
    this._loadedPlugins.set(new Set());
    this._enabledPlugins.set(new Set());
    this._editorInstance = null;
  }
}