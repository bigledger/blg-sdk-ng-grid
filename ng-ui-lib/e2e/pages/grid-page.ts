import { Page } from '@playwright/test';
import { GridHelper } from '../helpers/grid-helper';
import { TestHelpers } from '../helpers/test-helpers';
import { GridDataSet } from '../data/types';

export class GridPage {
  private gridHelper: GridHelper;
  private testHelper: TestHelpers;
  
  constructor(private page: Page) {
    this.gridHelper = new GridHelper(page);
    this.testHelper = new TestHelpers(page);
  }
  
  // Navigation
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
  
  async gotoBasicExample(): Promise<void> {
    await this.page.goto('/examples/basic');
    await this.waitForGridToLoad();
  }
  
  async gotoPerformanceExample(): Promise<void> {
    await this.page.goto('/examples/performance');
    await this.waitForGridToLoad();
  }
  
  async gotoFilteringExample(): Promise<void> {
    await this.page.goto('/examples/filtering');
    await this.waitForGridToLoad();
  }
  
  async gotoSortingExample(): Promise<void> {
    await this.page.goto('/examples/sorting');
    await this.waitForGridToLoad();
  }
  
  async gotoSelectionExample(): Promise<void> {
    await this.page.goto('/examples/selection');
    await this.waitForGridToLoad();
  }
  
  async gotoVirtualScrollExample(): Promise<void> {
    await this.page.goto('/examples/virtual-scroll');
    await this.waitForGridToLoad();
  }
  
  // Grid setup and configuration
  async loadDataset(datasetName: string): Promise<void> {
    await this.page.locator('[data-testid="dataset-selector"]').selectOption(datasetName);
    await this.waitForGridToLoad();
  }
  
  async setPageSize(pageSize: number): Promise<void> {
    await this.page.locator('[data-testid="page-size-selector"]').selectOption(pageSize.toString());
    await this.waitForGridToLoad();
  }
  
  async enableVirtualScrolling(): Promise<void> {
    await this.page.locator('[data-testid="virtual-scroll-toggle"]').check();
    await this.waitForGridToLoad();
  }
  
  async disableVirtualScrolling(): Promise<void> {
    await this.page.locator('[data-testid="virtual-scroll-toggle"]').uncheck();
    await this.waitForGridToLoad();
  }
  
  async enableRowSelection(): Promise<void> {
    await this.page.locator('[data-testid="row-selection-toggle"]').check();
  }
  
  async setSelectionMode(mode: 'single' | 'multiple' | 'checkbox'): Promise<void> {
    await this.page.locator('[data-testid="selection-mode-selector"]').selectOption(mode);
  }
  
  // Grid interaction methods (delegated to GridHelper)
  async waitForGridToLoad(): Promise<void> {
    return this.gridHelper.waitForGridToLoad();
  }
  
  async getRowCount(): Promise<number> {
    return this.gridHelper.getRowCount();
  }
  
  async getVisibleRowCount(): Promise<number> {
    return this.gridHelper.getVisibleRowCount();
  }
  
  async selectRow(index: number): Promise<void> {
    return this.gridHelper.selectRow(index);
  }
  
  async selectRowByCheckbox(index: number): Promise<void> {
    return this.gridHelper.selectRowByCheckbox(index);
  }
  
  async selectAllRows(): Promise<void> {
    return this.gridHelper.selectAllRows();
  }
  
  async sortColumn(field: string, direction: 'asc' | 'desc' = 'asc'): Promise<void> {
    return this.gridHelper.sortColumn(field, direction);
  }
  
  async applyTextFilter(field: string, operator: string, value: string): Promise<void> {
    return this.gridHelper.applyTextFilter(field, operator, value);
  }
  
  async applyNumberFilter(field: string, operator: string, value: number): Promise<void> {
    return this.gridHelper.applyNumberFilter(field, operator, value);
  }
  
  async clearAllFilters(): Promise<void> {
    return this.gridHelper.clearAllFilters();
  }
  
  async scrollToRow(index: number): Promise<void> {
    return this.gridHelper.scrollToRow(index);
  }
  
  async scrollVertically(pixels: number): Promise<void> {
    return this.gridHelper.scrollVertically(pixels);
  }
  
  async resizeColumn(field: string, deltaX: number): Promise<void> {
    return this.gridHelper.resizeColumn(field, deltaX);
  }
  
  async reorderColumn(fromField: string, toField: string): Promise<void> {
    return this.gridHelper.reorderColumn(fromField, toField);
  }
  
  async hideColumn(field: string): Promise<void> {
    return this.gridHelper.hideColumn(field);
  }
  
  async showColumn(field: string): Promise<void> {
    return this.gridHelper.showColumn(field);
  }
  
  async navigateWithKeyboard(key: string): Promise<void> {
    return this.gridHelper.navigateWithKeyboard(key);
  }
  
  async getFocusedCell(): Promise<{ row: number; column: number } | null> {
    return this.gridHelper.getFocusedCell();
  }
  
  async getCellText(rowIndex: number, columnIndex: number): Promise<string> {
    return this.gridHelper.getCellText(rowIndex, columnIndex);
  }
  
  async getCellTextByField(rowIndex: number, field: string): Promise<string> {
    return this.gridHelper.getCellTextByField(rowIndex, field);
  }
  
  async getSelectedRowCount(): Promise<number> {
    return this.gridHelper.getSelectedRowCount();
  }
  
  async getSelectedRowIndices(): Promise<number[]> {
    return this.gridHelper.getSelectedRowIndices();
  }
  
  async getSortIndicator(field: string): Promise<string> {
    return this.gridHelper.getSortIndicator(field);
  }
  
  async getFilterIndicator(field: string): Promise<boolean> {
    return this.gridHelper.getFilterIndicator(field);
  }
  
  async isGridEmpty(): Promise<boolean> {
    return this.gridHelper.isGridEmpty();
  }
  
  async hasLoadingIndicator(): Promise<boolean> {
    return this.gridHelper.hasLoadingIndicator();
  }
  
  async waitForLoadingToComplete(): Promise<void> {
    return this.gridHelper.waitForLoadingToComplete();
  }
  
  async measureRenderTime(): Promise<number> {
    return this.gridHelper.measureRenderTime();
  }
  
  async takeGridScreenshot(name: string): Promise<void> {
    return this.gridHelper.takeGridScreenshot(name);
  }
  
  // Page-specific utility methods
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
  
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
  
  async refreshPage(): Promise<void> {
    await this.page.reload();
    await this.waitForGridToLoad();
  }
  
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
  
  // Configuration methods
  async openGridSettings(): Promise<void> {
    await this.page.locator('[data-testid="grid-settings-button"]').click();
  }
  
  async closeGridSettings(): Promise<void> {
    await this.page.locator('[data-testid="grid-settings-close"]').click();
  }
  
  async resetGridToDefault(): Promise<void> {
    await this.page.locator('[data-testid="reset-grid-button"]').click();
    await this.waitForGridToLoad();
  }
  
  // Export methods
  async exportToCsv(): Promise<void> {
    await this.page.locator('[data-testid="export-csv-button"]').click();
  }
  
  async exportToExcel(): Promise<void> {
    await this.page.locator('[data-testid="export-excel-button"]').click();
  }
  
  async exportToPdf(): Promise<void> {
    await this.page.locator('[data-testid="export-pdf-button"]').click();
  }
  
  // Validation methods
  async validateGridStructure(): Promise<void> {
    await this.testHelper.expectElementToBeVisible('[data-testid="grid-container"]');
    await this.testHelper.expectElementToBeVisible('[data-testid="grid-header"]');
    await this.testHelper.expectElementToBeVisible('[data-testid="grid-body"]');
  }
  
  async validateDataLoaded(): Promise<void> {
    const rowCount = await this.getRowCount();
    if (rowCount === 0) {
      throw new Error('No data loaded in grid');
    }
  }
  
  async validateSortApplied(field: string, direction: 'asc' | 'desc'): Promise<void> {
    const sortIndicator = await this.getSortIndicator(field);
    if (sortIndicator !== direction) {
      throw new Error(`Expected sort direction ${direction} for field ${field}, got ${sortIndicator}`);
    }
  }
  
  async validateFilterApplied(field: string): Promise<void> {
    const filterIndicator = await this.getFilterIndicator(field);
    if (!filterIndicator) {
      throw new Error(`Filter not applied for field ${field}`);
    }
  }
  
  async validateRowSelection(expectedCount: number): Promise<void> {
    const actualCount = await this.getSelectedRowCount();
    if (actualCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} selected rows, got ${actualCount}`);
    }
  }
  
  // Performance testing methods
  async runBasicPerformanceTest(): Promise<{
    renderTime: number;
    scrollTime: number;
    memoryUsage: number;
  }> {
    const renderTime = await this.measureRenderTime();
    
    const scrollStart = Date.now();
    await this.scrollVertically(1000);
    await this.page.waitForTimeout(100);
    const scrollTime = Date.now() - scrollStart;
    
    const memoryUsage = await this.testHelper.getMemoryUsage();
    
    return {
      renderTime,
      scrollTime,
      memoryUsage
    };
  }
  
  async runSortPerformanceTest(field: string): Promise<number> {
    const startTime = Date.now();
    await this.sortColumn(field);
    await this.waitForLoadingToComplete();
    return Date.now() - startTime;
  }
  
  async runFilterPerformanceTest(field: string, value: string): Promise<number> {
    const startTime = Date.now();
    await this.applyTextFilter(field, 'contains', value);
    await this.waitForLoadingToComplete();
    return Date.now() - startTime;
  }
}