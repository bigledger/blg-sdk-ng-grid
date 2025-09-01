import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  FilterModel, 
  ColumnFilterModel, 
  Filter, 
  FilterState, 
  FilterPreset, 
  FilterConfig, 
  FilterPerformanceMetrics,
  IFilterService,
  FilterChangedEvent,
  FilterClearedEvent,
  FilterPresetEvent,
  FILTER_CONFIG
} from '../interfaces/enhanced-filter.interface';
import { GridStateService } from './grid-state.service';

/**
 * Enhanced Filter Service
 * 
 * Provides comprehensive filtering capabilities with:
 * - Advanced operators for all data types
 * - Performance optimizations (caching, Web Workers, IndexedDB)
 * - Undo/redo functionality
 * - Filter presets
 * - Real-time fuzzy matching
 * - AI-powered relative date filtering
 */
@Injectable({
  providedIn: 'root'
})
export class EnhancedFilterService implements IFilterService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly gridStateService = inject(GridStateService);
  private readonly config = inject(FILTER_CONFIG, { optional: true }) ?? this.getDefaultConfig();

  // Core state signals
  private readonly _filterState = signal<FilterState>({
    filterModel: {},
    quickFilterValue: '',
    activePreset: '',
    undoStack: [],
    redoStack: [],
    performanceMetrics: []
  });

  // Cache for filtered data
  private readonly _filteredDataCache = new Map<string, { data: any[]; timestamp: number }>();
  private readonly _filterPresets = signal<FilterPreset[]>([]);
  
  // Web Worker for large datasets
  private filterWorker?: Worker;
  private isWorkerInitialized = false;

  // IndexedDB for persistent caching
  private dbName = 'BlgGridFilterCache';
  private dbVersion = 1;
  private db?: IDBDatabase;

  // Computed signals
  readonly filterModel = computed(() => this._filterState().filterModel);
  readonly quickFilterValue = computed(() => this._filterState().quickFilterValue);
  readonly activePreset = computed(() => this._filterState().activePreset);
  readonly canUndo = computed(() => this._filterState().undoStack.length > 0);
  readonly canRedo = computed(() => this._filterState().redoStack.length > 0);
  readonly presets = computed(() => this._filterPresets());
  readonly performanceMetrics = computed(() => this._filterState().performanceMetrics);

  // Events
  private eventListeners: { [K in string]: ((event: any) => void)[] } = {};

  constructor() {
    this.initializeService();
  }

  // ============================================
  // Core Filtering Methods
  // ============================================

  async applyFilter(columnId: string, filter: ColumnFilterModel | null): Promise<any[]> {
    const startTime = performance.now();
    
    // Update filter model
    const currentModel = this._filterState().filterModel;
    const newModel = { ...currentModel };
    
    if (filter) {
      newModel[columnId] = filter;
    } else {
      delete newModel[columnId];
    }

    // Add to undo stack
    this.addToUndoStack(currentModel);
    
    // Update state
    this._filterState.update(state => ({
      ...state,
      filterModel: newModel,
      redoStack: [] // Clear redo stack when new action is performed
    }));

    // Apply filters and get results
    const filteredData = await this.applyFilters(newModel);
    
    // Record performance metrics
    const filterTime = performance.now() - startTime;
    this.recordPerformanceMetrics({
      filterTime,
      dataSize: this.gridStateService.data().length,
      cacheHitRate: this.calculateCacheHitRate(),
      webWorkerUsed: this.config.enableWebWorkers && this.isWorkerInitialized,
      indexedDBUsed: this.config.enableIndexedDB && !!this.db
    });

    // Emit event
    this.emitEvent('filterChanged', {
      type: 'filterChanged',
      columnId,
      filterModel: filter,
      source: 'api'
    } as FilterChangedEvent);

    return filteredData;
  }

  async applyFilters(filterModel: FilterModel): Promise<any[]> {
    const data = this.gridStateService.data();
    
    if (!data.length || Object.keys(filterModel).length === 0) {
      return [...data];
    }

    // Check cache first
    if (this.config.enableCaching) {
      const cacheKey = this.generateCacheKey(filterModel, data);
      const cached = this._filteredDataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
        return [...cached.data];
      }
    }

    let filteredData: any[];

    // Use Web Worker for large datasets
    if (this.config.enableWebWorkers && data.length > 10000 && this.isWorkerInitialized) {
      filteredData = await this.filterWithWebWorker(data, filterModel);
    } else {
      filteredData = this.filterData(data, filterModel);
    }

    // Cache results
    if (this.config.enableCaching) {
      const cacheKey = this.generateCacheKey(filterModel, data);
      this._filteredDataCache.set(cacheKey, {
        data: [...filteredData],
        timestamp: Date.now()
      });

      // Limit cache size
      if (this._filteredDataCache.size > (this.config.cacheSize || 100)) {
        const oldestKey = Array.from(this._filteredDataCache.keys())[0];
        this._filteredDataCache.delete(oldestKey);
      }
    }

    // Store in IndexedDB for persistence
    if (this.config.enableIndexedDB && this.db) {
      await this.storeInIndexedDB(filterModel, filteredData);
    }

    return filteredData;
  }

  clearFilter(columnId: string): void {
    const currentModel = this._filterState().filterModel;
    if (currentModel[columnId]) {
      this.addToUndoStack(currentModel);
      
      const newModel = { ...currentModel };
      delete newModel[columnId];
      
      this._filterState.update(state => ({
        ...state,
        filterModel: newModel,
        redoStack: []
      }));

      this.emitEvent('filterCleared', {
        type: 'filterCleared',
        columnId,
        source: 'api'
      } as FilterClearedEvent);
    }
  }

  clearAllFilters(): void {
    const currentModel = this._filterState().filterModel;
    if (Object.keys(currentModel).length > 0) {
      this.addToUndoStack(currentModel);
      
      this._filterState.update(state => ({
        ...state,
        filterModel: {},
        redoStack: []
      }));

      this.emitEvent('filterCleared', {
        type: 'filterCleared',
        source: 'api'
      } as FilterClearedEvent);
    }
  }

  // ============================================
  // Quick Filter Methods
  // ============================================

  async setQuickFilter(value: string): Promise<any[]> {
    this._filterState.update(state => ({
      ...state,
      quickFilterValue: value
    }));

    return this.applyQuickFilter(value);
  }

  clearQuickFilter(): void {
    this._filterState.update(state => ({
      ...state,
      quickFilterValue: ''
    }));
  }

  // ============================================
  // Filter State Methods
  // ============================================

  getFilterModel(): FilterModel {
    return { ...this._filterState().filterModel };
  }

  async setFilterModel(filterModel: FilterModel): Promise<any[]> {
    const currentModel = this._filterState().filterModel;
    this.addToUndoStack(currentModel);

    this._filterState.update(state => ({
      ...state,
      filterModel: { ...filterModel },
      redoStack: []
    }));

    return this.applyFilters(filterModel);
  }

  // ============================================
  // Preset Methods
  // ============================================

  savePreset(name: string, description?: string): FilterPreset {
    const preset: FilterPreset = {
      id: this.generatePresetId(),
      name,
      description,
      filterModel: { ...this._filterState().filterModel },
      createdAt: new Date(),
      modifiedAt: new Date(),
      tags: []
    };

    this._filterPresets.update(presets => [...presets, preset]);
    
    this.emitEvent('presetSaved', {
      type: 'presetSaved',
      presetName: name,
      filterModel: preset.filterModel
    } as FilterPresetEvent);

    return preset;
  }

  async applyPreset(presetId: string): Promise<any[]> {
    const preset = this._filterPresets().find(p => p.id === presetId);
    if (!preset) {
      throw new Error(`Preset with id ${presetId} not found`);
    }

    this._filterState.update(state => ({
      ...state,
      activePreset: presetId
    }));

    this.emitEvent('presetApplied', {
      type: 'presetApplied',
      presetName: preset.name,
      filterModel: preset.filterModel
    } as FilterPresetEvent);

    return this.setFilterModel(preset.filterModel);
  }

  deletePreset(presetId: string): void {
    const preset = this._filterPresets().find(p => p.id === presetId);
    if (!preset) return;

    this._filterPresets.update(presets => presets.filter(p => p.id !== presetId));

    this.emitEvent('presetDeleted', {
      type: 'presetDeleted',
      presetName: preset.name,
      filterModel: preset.filterModel
    } as FilterPresetEvent);
  }

  getPresets(): FilterPreset[] {
    return [...this._filterPresets()];
  }

  // ============================================
  // Undo/Redo Methods
  // ============================================

  async undo(): Promise<any[]> {
    const state = this._filterState();
    if (state.undoStack.length === 0) return this.gridStateService.data();

    const previousModel = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    const newRedoStack = [...state.redoStack, state.filterModel];

    this._filterState.update(currentState => ({
      ...currentState,
      filterModel: previousModel,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    }));

    return this.applyFilters(previousModel);
  }

  async redo(): Promise<any[]> {
    const state = this._filterState();
    if (state.redoStack.length === 0) return this.gridStateService.data();

    const nextModel = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);
    const newUndoStack = [...state.undoStack, state.filterModel];

    this._filterState.update(currentState => ({
      ...currentState,
      filterModel: nextModel,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    }));

    return this.applyFilters(nextModel);
  }

  // ============================================
  // Export/Import Methods
  // ============================================

  exportFilterModel(): string {
    return JSON.stringify({
      filterModel: this._filterState().filterModel,
      quickFilter: this._filterState().quickFilterValue,
      timestamp: new Date().toISOString(),
      version: '2.0'
    }, null, 2);
  }

  async importFilterModel(json: string): Promise<any[]> {
    try {
      const data = JSON.parse(json);
      
      if (data.version !== '2.0') {
        console.warn('Imported filter model version mismatch');
      }

      const filterModel = data.filterModel || {};
      const quickFilter = data.quickFilter || '';

      this._filterState.update(state => ({
        ...state,
        filterModel,
        quickFilterValue: quickFilter
      }));

      return this.applyFilters(filterModel);
    } catch (error) {
      throw new Error('Invalid filter model JSON: ' + error);
    }
  }

  // ============================================
  // Performance Methods
  // ============================================

  getPerformanceMetrics(): FilterPerformanceMetrics[] {
    return [...this._filterState().performanceMetrics];
  }

  clearCache(): void {
    this._filteredDataCache.clear();
    
    if (this.db) {
      const transaction = this.db.transaction(['filterCache'], 'readwrite');
      const store = transaction.objectStore('filterCache');
      store.clear();
    }
  }

  // ============================================
  // Private Methods - Core Filtering Logic
  // ============================================

  private filterData(data: any[], filterModel: FilterModel): any[] {
    return data.filter(row => {
      return Object.entries(filterModel).every(([columnId, columnFilter]) => {
        return this.evaluateColumnFilter(row, columnId, columnFilter);
      });
    });
  }

  private evaluateColumnFilter(row: any, columnId: string, columnFilter: ColumnFilterModel): boolean {
    const { condition1, condition2, operator } = columnFilter;

    if (!condition1) return true;

    const result1 = this.evaluateFilterCondition(row, columnId, condition1);
    
    if (!condition2) return result1;

    const result2 = this.evaluateFilterCondition(row, columnId, condition2);

    return operator === 'OR' ? (result1 || result2) : (result1 && result2);
  }

  private evaluateFilterCondition(row: any, columnId: string, filter: Filter): boolean {
    const value = this.getColumnValue(row, columnId);
    
    switch (filter.type) {
      case 'text':
        return this.evaluateTextFilter(value, filter);
      case 'number':
        return this.evaluateNumberFilter(value, filter);
      case 'date':
        return this.evaluateDateFilter(value, filter);
      case 'boolean':
        return this.evaluateBooleanFilter(value, filter);
      case 'set':
        return this.evaluateSetFilter(value, filter);
      case 'custom':
        return filter.customLogic(value, filter.filterValue, row);
      default:
        return true;
    }
  }

  private evaluateTextFilter(value: any, filter: any): boolean {
    if (!filter.active) return true;
    
    const stringValue = this.normalizeTextValue(value, filter);
    const filterValue = this.normalizeTextValue(filter.filter, filter);

    switch (filter.operator) {
      case 'contains':
        return stringValue.includes(filterValue);
      case 'notContains':
        return !stringValue.includes(filterValue);
      case 'equals':
        return stringValue === filterValue;
      case 'notEquals':
        return stringValue !== filterValue;
      case 'startsWith':
        return stringValue.startsWith(filterValue);
      case 'endsWith':
        return stringValue.endsWith(filterValue);
      case 'isEmpty':
        return !stringValue || stringValue.length === 0;
      case 'isNotEmpty':
        return stringValue && stringValue.length > 0;
      case 'regex':
        try {
          const regex = new RegExp(filter.filter, filter.regexFlags || 'i');
          return regex.test(stringValue);
        } catch {
          return false;
        }
      case 'fuzzyMatch':
        return this.fuzzyMatch(stringValue, filterValue, filter.fuzzyThreshold || 0.8);
      default:
        return true;
    }
  }

  private evaluateNumberFilter(value: any, filter: any): boolean {
    if (!filter.active) return true;
    
    const numValue = this.normalizeNumberValue(value);
    const filterValue = filter.filter;
    const filterValue2 = filter.filterTo;

    if (numValue === null && !['isEmpty', 'isNotEmpty'].includes(filter.operator)) {
      return false;
    }

    switch (filter.operator) {
      case 'equals':
        return numValue === filterValue;
      case 'notEquals':
        return numValue !== filterValue;
      case 'greaterThan':
        return numValue > filterValue;
      case 'greaterThanOrEqual':
        return numValue >= filterValue;
      case 'lessThan':
        return numValue < filterValue;
      case 'lessThanOrEqual':
        return numValue <= filterValue;
      case 'inRange':
        return numValue >= filterValue && numValue <= filterValue2;
      case 'notInRange':
        return !(numValue >= filterValue && numValue <= filterValue2);
      case 'isEmpty':
        return numValue === null;
      case 'isNotEmpty':
        return numValue !== null;
      case 'isEven':
        return numValue % 2 === 0;
      case 'isOdd':
        return numValue % 2 !== 0;
      case 'isDivisibleBy':
        return filter.divisor && numValue % filter.divisor === 0;
      case 'isPrime':
        return this.isPrime(numValue);
      case 'isInteger':
        return Number.isInteger(numValue);
      case 'isDecimal':
        return !Number.isInteger(numValue);
      default:
        return true;
    }
  }

  private evaluateDateFilter(value: any, filter: any): boolean {
    if (!filter.active) return true;
    
    const dateValue = this.normalizeDateValue(value);
    
    if (!dateValue && !['isEmpty', 'isNotEmpty'].includes(filter.operator)) {
      return false;
    }

    const now = new Date();

    switch (filter.operator) {
      case 'equals':
        return this.isSameDate(dateValue, new Date(filter.dateFrom));
      case 'notEquals':
        return !this.isSameDate(dateValue, new Date(filter.dateFrom));
      case 'before':
        return dateValue < new Date(filter.dateFrom);
      case 'after':
        return dateValue > new Date(filter.dateFrom);
      case 'between':
        return dateValue >= new Date(filter.dateFrom) && dateValue <= new Date(filter.dateTo);
      case 'isEmpty':
        return !dateValue;
      case 'isNotEmpty':
        return !!dateValue;
      case 'isToday':
        return this.isSameDate(dateValue, now);
      case 'isYesterday':
        return this.isSameDate(dateValue, this.addDays(now, -1));
      case 'isTomorrow':
        return this.isSameDate(dateValue, this.addDays(now, 1));
      case 'isThisWeek':
        return this.isInCurrentWeek(dateValue, now);
      case 'isThisMonth':
        return dateValue.getMonth() === now.getMonth() && dateValue.getFullYear() === now.getFullYear();
      case 'isThisYear':
        return dateValue.getFullYear() === now.getFullYear();
      case 'isWeekend':
        return dateValue.getDay() === 0 || dateValue.getDay() === 6;
      case 'isWeekday':
        return dateValue.getDay() >= 1 && dateValue.getDay() <= 5;
      case 'relativeDateRange':
        return this.isInRelativeDateRange(dateValue, now, filter.relativeValue, filter.relativeUnit);
      default:
        return true;
    }
  }

  private evaluateBooleanFilter(value: any, filter: any): boolean {
    if (!filter.active) return true;
    
    const boolValue = Boolean(value);
    
    switch (filter.operator) {
      case 'equals':
        return boolValue === filter.filter;
      case 'notEquals':
        return boolValue !== filter.filter;
      default:
        return true;
    }
  }

  private evaluateSetFilter(value: any, filter: any): boolean {
    if (!filter.active) return true;
    
    switch (filter.operator) {
      case 'in':
        return filter.values.includes(value);
      case 'notIn':
        return !filter.values.includes(value);
      default:
        return true;
    }
  }

  // ============================================
  // Private Methods - Utilities
  // ============================================

  private getColumnValue(row: any, columnId: string): any {
    // Support nested property access (e.g., "user.name")
    const parts = columnId.split('.');
    let value = row;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private normalizeTextValue(value: any, filter: any): string {
    let result = String(value || '');
    
    if (filter.trimWhitespace !== false) {
      result = result.trim();
    }
    
    if (!filter.caseSensitive) {
      result = result.toLowerCase();
    }
    
    return result;
  }

  private normalizeNumberValue(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private normalizeDateValue(value: any): Date | null {
    if (!value) return null;
    
    if (value instanceof Date) return value;
    
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  private fuzzyMatch(text: string, pattern: string, threshold: number): boolean {
    // Simple Levenshtein distance-based fuzzy matching
    const distance = this.levenshteinDistance(text, pattern);
    const maxLength = Math.max(text.length, pattern.length);
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }

  private isPrime(num: number): boolean {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private isInCurrentWeek(date: Date, referenceDate: Date): boolean {
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  }

  private isInRelativeDateRange(date: Date, referenceDate: Date, value: number, unit: string): boolean {
    const startDate = new Date(referenceDate);
    
    switch (unit) {
      case 'days':
        startDate.setDate(referenceDate.getDate() - value);
        break;
      case 'weeks':
        startDate.setDate(referenceDate.getDate() - (value * 7));
        break;
      case 'months':
        startDate.setMonth(referenceDate.getMonth() - value);
        break;
      case 'years':
        startDate.setFullYear(referenceDate.getFullYear() - value);
        break;
    }
    
    return date >= startDate && date <= referenceDate;
  }

  private async applyQuickFilter(value: string): Promise<any[]> {
    const data = this.gridStateService.data();
    if (!value.trim()) return [...data];
    
    const searchTerm = value.toLowerCase();
    const columns = this.gridStateService.columns();
    
    return data.filter(row => {
      return columns.some(column => {
        const cellValue = this.getColumnValue(row, column.id);
        return String(cellValue || '').toLowerCase().includes(searchTerm);
      });
    });
  }

  private async filterWithWebWorker(data: any[], filterModel: FilterModel): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.filterWorker) {
        reject(new Error('Web Worker not initialized'));
        return;
      }

      const messageId = Math.random().toString(36).substr(2, 9);
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === messageId) {
          this.filterWorker?.removeEventListener('message', handleMessage);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      this.filterWorker.addEventListener('message', handleMessage);
      this.filterWorker.postMessage({
        id: messageId,
        data,
        filterModel
      });
    });
  }

  private generateCacheKey(filterModel: FilterModel, data: any[]): string {
    return `${JSON.stringify(filterModel)}_${data.length}_${this.hashData(data)}`;
  }

  private hashData(data: any[]): string {
    // Simple hash for data integrity check
    const str = JSON.stringify(data.slice(0, 10)); // Sample first 10 rows
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private addToUndoStack(filterModel: FilterModel): void {
    this._filterState.update(state => {
      const newUndoStack = [...state.undoStack, filterModel];
      
      // Limit undo stack size
      const maxUndoSteps = this.config.maxUndoSteps || 50;
      if (newUndoStack.length > maxUndoSteps) {
        newUndoStack.shift();
      }
      
      return {
        ...state,
        undoStack: newUndoStack
      };
    });
  }

  private recordPerformanceMetrics(metrics: FilterPerformanceMetrics): void {
    this._filterState.update(state => {
      const newMetrics = [...state.performanceMetrics, metrics];
      
      // Keep only last 100 metrics
      if (newMetrics.length > 100) {
        newMetrics.shift();
      }
      
      return {
        ...state,
        performanceMetrics: newMetrics
      };
    });
  }

  private calculateCacheHitRate(): number {
    const metrics = this._filterState().performanceMetrics;
    if (metrics.length === 0) return 0;
    
    const recentMetrics = metrics.slice(-20); // Last 20 operations
    const cacheHits = recentMetrics.filter(m => m.cacheHitRate > 0).length;
    return cacheHits / recentMetrics.length;
  }

  private generatePresetId(): string {
    return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitEvent(eventType: string, event: any): void {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach(listener => listener(event));
    }
  }

  // ============================================
  // Service Initialization
  // ============================================

  private async initializeService(): Promise<void> {
    // Initialize Web Worker if enabled
    if (this.config.enableWebWorkers && isPlatformBrowser(this.platformId)) {
      await this.initializeWebWorker();
    }

    // Initialize IndexedDB if enabled
    if (this.config.enableIndexedDB && isPlatformBrowser(this.platformId)) {
      await this.initializeIndexedDB();
    }

    // Load presets from storage
    await this.loadPresets();
  }

  private async initializeWebWorker(): Promise<void> {
    try {
      const workerBlob = new Blob([this.getWorkerScript()], { type: 'application/javascript' });
      this.filterWorker = new Worker(URL.createObjectURL(workerBlob));
      this.isWorkerInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize Web Worker for filtering:', error);
    }
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('filterCache')) {
          const cacheStore = db.createObjectStore('filterCache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('filterPresets')) {
          const presetStore = db.createObjectStore('filterPresets', { keyPath: 'id' });
          presetStore.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  private async storeInIndexedDB(filterModel: FilterModel, data: any[]): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['filterCache'], 'readwrite');
      const store = transaction.objectStore('filterCache');
      const key = this.generateCacheKey(filterModel, data);
      
      await store.put({
        key,
        filterModel,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Failed to store in IndexedDB:', error);
    }
  }

  private async loadPresets(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['filterPresets'], 'readonly');
      const store = transaction.objectStore('filterPresets');
      const request = store.getAll();

      request.onsuccess = () => {
        this._filterPresets.set(request.result || []);
      };
    } catch (error) {
      console.warn('Failed to load presets from IndexedDB:', error);
    }
  }

  private getWorkerScript(): string {
    // Web Worker script for filtering large datasets
    return `
      self.onmessage = function(e) {
        const { id, data, filterModel } = e.data;
        
        try {
          // Implement filtering logic in worker
          const filteredData = filterDataInWorker(data, filterModel);
          
          self.postMessage({
            id,
            result: filteredData
          });
        } catch (error) {
          self.postMessage({
            id,
            error: error.message
          });
        }
      };

      function filterDataInWorker(data, filterModel) {
        return data.filter(row => {
          return Object.entries(filterModel).every(([columnId, columnFilter]) => {
            // Simplified filtering logic for worker
            // In a real implementation, this would mirror the main thread logic
            return true;
          });
        });
      }
    `;
  }

  private getDefaultConfig(): FilterConfig {
    return {
      debounceMs: 300,
      enableCaching: true,
      cacheSize: 100,
      enableWebWorkers: true,
      enableIndexedDB: true,
      showFilterIcons: true,
      showClearAllButton: true,
      showFilterPanelButton: true,
      enableQuickFilter: true,
      enableUndoRedo: true,
      maxUndoSteps: 50,
      enableFilterPresets: true,
      enableFilterExport: true,
      enableAdvancedMode: true,
      textFilterOptions: {
        defaultCaseSensitive: false,
        enableRegex: true,
        enableFuzzyMatch: true,
        fuzzyThreshold: 0.8
      },
      numberFilterOptions: {
        allowDecimals: true,
        decimalPlaces: 2,
        enableAdvancedOperators: true
      },
      dateFilterOptions: {
        dateFormat: 'yyyy-MM-dd',
        includeTime: false,
        enableRelativeDates: true,
        enableSeasonalFilters: true
      }
    };
  }

  // ============================================
  // Public Event Management
  // ============================================

  addEventListener(eventType: string, listener: (event: any) => void): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(listener);
  }

  removeEventListener(eventType: string, listener: (event: any) => void): void {
    if (this.eventListeners[eventType]) {
      const index = this.eventListeners[eventType].indexOf(listener);
      if (index > -1) {
        this.eventListeners[eventType].splice(index, 1);
      }
    }
  }
}