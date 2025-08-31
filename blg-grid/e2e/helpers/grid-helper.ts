import { Page, Locator, expect } from '@playwright/test';
import { GridColumn, SortConfig, FilterConfig, SelectionConfig, PerformanceMetrics } from '../data/types';

export class GridHelper {
  constructor(private page: Page) {}
  
  // Grid container and basic elements
  async getGridContainer(): Promise<Locator> {
    return this.page.locator('[data-testid="grid-container"]');
  }
  
  async getGridHeader(): Promise<Locator> {
    return this.page.locator('[data-testid="grid-header"]');
  }
  
  async getGridBody(): Promise<Locator> {
    return this.page.locator('[data-testid="grid-body"]');
  }
  
  // Row operations
  async getRows(): Promise<Locator> {
    return this.page.locator('[data-testid^="grid-row-"]');
  }
  
  async getRow(index: number): Promise<Locator> {
    return this.page.locator(`[data-testid="grid-row-${index}"]`);
  }
  
  async getRowCount(): Promise<number> {
    const rows = await this.getRows();
    return await rows.count();
  }
  
  async getVisibleRowCount(): Promise<number> {
    const visibleRows = this.page.locator('[data-testid^="grid-row-"]:visible');
    return await visibleRows.count();
  }
  
  // Cell operations
  async getCell(rowIndex: number, columnIndex: number): Promise<Locator> {
    return this.page.locator(`[data-testid="grid-cell-${rowIndex}-${columnIndex}"]`);
  }
  
  async getCellByField(rowIndex: number, field: string): Promise<Locator> {
    return this.page.locator(`[data-testid="grid-cell-${rowIndex}-${field}"]`);
  }
  
  async getCellText(rowIndex: number, columnIndex: number): Promise<string> {
    const cell = await this.getCell(rowIndex, columnIndex);
    return await cell.textContent() || '';
  }
  
  async getCellTextByField(rowIndex: number, field: string): Promise<string> {
    const cell = await this.getCellByField(rowIndex, field);
    return await cell.textContent() || '';
  }
  
  // Column operations
  async getColumnHeaders(): Promise<Locator> {
    return this.page.locator('[data-testid^="grid-header-"]');
  }
  
  async getColumnHeader(field: string): Promise<Locator> {
    return this.page.locator(`[data-testid="grid-header-${field}"]`);
  }
  
  async getColumnHeaderByIndex(index: number): Promise<Locator> {
    const headers = await this.getColumnHeaders();
    return headers.nth(index);
  }
  
  async resizeColumn(field: string, deltaX: number): Promise<void> {
    const header = await this.getColumnHeader(field);
    const resizeHandle = header.locator('.column-resize-handle');
    
    await resizeHandle.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(deltaX, 0);
    await this.page.mouse.up();
  }
  
  async reorderColumn(fromField: string, toField: string): Promise<void> {
    const fromHeader = await this.getColumnHeader(fromField);
    const toHeader = await this.getColumnHeader(toField);
    
    await fromHeader.dragTo(toHeader);
  }
  
  async hideColumn(field: string): Promise<void> {
    const header = await this.getColumnHeader(field);
    await header.rightClick();
    await this.page.locator('[data-testid="column-menu-hide"]').click();
  }
  
  async showColumn(field: string): Promise<void> {
    await this.page.locator('[data-testid="column-chooser-button"]').click();
    await this.page.locator(`[data-testid="column-chooser-${field}"]`).check();
    await this.page.locator('[data-testid="column-chooser-apply"]').click();
  }
  
  // Sorting operations
  async sortColumn(field: string, direction: 'asc' | 'desc' = 'asc'): Promise<void> {
    const header = await this.getColumnHeader(field);
    
    // Click once for ascending, twice for descending
    await header.click();
    if (direction === 'desc') {
      await header.click();
    }
  }
  
  async getSortIndicator(field: string): Promise<string> {
    const header = await this.getColumnHeader(field);
    const sortIcon = header.locator('.sort-icon');
    
    if (await sortIcon.isVisible()) {
      const classList = await sortIcon.getAttribute('class') || '';
      if (classList.includes('asc')) return 'asc';
      if (classList.includes('desc')) return 'desc';
    }
    
    return 'none';
  }
  
  async clearSort(): Promise<void> {
    await this.page.locator('[data-testid="clear-sort-button"]').click();
  }
  
  // Filtering operations
  async openFilter(field: string): Promise<void> {
    const header = await this.getColumnHeader(field);
    const filterIcon = header.locator('.filter-icon');
    await filterIcon.click();
  }
  
  async applyTextFilter(field: string, operator: string, value: string): Promise<void> {
    await this.openFilter(field);
    await this.page.locator('[data-testid="filter-operator"]').selectOption(operator);
    await this.page.locator('[data-testid="filter-value"]').fill(value);
    await this.page.locator('[data-testid="filter-apply"]').click();
  }
  
  async applyNumberFilter(field: string, operator: string, value: number): Promise<void> {
    await this.openFilter(field);
    await this.page.locator('[data-testid="filter-operator"]').selectOption(operator);
    await this.page.locator('[data-testid="filter-value"]').fill(value.toString());
    await this.page.locator('[data-testid="filter-apply"]').click();
  }
  
  async applyDateFilter(field: string, operator: string, value: string): Promise<void> {
    await this.openFilter(field);
    await this.page.locator('[data-testid="filter-operator"]').selectOption(operator);
    await this.page.locator('[data-testid="filter-value"]').fill(value);
    await this.page.locator('[data-testid="filter-apply"]').click();
  }
  
  async clearFilter(field: string): Promise<void> {
    await this.openFilter(field);
    await this.page.locator('[data-testid="filter-clear"]').click();
  }
  
  async clearAllFilters(): Promise<void> {
    await this.page.locator('[data-testid="clear-all-filters-button"]').click();
  }
  
  async getFilterIndicator(field: string): Promise<boolean> {
    const header = await this.getColumnHeader(field);
    const filterIcon = header.locator('.filter-active-icon');
    return await filterIcon.isVisible();
  }
  
  // Selection operations
  async selectRow(index: number): Promise<void> {
    const row = await this.getRow(index);
    await row.click();
  }
  
  async selectRowByCheckbox(index: number): Promise<void> {
    const checkbox = this.page.locator(`[data-testid="row-checkbox-${index}"]`);
    await checkbox.check();
  }
  
  async selectAllRows(): Promise<void> {
    const headerCheckbox = this.page.locator('[data-testid="header-checkbox"]');
    await headerCheckbox.check();
  }
  
  async getSelectedRowCount(): Promise<number> {
    const selectedRows = this.page.locator('[data-testid^="grid-row-"].selected');
    return await selectedRows.count();
  }
  
  async getSelectedRowIndices(): Promise<number[]> {
    const selectedRows = this.page.locator('[data-testid^="grid-row-"].selected');
    const count = await selectedRows.count();
    const indices: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const testId = await selectedRows.nth(i).getAttribute('data-testid');
      if (testId) {
        const index = parseInt(testId.replace('grid-row-', ''));
        indices.push(index);
      }
    }
    
    return indices;
  }
  
  async clearSelection(): Promise<void> {
    await this.page.locator('[data-testid="clear-selection-button"]').click();
  }
  
  // Virtual scrolling operations
  async scrollToRow(index: number): Promise<void> {
    await this.page.locator(`[data-testid="grid-row-${index}"]`).scrollIntoViewIfNeeded();
  }
  
  async scrollVertically(pixels: number): Promise<void> {
    const gridBody = await this.getGridBody();
    await gridBody.evaluate((element, pixels) => {
      element.scrollTop += pixels;
    }, pixels);
  }
  
  async scrollHorizontally(pixels: number): Promise<void> {
    const gridBody = await this.getGridBody();
    await gridBody.evaluate((element, pixels) => {
      element.scrollLeft += pixels;
    }, pixels);
  }
  
  async getScrollPosition(): Promise<{ top: number; left: number }> {
    const gridBody = await this.getGridBody();
    return await gridBody.evaluate((element) => ({
      top: element.scrollTop,
      left: element.scrollLeft
    }));
  }
  
  // Keyboard navigation
  async navigateWithKeyboard(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }
  
  async getFocusedCell(): Promise<{ row: number; column: number } | null> {
    const focusedCell = this.page.locator('.grid-cell.focused');
    
    if (await focusedCell.isVisible()) {
      const testId = await focusedCell.getAttribute('data-testid');
      if (testId) {
        const match = testId.match(/grid-cell-(\d+)-(\d+)/);
        if (match) {
          return {
            row: parseInt(match[1]),
            column: parseInt(match[2])
          };
        }
      }
    }
    
    return null;
  }
  
  // Performance helpers
  async measureRenderTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForSelector('[data-testid="grid-container"]', { state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }
  
  async measureScrollPerformance(): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    
    await this.scrollVertically(1000);
    await this.page.waitForTimeout(100); // Allow scroll to settle
    
    const scrollTime = performance.now() - startTime;
    
    // Get memory usage
    const memoryUsage = await this.page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    return {
      renderTime: 0,
      scrollTime,
      sortTime: 0,
      filterTime: 0,
      memoryUsage,
      frameRate: 60 // Default, would need more sophisticated measurement
    };
  }
  
  // Utility methods
  async waitForGridToLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="grid-container"]', { state: 'visible' });
    await this.page.waitForSelector('[data-testid^="grid-row-"]', { state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }
  
  async takeGridScreenshot(name: string): Promise<void> {
    const gridContainer = await this.getGridContainer();
    await gridContainer.screenshot({ path: `screenshots/${name}.png` });
  }
  
  async isGridEmpty(): Promise<boolean> {
    const rowCount = await this.getRowCount();
    return rowCount === 0;
  }
  
  async hasLoadingIndicator(): Promise<boolean> {
    return await this.page.locator('[data-testid="grid-loading"]').isVisible();
  }
  
  async waitForLoadingToComplete(): Promise<void> {
    await this.page.waitForSelector('[data-testid="grid-loading"]', { state: 'hidden', timeout: 10000 });
  }
}