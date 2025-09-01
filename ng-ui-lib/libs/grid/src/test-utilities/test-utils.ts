import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { faker } from '@faker-js/faker';
import { ColumnDefinition } from '@ng-ui/core';
import { GridConfig } from '@ng-ui/core';

/**
 * Test utilities for the BlgGrid library
 */

/**
 * Mock data factory for generating test data
 */
export class MockDataFactory {
  /**
   * Generate a single row of test data
   */
  static generateRow(id?: number): any {
    return {
      id: id ?? faker.number.int({ min: 1, max: 1000 }),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      salary: faker.number.int({ min: 30000, max: 200000 }),
      department: faker.helpers.arrayElement(['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']),
      hireDate: faker.date.past(),
      active: faker.datatype.boolean(),
      rating: faker.number.float({ min: 1, max: 5, multipleOf: 0.1 }),
      country: faker.location.country(),
      city: faker.location.city(),
      fullName: '',
      description: faker.lorem.paragraph()
    };
  }

  /**
   * Generate multiple rows of test data
   */
  static generateRows(count: number): any[] {
    const rows: any[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.generateRow(i + 1);
      row.fullName = `${row.firstName} ${row.lastName}`;
      rows.push(row);
    }
    return rows;
  }

  /**
   * Generate large dataset for performance testing
   */
  static generateLargeDataset(count: number = 100000): any[] {
    return this.generateRows(count);
  }
}

/**
 * Column definitions factory for testing
 */
export class MockColumnFactory {
  /**
   * Get standard test columns
   */
  static getStandardColumns(): ColumnDefinition[] {
    return [
      { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80, sortable: true },
      { id: 'firstName', field: 'firstName', header: 'First Name', type: 'string', width: 120, sortable: true, filterable: true },
      { id: 'lastName', field: 'lastName', header: 'Last Name', type: 'string', width: 120, sortable: true, filterable: true },
      { id: 'email', field: 'email', header: 'Email', type: 'string', width: 200, sortable: true, filterable: true },
      { id: 'age', field: 'age', header: 'Age', type: 'number', width: 80, sortable: true, filterable: true },
      { id: 'salary', field: 'salary', header: 'Salary', type: 'number', width: 120, sortable: true, filterable: true },
      { id: 'department', field: 'department', header: 'Department', type: 'string', width: 120, sortable: true, filterable: true },
      { id: 'hireDate', field: 'hireDate', header: 'Hire Date', type: 'date', width: 120, sortable: true, filterable: true },
      { id: 'active', field: 'active', header: 'Active', type: 'boolean', width: 80, sortable: true, filterable: true }
    ];
  }

  /**
   * Get columns with custom renderers
   */
  static getCustomRendererColumns(): ColumnDefinition[] {
    return [
      { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
      { 
        id: 'fullName', 
        field: 'fullName', 
        header: 'Full Name', 
        type: 'string', 
        width: 200, 
        cellRenderer: '<strong>{{firstName}}</strong> {{lastName}}' 
      },
      { 
        id: 'salary', 
        field: 'salary', 
        header: 'Salary', 
        type: 'number', 
        width: 120, 
        cellRenderer: '${{value}}' 
      },
      { 
        id: 'active', 
        field: 'active', 
        header: 'Status', 
        type: 'boolean', 
        width: 100, 
        cellRenderer: '{{value}} ? "Active" : "Inactive"' 
      }
    ];
  }

  /**
   * Get editable columns
   */
  static getEditableColumns(): ColumnDefinition[] {
    return [
      { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80, cellEditor: false },
      { id: 'firstName', field: 'firstName', header: 'First Name', type: 'string', width: 120, cellEditor: true },
      { id: 'lastName', field: 'lastName', header: 'Last Name', type: 'string', width: 120, cellEditor: true },
      { id: 'email', field: 'email', header: 'Email', type: 'string', width: 200, cellEditor: true },
      { id: 'age', field: 'age', header: 'Age', type: 'number', width: 80, cellEditor: true },
      { id: 'department', field: 'department', header: 'Department', type: 'string', width: 120, cellEditor: 'select' },
      { id: 'active', field: 'active', header: 'Active', type: 'boolean', width: 80, cellEditor: true }
    ];
  }
}

/**
 * Grid configuration factory for testing
 */
export class MockConfigFactory {
  /**
   * Get default test configuration
   */
  static getDefaultConfig(): GridConfig {
    return {
      rowHeight: 40,
      virtualScrolling: true,
      sortable: true,
      filterable: true,
      selectable: true,
      selectionMode: 'multiple',
      resizable: true,
      reorderable: true,
      showFooter: false,
      pagination: false
    };
  }

  /**
   * Get paginated configuration
   */
  static getPaginatedConfig(): GridConfig {
    return {
      ...this.getDefaultConfig(),
      pagination: true,
      paginationConfig: {
        currentPage: 0,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        totalItems: 0,
        mode: 'client',
        showPageSizeSelector: true,
        showPageInfo: true,
        maxPageButtons: 7
      }
    };
  }

  /**
   * Get virtual scrolling configuration
   */
  static getVirtualScrollingConfig(): GridConfig {
    return {
      ...this.getDefaultConfig(),
      virtualScrolling: true,
      rowHeight: 40
    };
  }

  /**
   * Get single selection configuration
   */
  static getSingleSelectionConfig(): GridConfig {
    return {
      ...this.getDefaultConfig(),
      selectable: true,
      selectionMode: 'single'
    };
  }
}

/**
 * DOM helper utilities for testing
 */
export class TestDOMHelpers {
  /**
   * Get grid element
   */
  static getGridElement(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.debugElement.query(By.css('.blg-grid'))?.nativeElement;
  }

  /**
   * Get header elements
   */
  static getHeaderElements(fixture: ComponentFixture<any>): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('.blg-grid-header-cell'))
      .map(el => el.nativeElement);
  }

  /**
   * Get header element by column ID
   */
  static getHeaderElement(fixture: ComponentFixture<any>, columnId: string): HTMLElement | null {
    return fixture.debugElement.query(By.css(`[data-column-id="${columnId}"]`))?.nativeElement || null;
  }

  /**
   * Get row elements
   */
  static getRowElements(fixture: ComponentFixture<any>): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('.blg-grid-row'))
      .map(el => el.nativeElement);
  }

  /**
   * Get cell elements
   */
  static getCellElements(fixture: ComponentFixture<any>): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('.blg-grid-cell'))
      .map(el => el.nativeElement);
  }

  /**
   * Get specific cell element
   */
  static getCellElement(fixture: ComponentFixture<any>, rowIndex: number, columnId: string): HTMLElement | null {
    return fixture.debugElement.query(By.css(`[data-row-index="${rowIndex}"][data-column-id="${columnId}"]`))?.nativeElement || null;
  }

  /**
   * Get virtual scroll viewport
   */
  static getVirtualScrollViewport(fixture: ComponentFixture<any>): HTMLElement | null {
    return fixture.debugElement.query(By.css('cdk-virtual-scroll-viewport'))?.nativeElement || null;
  }

  /**
   * Get pagination elements
   */
  static getPaginationElement(fixture: ComponentFixture<any>): HTMLElement | null {
    return fixture.debugElement.query(By.css('.blg-grid-pagination'))?.nativeElement || null;
  }

  /**
   * Get page buttons
   */
  static getPageButtons(fixture: ComponentFixture<any>): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('.blg-grid-page-button'))
      .map(el => el.nativeElement);
  }

  /**
   * Get sort indicators
   */
  static getSortIndicator(fixture: ComponentFixture<any>, columnId: string): HTMLElement | null {
    return fixture.debugElement.query(By.css(`[data-column-id="${columnId}"] .sort-indicator`))?.nativeElement || null;
  }
}

/**
 * Event helper utilities for testing
 */
export class TestEventHelpers {
  /**
   * Simulate click event
   */
  static click(element: HTMLElement): void {
    const event = new MouseEvent('click', { bubbles: true });
    element.dispatchEvent(event);
  }

  /**
   * Simulate double click event
   */
  static doubleClick(element: HTMLElement): void {
    const event = new MouseEvent('dblclick', { bubbles: true });
    element.dispatchEvent(event);
  }

  /**
   * Simulate key press
   */
  static keyPress(element: HTMLElement, key: string, options: Partial<KeyboardEventInit> = {}): void {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, ...options });
    element.dispatchEvent(event);
  }

  /**
   * Simulate keyboard navigation
   */
  static navigateWithArrow(element: HTMLElement, direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'): void {
    this.keyPress(element, direction, { bubbles: true });
  }

  /**
   * Simulate Enter key
   */
  static pressEnter(element: HTMLElement): void {
    this.keyPress(element, 'Enter');
  }

  /**
   * Simulate Escape key
   */
  static pressEscape(element: HTMLElement): void {
    this.keyPress(element, 'Escape');
  }

  /**
   * Simulate Tab key
   */
  static pressTab(element: HTMLElement, shiftKey = false): void {
    this.keyPress(element, 'Tab', { shiftKey });
  }

  /**
   * Simulate mouse resize
   */
  static simulateResize(startElement: HTMLElement, deltaX: number): void {
    // Start resize
    const startEvent = new MouseEvent('mousedown', { 
      clientX: 100, 
      bubbles: true 
    });
    startElement.dispatchEvent(startEvent);

    // Move mouse
    const moveEvent = new MouseEvent('mousemove', { 
      clientX: 100 + deltaX, 
      bubbles: true 
    });
    document.dispatchEvent(moveEvent);

    // End resize
    const endEvent = new MouseEvent('mouseup', { 
      clientX: 100 + deltaX, 
      bubbles: true 
    });
    document.dispatchEvent(endEvent);
  }
}

/**
 * Async helper utilities for testing
 */
export class TestAsyncHelpers {
  /**
   * Wait for next tick
   */
  static async tick(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Wait for specified milliseconds
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for condition to be true
   */
  static async waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await this.tick();
    }
    if (!condition()) {
      throw new Error('Timeout waiting for condition');
    }
  }

  /**
   * Wait for fixture to be stable
   */
  static async waitForStable(fixture: ComponentFixture<any>): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }
}

/**
 * Performance measurement utilities for testing
 */
export class TestPerformanceHelpers {
  /**
   * Measure execution time
   */
  static async measureTime<T>(fn: () => T | Promise<T>): Promise<{ result: T; time: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return { result, time: end - start };
  }

  /**
   * Measure virtual scroll performance
   */
  static measureScrollPerformance(fixture: ComponentFixture<any>, scrollSteps: number = 10): Promise<number[]> {
    const times: number[] = [];
    const viewport = TestDOMHelpers.getVirtualScrollViewport(fixture);
    
    return new Promise(resolve => {
      let step = 0;
      
      const measureStep = () => {
        const start = performance.now();
        
        // Simulate scroll
        if (viewport) {
          viewport.scrollTop = (step * 1000);
          viewport.dispatchEvent(new Event('scroll'));
        }
        
        fixture.detectChanges();
        
        requestAnimationFrame(() => {
          const end = performance.now();
          times.push(end - start);
          
          step++;
          if (step < scrollSteps) {
            measureStep();
          } else {
            resolve(times);
          }
        });
      };
      
      measureStep();
    });
  }
}

/**
 * Custom Jest matchers for grid testing
 */
export const customMatchers = {
  /**
   * Check if grid has specific number of rows
   */
  toHaveRows(received: ComponentFixture<any>, expected: number) {
    const rows = TestDOMHelpers.getRowElements(received);
    const pass = rows.length === expected;
    
    return {
      pass,
      message: () => pass 
        ? `Expected grid to not have ${expected} rows, but it has ${rows.length}`
        : `Expected grid to have ${expected} rows, but it has ${rows.length}`
    };
  },

  /**
   * Check if grid has specific number of columns
   */
  toHaveColumns(received: ComponentFixture<any>, expected: number) {
    const headers = TestDOMHelpers.getHeaderElements(received);
    const pass = headers.length === expected;
    
    return {
      pass,
      message: () => pass 
        ? `Expected grid to not have ${expected} columns, but it has ${headers.length}`
        : `Expected grid to have ${expected} columns, but it has ${headers.length}`
    };
  },

  /**
   * Check if specific cell contains expected value
   */
  toCellContainText(received: ComponentFixture<any>, rowIndex: number, columnId: string, expectedText: string) {
    const cell = TestDOMHelpers.getCellElement(received, rowIndex, columnId);
    const pass = cell?.textContent?.trim() === expectedText;
    
    return {
      pass,
      message: () => pass 
        ? `Expected cell [${rowIndex}, ${columnId}] to not contain "${expectedText}"`
        : `Expected cell [${rowIndex}, ${columnId}] to contain "${expectedText}", but got "${cell?.textContent?.trim()}"`
    };
  },

  /**
   * Check if column is sorted
   */
  toHaveColumnSorted(received: ComponentFixture<any>, columnId: string, direction: 'asc' | 'desc') {
    const sortIndicator = TestDOMHelpers.getSortIndicator(received, columnId);
    const pass = sortIndicator?.classList.contains(`sort-${direction}`);
    
    return {
      pass,
      message: () => pass 
        ? `Expected column ${columnId} to not be sorted ${direction}`
        : `Expected column ${columnId} to be sorted ${direction}`
    };
  }
};

// Add custom matchers to Jest
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveRows(expected: number): R;
      toHaveColumns(expected: number): R;
      toCellContainText(rowIndex: number, columnId: string, expectedText: string): R;
      toHaveColumnSorted(columnId: string, direction: 'asc' | 'desc'): R;
    }
  }
}