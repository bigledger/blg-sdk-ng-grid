import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, catchError, tap, debounceTime } from 'rxjs/operators';

import {
  SetFilterValue,
  SetFilterConfig,
  SetFilterSearchMode,
  SetFilterSortBy,
  SetFilterCategory,
  SetFilterTemplate,
  SetFilterSuggestion,
  SetFilterPrediction,
  SetFilterHierarchyConfig,
  SetFilterGroup,
  SetFilterPerformanceMetrics,
  EnhancedSetFilter,
  ISetFilterService,
  DEFAULT_SET_FILTER_CONFIG,
  SetFilterUtils
} from './set-filter.interface';

/**
 * Advanced Set Filter Service
 * 
 * Provides comprehensive set filter functionality including:
 * - Value extraction and processing
 * - Advanced search capabilities (fuzzy, regex, semantic, voice)
 * - Hierarchical data organization
 * - AI-powered categorization and suggestions
 * - Performance optimization with caching and web workers
 * - Template management and export/import
 */
@Injectable({
  providedIn: 'root'
})
export class SetFilterService implements ISetFilterService {
  private config: SetFilterConfig = DEFAULT_SET_FILTER_CONFIG;
  private cacheStorage = new Map<string, any>();
  private indexedDBAvailable = false;
  private webWorkerAvailable = false;
  private searchWorker?: Worker;
  
  // Performance tracking
  private performanceMetrics = new BehaviorSubject<SetFilterPerformanceMetrics | null>(null);
  
  // Template storage (in production, this would be persistent storage)
  private templates = new Map<string, SetFilterTemplate>();
  
  // AI model cache (placeholder for real ML models)
  private categoryModels = new Map<string, any>();

  constructor() {
    this.initializeService();
  }

  // ============================================
  // Core Value Management
  // ============================================

  async extractUniqueValues(data: any[], column: string): Promise<SetFilterValue[]> {
    const startTime = performance.now();
    
    try {
      // Use web worker for large datasets if available
      if (this.webWorkerAvailable && data.length > this.config.performanceConfig.webWorkerChunkSize) {
        return await this.extractUniqueValuesWithWorker(data, column);
      }
      
      // Standard extraction
      const values = this.extractUniqueValuesSync(data, column);
      
      // Record performance
      const extractionTime = performance.now() - startTime;
      this.updatePerformanceMetrics({
        uniqueValueExtractionTime: extractionTime,
        uniqueValueCount: values.length
      });
      
      return values;
      
    } catch (error) {
      console.error('Error extracting unique values:', error);
      throw error;
    }
  }

  private extractUniqueValuesSync(data: any[], column: string): SetFilterValue[] {
    const valueMap = new Map<any, { count: number; firstSeen: Date }>();
    const total = data.length;
    
    // Extract and count values
    data.forEach(item => {
      const value = this.getValue(item, column);
      const key = this.normalizeValue(value);
      
      if (valueMap.has(key)) {
        valueMap.get(key)!.count++;
      } else {
        valueMap.set(key, { count: 1, firstSeen: new Date() });
      }
    });
    
    // Convert to SetFilterValue objects
    const values: SetFilterValue[] = [];
    valueMap.forEach(({ count, firstSeen }, value) => {
      values.push({
        value,
        displayValue: this.formatDisplayValue(value),
        originalValue: value,
        selected: false,
        count,
        percentage: (count / total) * 100,
        frequency: count / total,
        lastAccessed: firstSeen,
        accessCount: 0
      });
    });
    
    return values;
  }

  private async extractUniqueValuesWithWorker(data: any[], column: string): Promise<SetFilterValue[]> {
    return new Promise((resolve, reject) => {
      if (!this.searchWorker) {
        this.initializeWebWorker();
      }
      
      if (!this.searchWorker) {
        // Fallback to sync method
        resolve(this.extractUniqueValuesSync(data, column));
        return;
      }
      
      const messageId = Date.now().toString();
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === messageId) {
          this.searchWorker!.removeEventListener('message', handleMessage);
          
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };
      
      this.searchWorker.addEventListener('message', handleMessage);
      
      // Send data in chunks to avoid memory issues
      this.searchWorker.postMessage({
        id: messageId,
        type: 'extractUniqueValues',
        data,
        column,
        chunkSize: this.config.performanceConfig.webWorkerChunkSize
      });
    });
  }

  async searchValues(
    values: SetFilterValue[], 
    searchTerm: string, 
    mode: SetFilterSearchMode
  ): Promise<SetFilterValue[]> {
    if (!searchTerm.trim()) {
      return values;
    }
    
    const startTime = performance.now();
    
    try {
      let filteredValues: SetFilterValue[];
      
      switch (mode) {
        case 'contains':
          filteredValues = this.searchContains(values, searchTerm);
          break;
        case 'fuzzy':
          filteredValues = await this.searchFuzzy(values, searchTerm);
          break;
        case 'regex':
          filteredValues = this.searchRegex(values, searchTerm);
          break;
        case 'phonetic':
          filteredValues = await this.searchPhonetic(values, searchTerm);
          break;
        case 'semantic':
          filteredValues = await this.searchSemantic(values, searchTerm);
          break;
        case 'voice':
          // Voice search is handled by the component, treat as fuzzy
          filteredValues = await this.searchFuzzy(values, searchTerm);
          break;
        default:
          filteredValues = this.searchContains(values, searchTerm);
      }
      
      const searchTime = performance.now() - startTime;
      this.updatePerformanceMetrics({ searchTime });
      
      return filteredValues;
      
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to contains search
      return this.searchContains(values, searchTerm);
    }
  }

  sortValues(
    values: SetFilterValue[], 
    sortBy: SetFilterSortBy, 
    order: 'asc' | 'desc'
  ): SetFilterValue[] {
    const startTime = performance.now();
    
    const sorted = [...values].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'value':
          comparison = this.compareValues(a.value, b.value);
          break;
        case 'display':
          comparison = a.displayValue.localeCompare(b.displayValue);
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'percentage':
          comparison = a.percentage - b.percentage;
          break;
        case 'recent':
          comparison = (a.lastAccessed?.getTime() || 0) - (b.lastAccessed?.getTime() || 0);
          break;
        case 'alphabetical':
          comparison = a.displayValue.localeCompare(b.displayValue, undefined, { numeric: true });
          break;
        case 'custom':
          // Custom sort would be provided via config
          comparison = 0;
          break;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    const sortTime = performance.now() - startTime;
    this.updatePerformanceMetrics({ sortingTime: sortTime });
    
    return sorted;
  }

  // ============================================
  // Hierarchical Operations
  // ============================================

  buildHierarchy(values: SetFilterValue[], config: SetFilterHierarchyConfig): SetFilterGroup[] {
    if (!config.enabled || !config.groupByProperty) {
      return [];
    }
    
    const groups = new Map<string, SetFilterGroup>();
    const rootGroups: SetFilterGroup[] = [];
    
    values.forEach(value => {
      const groupKey = this.getGroupKey(value, config.groupByProperty);
      const groupPath = this.buildGroupPath(groupKey, config.maxDepth);
      
      this.ensureGroupPath(groupPath, groups, rootGroups, config);
      this.addValueToGroup(value, groupPath, groups);
    });
    
    // Calculate counts and sort groups
    this.calculateGroupCounts(rootGroups);
    this.sortGroups(rootGroups, 'name', 'asc');
    
    return rootGroups;
  }

  expandGroup(groupId: string, expand: boolean): void {
    // This would be implemented to work with the tree component
    // to maintain group expansion state
  }

  selectGroup(groupId: string, select: boolean): void {
    // This would be implemented to handle group selection
    // and propagate selection to child values
  }

  // ============================================
  // AI-Powered Features
  // ============================================

  async categorizeValues(values: SetFilterValue[]): Promise<SetFilterCategory[]> {
    try {
      // In a real implementation, this would call an ML service
      // For demo purposes, we'll create rule-based categories
      
      const categories: SetFilterCategory[] = [];
      
      // Numeric category
      const numericValues = values.filter(v => typeof v.value === 'number');
      if (numericValues.length > 0) {
        categories.push({
          id: 'numeric',
          name: 'Numbers',
          description: 'Numeric values',
          color: '#3182ce',
          icon: 'icon-number',
          confidence: 1.0,
          values: numericValues.map(v => v.value),
          modelVersion: '1.0',
          lastUpdated: new Date(),
          accuracy: 1.0
        });
      }
      
      // Text category
      const textValues = values.filter(v => typeof v.value === 'string' && isNaN(Number(v.value)));
      if (textValues.length > 0) {
        categories.push({
          id: 'text',
          name: 'Text',
          description: 'Text values',
          color: '#38a169',
          icon: 'icon-text',
          confidence: 1.0,
          values: textValues.map(v => v.value),
          modelVersion: '1.0',
          lastUpdated: new Date(),
          accuracy: 1.0
        });
      }
      
      // Date category (basic detection)
      const dateValues = values.filter(v => this.couldBeDate(v.value));
      if (dateValues.length > 0) {
        categories.push({
          id: 'dates',
          name: 'Dates',
          description: 'Date and time values',
          color: '#dd6b20',
          icon: 'icon-calendar',
          confidence: 0.8,
          values: dateValues.map(v => v.value),
          modelVersion: '1.0',
          lastUpdated: new Date(),
          accuracy: 0.8
        });
      }
      
      // High frequency category
      const totalCount = values.reduce((sum, v) => sum + v.count, 0);
      const highFreqValues = values.filter(v => v.percentage > 5);
      if (highFreqValues.length > 0 && highFreqValues.length < values.length) {
        categories.push({
          id: 'frequent',
          name: 'Most Common',
          description: 'Frequently occurring values (>5% of data)',
          color: '#e53e3e',
          icon: 'icon-star',
          confidence: 1.0,
          values: highFreqValues.map(v => v.value),
          modelVersion: '1.0',
          lastUpdated: new Date(),
          accuracy: 1.0
        });
      }
      
      return categories;
      
    } catch (error) {
      console.error('Error categorizing values:', error);
      return [];
    }
  }

  async generateSuggestions(context: any): Promise<SetFilterSuggestion[]> {
    try {
      // Placeholder for AI-powered suggestions
      // In real implementation, this would use ML models
      
      const suggestions: SetFilterSuggestion[] = [];
      
      // Mock suggestions based on context
      if (context.recentlySelected?.length > 0) {
        context.recentlySelected.slice(0, 3).forEach((value: any, index: number) => {
          suggestions.push({
            value,
            displayValue: String(value),
            confidence: 0.9 - (index * 0.1),
            reasoning: 'Based on your recent selections',
            basedOn: 'user_behavior',
            context: { recentlySelected: true }
          });
        });
      }
      
      return suggestions;
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  async predictValues(historicalData: any[]): Promise<SetFilterPrediction> {
    try {
      // Placeholder for ML-based value prediction
      // In real implementation, this would use time series analysis
      
      return {
        predictedValues: [],
        accuracy: 0.0,
        modelType: 'frequency',
        lastTrainingDate: new Date(),
        sampleSize: historicalData.length
      };
      
    } catch (error) {
      console.error('Error predicting values:', error);
      return {
        predictedValues: [],
        accuracy: 0.0,
        modelType: 'frequency',
        lastTrainingDate: new Date(),
        sampleSize: 0
      };
    }
  }

  // ============================================
  // Template Management
  // ============================================

  saveTemplate(name: string, filter: EnhancedSetFilter): SetFilterTemplate {
    const template: SetFilterTemplate = {
      id: Date.now().toString(),
      name,
      tags: ['user-created'],
      selectedValues: Array.from(filter.selectedValues),
      operator: filter.operator,
      searchTerm: filter.searchTerm,
      categories: filter.categories?.map(c => c.id),
      createdAt: new Date(),
      modifiedAt: new Date(),
      usageCount: 0,
      isPublic: false,
      version: '1.0',
      compatibility: ['1.0']
    };
    
    this.templates.set(template.id, template);
    
    // Persist to storage if available
    this.persistTemplate(template);
    
    return template;
  }

  async loadTemplate(templateId: string): Promise<SetFilterTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    // Update usage count
    template.usageCount++;
    template.modifiedAt = new Date();
    
    this.persistTemplate(template);
    
    return template;
  }

  deleteTemplate(templateId: string): void {
    this.templates.delete(templateId);
    
    // Remove from persistent storage
    if (this.indexedDBAvailable) {
      // IndexedDB deletion logic
    } else {
      localStorage.removeItem(`blg-set-filter-template-${templateId}`);
    }
  }

  async exportTemplate(templateId: string, format: string): Promise<string> {
    const template = await this.loadTemplate(templateId);
    
    switch (format) {
      case 'json':
        return JSON.stringify(template, null, 2);
      case 'csv':
        return this.templateToCsv(template);
      default:
        return JSON.stringify(template);
    }
  }

  async importTemplate(data: string): Promise<SetFilterTemplate> {
    try {
      const templateData = JSON.parse(data);
      
      // Validate template structure
      if (!this.isValidTemplate(templateData)) {
        throw new Error('Invalid template format');
      }
      
      const template: SetFilterTemplate = {
        ...templateData,
        id: Date.now().toString(), // Generate new ID
        createdAt: new Date(),
        modifiedAt: new Date(),
        usageCount: 0
      };
      
      this.templates.set(template.id, template);
      this.persistTemplate(template);
      
      return template;
      
    } catch (error) {
      console.error('Error importing template:', error);
      throw error;
    }
  }

  // ============================================
  // Performance and Optimization
  // ============================================

  enablePerformanceMode(): void {
    // Enable all performance optimizations
    this.enableIndexedDBCache();
    this.enableWebWorkers();
    // Additional optimization enablement
  }

  getPerformanceMetrics(): SetFilterPerformanceMetrics {
    return this.performanceMetrics.value || {
      uniqueValueExtractionTime: 0,
      sortingTime: 0,
      searchTime: 0,
      renderingTime: 0,
      totalMemoryUsage: 0,
      cacheHitRate: 0,
      indexSize: 0,
      averageSearchTime: 0,
      averageSelectionTime: 0,
      scrollPerformance: 0,
      uniqueValueCount: 0,
      virtualScrollingActive: false,
      webWorkerUsed: false,
      indexedDBUsed: false
    };
  }

  clearCache(): void {
    this.cacheStorage.clear();
    
    if (this.indexedDBAvailable) {
      // Clear IndexedDB cache
      this.clearIndexedDBCache();
    }
  }

  optimizeMemory(): void {
    // Force garbage collection if possible
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    // Clear unused cache entries
    this.clearOldCacheEntries();
  }

  // ============================================
  // Analytics
  // ============================================

  getValueDistribution(): Map<any, number> {
    // Return cached distribution if available
    const cached = this.cacheStorage.get('valueDistribution');
    if (cached) {
      return cached;
    }
    
    // Calculate and cache distribution
    const distribution = new Map<any, number>();
    // Implementation would depend on current data
    
    this.cacheStorage.set('valueDistribution', distribution);
    return distribution;
  }

  getUsageAnalytics(): any {
    return {
      templatesUsed: this.templates.size,
      averageSearchTime: this.getAverageSearchTime(),
      mostUsedSearchMode: this.getMostUsedSearchMode(),
      categoryUsage: this.getCategoryUsageStats()
    };
  }

  getPerformanceReport(): any {
    const metrics = this.getPerformanceMetrics();
    
    return {
      performanceScore: this.calculatePerformanceScore(metrics),
      bottlenecks: this.identifyBottlenecks(metrics),
      recommendations: this.getPerformanceRecommendations(metrics),
      metrics
    };
  }

  // ============================================
  // Public Cache Management
  // ============================================

  enableIndexedDBCache(): void {
    if ('indexedDB' in window) {
      this.initializeIndexedDB();
    }
  }

  enableWebWorkers(): void {
    if (typeof Worker !== 'undefined') {
      this.initializeWebWorker();
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private initializeService(): void {
    // Check for IndexedDB support
    this.indexedDBAvailable = 'indexedDB' in window;
    
    // Check for Web Worker support
    this.webWorkerAvailable = typeof Worker !== 'undefined';
    
    // Load existing templates
    this.loadTemplatesFromStorage();
  }

  private getValue(item: any, column: string): any {
    if (!column || !item) return item;
    
    // Handle nested properties (e.g., 'user.name')
    const parts = column.split('.');
    let value = item;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    
    return value;
  }

  private normalizeValue(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string') {
      return value.trim();
    }
    
    return value;
  }

  private formatDisplayValue(value: any): string {
    if (value === null || value === undefined) {
      return '(Blank)';
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return '(Empty)';
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    return String(value);
  }

  // ============================================
  // Search Implementation Methods
  // ============================================

  private searchContains(values: SetFilterValue[], searchTerm: string): SetFilterValue[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return values.filter(value => 
      value.displayValue.toLowerCase().includes(lowerSearchTerm)
    );
  }

  private async searchFuzzy(values: SetFilterValue[], searchTerm: string): Promise<SetFilterValue[]> {
    // Simple fuzzy search implementation
    // In production, you'd use a library like Fuse.js
    
    const threshold = this.config.searchConfig?.fuzzyThreshold || 0.8;
    const results: Array<{ value: SetFilterValue; score: number }> = [];
    
    values.forEach(value => {
      const score = this.calculateFuzzyScore(value.displayValue, searchTerm);
      if (score >= threshold) {
        results.push({ value, score });
      }
    });
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    return results.map(r => r.value);
  }

  private searchRegex(values: SetFilterValue[], searchTerm: string): SetFilterValue[] {
    try {
      const regex = new RegExp(searchTerm, 'i');
      return values.filter(value => regex.test(value.displayValue));
    } catch (error) {
      console.warn('Invalid regex pattern, falling back to contains search');
      return this.searchContains(values, searchTerm);
    }
  }

  private async searchPhonetic(values: SetFilterValue[], searchTerm: string): Promise<SetFilterValue[]> {
    // Placeholder for phonetic search (would use libraries like natural or metaphone)
    return this.searchFuzzy(values, searchTerm);
  }

  private async searchSemantic(values: SetFilterValue[], searchTerm: string): Promise<SetFilterValue[]> {
    // Placeholder for semantic search (would use NLP libraries or APIs)
    return this.searchFuzzy(values, searchTerm);
  }

  private calculateFuzzyScore(text: string, pattern: string): number {
    // Simple Levenshtein distance-based fuzzy matching
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    if (textLower === patternLower) return 1.0;
    if (textLower.includes(patternLower)) return 0.9;
    
    const distance = this.levenshteinDistance(textLower, patternLower);
    const maxLength = Math.max(text.length, pattern.length);
    
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private compareValues(a: any, b: any): number {
    if (a === b) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    
    return String(a).localeCompare(String(b));
  }

  // ============================================
  // Hierarchy Helper Methods
  // ============================================

  private getGroupKey(value: SetFilterValue, property: string): string {
    // Extract group key from value based on property
    // This is a simplified implementation
    const val = value.value;
    
    if (typeof val === 'string') {
      // Group by first character
      return val.charAt(0).toUpperCase();
    }
    
    if (typeof val === 'number') {
      // Group by magnitude
      if (val < 10) return '0-9';
      if (val < 100) return '10-99';
      if (val < 1000) return '100-999';
      return '1000+';
    }
    
    return 'Other';
  }

  private buildGroupPath(groupKey: string, maxDepth: number): string[] {
    // Build hierarchical path for group
    // This is a simplified implementation
    return [groupKey];
  }

  private ensureGroupPath(
    groupPath: string[], 
    groups: Map<string, SetFilterGroup>, 
    rootGroups: SetFilterGroup[], 
    config: SetFilterHierarchyConfig
  ): void {
    // Ensure all groups in the path exist
    let parentGroup: SetFilterGroup | null = null;
    let currentPath = '';
    
    groupPath.forEach((groupName, level) => {
      currentPath = currentPath ? `${currentPath}/${groupName}` : groupName;
      
      if (!groups.has(currentPath)) {
        const group: SetFilterGroup = {
          id: currentPath,
          name: groupName,
          level,
          parentId: parentGroup?.id,
          children: [],
          totalCount: 0,
          selectedCount: 0,
          isExpanded: config.expandByDefault || level === 0
        };
        
        groups.set(currentPath, group);
        
        if (parentGroup) {
          parentGroup.children.push(group);
        } else {
          rootGroups.push(group);
        }
      }
      
      parentGroup = groups.get(currentPath)!;
    });
  }

  private addValueToGroup(
    value: SetFilterValue, 
    groupPath: string[], 
    groups: Map<string, SetFilterGroup>
  ): void {
    const fullPath = groupPath.join('/');
    const group = groups.get(fullPath);
    
    if (group) {
      group.children.push(value);
      group.totalCount++;
      
      if (value.selected) {
        group.selectedCount++;
      }
    }
  }

  private calculateGroupCounts(groups: SetFilterGroup[]): void {
    groups.forEach(group => {
      if (group.children.length > 0) {
        // Recursively calculate for child groups
        const childGroups = group.children.filter(child => 'children' in child) as SetFilterGroup[];
        if (childGroups.length > 0) {
          this.calculateGroupCounts(childGroups);
          
          // Sum up counts from child groups and values
          group.totalCount = group.children.reduce((sum, child) => {
            return sum + ('count' in child ? child.count : (child as SetFilterGroup).totalCount);
          }, 0);
          
          group.selectedCount = group.children.reduce((sum, child) => {
            return sum + ('selected' in child && child.selected ? 1 : (child as SetFilterGroup).selectedCount);
          }, 0);
        }
      }
    });
  }

  private sortGroups(groups: SetFilterGroup[], sortBy: string, order: 'asc' | 'desc'): void {
    groups.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'count':
          comparison = a.totalCount - b.totalCount;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    // Recursively sort child groups
    groups.forEach(group => {
      const childGroups = group.children.filter(child => 'children' in child) as SetFilterGroup[];
      if (childGroups.length > 0) {
        this.sortGroups(childGroups, sortBy, order);
      }
    });
  }

  // ============================================
  // Template Helper Methods
  // ============================================

  private isValidTemplate(data: any): boolean {
    return data && 
           typeof data === 'object' &&
           typeof data.name === 'string' &&
           Array.isArray(data.selectedValues) &&
           typeof data.operator === 'string';
  }

  private templateToCsv(template: SetFilterTemplate): string {
    const headers = ['Name', 'Selected Values', 'Operator', 'Created At'];
    const row = [
      template.name,
      template.selectedValues.join(';'),
      template.operator,
      template.createdAt.toISOString()
    ];
    
    return [headers.join(','), row.join(',')].join('\n');
  }

  private persistTemplate(template: SetFilterTemplate): void {
    if (this.indexedDBAvailable) {
      // Store in IndexedDB
      this.storeTemplateInIndexedDB(template);
    } else {
      // Fallback to localStorage
      localStorage.setItem(
        `blg-set-filter-template-${template.id}`, 
        JSON.stringify(template)
      );
    }
  }

  private loadTemplatesFromStorage(): void {
    if (this.indexedDBAvailable) {
      // Load from IndexedDB
      this.loadTemplatesFromIndexedDB();
    } else {
      // Load from localStorage
      this.loadTemplatesFromLocalStorage();
    }
  }

  private loadTemplatesFromLocalStorage(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('blg-set-filter-template-')) {
          const templateData = localStorage.getItem(key);
          if (templateData) {
            const template = JSON.parse(templateData);
            this.templates.set(template.id, template);
          }
        }
      });
    } catch (error) {
      console.error('Error loading templates from localStorage:', error);
    }
  }

  // ============================================
  // Performance Helper Methods
  // ============================================

  private updatePerformanceMetrics(update: Partial<SetFilterPerformanceMetrics>): void {
    const current = this.performanceMetrics.value || {} as SetFilterPerformanceMetrics;
    const updated = { ...current, ...update };
    this.performanceMetrics.next(updated);
  }

  private calculatePerformanceScore(metrics: SetFilterPerformanceMetrics): number {
    // Calculate a performance score from 0-100
    let score = 100;
    
    // Penalize slow search times
    if (metrics.searchTime > 500) score -= 30;
    else if (metrics.searchTime > 200) score -= 15;
    else if (metrics.searchTime > 100) score -= 5;
    
    // Penalize slow extraction times
    if (metrics.uniqueValueExtractionTime > 1000) score -= 20;
    else if (metrics.uniqueValueExtractionTime > 500) score -= 10;
    
    // Reward good cache hit rate
    if (metrics.cacheHitRate > 0.8) score += 5;
    else if (metrics.cacheHitRate < 0.3) score -= 10;
    
    // Reward optimization usage
    if (metrics.webWorkerUsed) score += 5;
    if (metrics.indexedDBUsed) score += 3;
    if (metrics.virtualScrollingActive) score += 2;
    
    return Math.max(0, Math.min(100, score));
  }

  private identifyBottlenecks(metrics: SetFilterPerformanceMetrics): string[] {
    const bottlenecks: string[] = [];
    
    if (metrics.searchTime > 500) {
      bottlenecks.push('Search performance is slow');
    }
    
    if (metrics.uniqueValueExtractionTime > 1000) {
      bottlenecks.push('Value extraction is slow');
    }
    
    if (metrics.totalMemoryUsage > 100 * 1024 * 1024) { // 100MB
      bottlenecks.push('High memory usage');
    }
    
    if (metrics.cacheHitRate < 0.3) {
      bottlenecks.push('Low cache efficiency');
    }
    
    if (metrics.uniqueValueCount > 10000 && !metrics.virtualScrollingActive) {
      bottlenecks.push('Virtual scrolling not enabled for large dataset');
    }
    
    return bottlenecks;
  }

  private getPerformanceRecommendations(metrics: SetFilterPerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (!metrics.webWorkerUsed && metrics.uniqueValueCount > 5000) {
      recommendations.push('Enable web workers for better performance with large datasets');
    }
    
    if (!metrics.indexedDBUsed) {
      recommendations.push('Enable IndexedDB caching for improved performance');
    }
    
    if (metrics.searchTime > 200) {
      recommendations.push('Consider enabling search indexing');
    }
    
    if (metrics.totalMemoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Enable memory optimization features');
    }
    
    return recommendations;
  }

  // ============================================
  // Utility Detection Methods
  // ============================================

  private couldBeDate(value: any): boolean {
    if (value instanceof Date) return true;
    
    if (typeof value === 'string') {
      // Basic date detection patterns
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
      ];
      
      return datePatterns.some(pattern => pattern.test(value));
    }
    
    return false;
  }

  private getAverageSearchTime(): number {
    // This would be calculated from stored metrics
    return 0;
  }

  private getMostUsedSearchMode(): string {
    // This would be calculated from usage analytics
    return 'contains';
  }

  private getCategoryUsageStats(): any {
    // This would return category usage statistics
    return {};
  }

  // ============================================
  // IndexedDB Methods (Placeholders)
  // ============================================

  private async initializeIndexedDB(): Promise<void> {
    // Initialize IndexedDB for caching
    this.indexedDBAvailable = true;
  }

  private async storeTemplateInIndexedDB(template: SetFilterTemplate): Promise<void> {
    // Store template in IndexedDB
  }

  private async loadTemplatesFromIndexedDB(): Promise<void> {
    // Load templates from IndexedDB
  }

  private async clearIndexedDBCache(): Promise<void> {
    // Clear IndexedDB cache
  }

  // ============================================
  // Web Worker Methods
  // ============================================

  private initializeWebWorker(): void {
    try {
      // In a real implementation, you'd load a worker script
      // For now, we'll mark as available but not create the worker
      this.webWorkerAvailable = true;
      
      // Example worker initialization:
      // this.searchWorker = new Worker(new URL('./set-filter.worker.ts', import.meta.url));
      
    } catch (error) {
      console.warn('Web Worker initialization failed:', error);
      this.webWorkerAvailable = false;
    }
  }

  private clearOldCacheEntries(): void {
    // Remove cache entries older than threshold
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [key, value] of this.cacheStorage.entries()) {
      if (value.timestamp && value.timestamp < cutoffTime) {
        this.cacheStorage.delete(key);
      }
    }
  }
}