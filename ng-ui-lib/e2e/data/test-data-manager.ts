import { DataFactory } from './data-factory';
import { GridDataSet } from './types';

export class TestDataManager {
  private static instance: TestDataManager;
  private datasets: Map<string, GridDataSet> = new Map();
  
  static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new TestDataManager();
      await this.instance.loadDatasets();
    }
  }
  
  static async cleanup(): Promise<void> {
    if (this.instance) {
      this.instance.datasets.clear();
    }
  }
  
  static getInstance(): TestDataManager {
    if (!this.instance) {
      throw new Error('TestDataManager not initialized. Call initialize() first.');
    }
    return this.instance;
  }
  
  private async loadDatasets(): Promise<void> {
    // Pre-generate common datasets
    this.datasets.set('small', DataFactory.createSmallDataset());
    this.datasets.set('medium', DataFactory.createMediumDataset());
    this.datasets.set('large', DataFactory.createLargeDataset());
    this.datasets.set('performance', DataFactory.createPerformanceDataset());
    this.datasets.set('mixed', DataFactory.createMixedDataset());
    this.datasets.set('empty', DataFactory.createEmptyDataset());
    this.datasets.set('single-row', DataFactory.createSingleRowDataset());
  }
  
  getDataset(name: string): GridDataSet {
    const dataset = this.datasets.get(name);
    if (!dataset) {
      throw new Error(`Dataset '${name}' not found`);
    }
    return dataset;
  }
  
  addDataset(name: string, dataset: GridDataSet): void {
    this.datasets.set(name, dataset);
  }
  
  listDatasets(): string[] {
    return Array.from(this.datasets.keys());
  }
}