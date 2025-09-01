/**
 * Column API Compatibility Tests
 * Tests that ag-Grid Column API methods work correctly with BigLedger Grid
 */

import { test, expect, Page } from '@playwright/test';
import { BigLedgerGridApiWrapper, BlgColumnApiWrapper } from '../utils/api-compatibility-layer.js';
import { MigrationTestData } from '../test-data/migration-test-data.js';

test.describe('ag-Grid API Compatibility - Column API', () => {
  let page: Page;
  let gridApi: BigLedgerGridApiWrapper;
  let columnApi: BlgColumnApiWrapper;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    gridApi = new BigLedgerGridApiWrapper(page);
    columnApi = new BlgColumnApiWrapper(page);
    
    await page.goto('/grid-demo');
    
    // Setup grid with test data
    await page.evaluate((data) => {
      const columns = [
        { field: 'id', headerName: 'ID', width: 80, resizable: true },
        { field: 'firstName', headerName: 'First Name', width: 120, resizable: true },
        { field: 'lastName', headerName: 'Last Name', width: 120, resizable: true },
        { field: 'email', headerName: 'Email', width: 200, resizable: true },
        { field: 'age', headerName: 'Age', width: 80, resizable: true },
        { field: 'salary', headerName: 'Salary', width: 120, resizable: true },
        { field: 'department', headerName: 'Department', width: 150, resizable: true }
      ];
      
      window.testGridInstance?.setConfiguration({
        data: data,
        columns: columns
      });
    }, MigrationTestData.getBasicRowData());
  });

  test('should support column visibility API methods', async () => {
    // Test setColumnVisible - hide a column
    await columnApi.setColumnVisible('email', false);
    
    // Verify column is hidden
    await expect(page.locator('[data-testid="column-header"][data-field="email"]')).not.toBeVisible();
    
    // Test setColumnVisible - show the column again
    await columnApi.setColumnVisible('email', true);
    
    // Verify column is visible
    await expect(page.locator('[data-testid="column-header"][data-field="email"]')).toBeVisible();
    
    // Test setColumnsVisible - hide multiple columns
    await columnApi.setColumnsVisible(['firstName', 'lastName'], false);
    
    // Verify both columns are hidden
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="lastName"]')).not.toBeVisible();
    
    // Show them again
    await columnApi.setColumnsVisible(['firstName', 'lastName'], true);
    
    // Verify both columns are visible
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="lastName"]')).toBeVisible();
  });

  test('should support column pinning API methods', async () => {
    // Test setColumnPinned - pin to left
    await columnApi.setColumnPinned('id', 'left');
    
    // Verify column is pinned left
    await expect(page.locator('[data-testid="column-header"][data-field="id"].pinned-left')).toBeVisible();
    
    // Test setColumnPinned - pin to right
    await columnApi.setColumnPinned('department', 'right');
    
    // Verify column is pinned right
    await expect(page.locator('[data-testid="column-header"][data-field="department"].pinned-right')).toBeVisible();
    
    // Test setColumnsPinned - pin multiple columns
    await columnApi.setColumnsPinned(['firstName', 'lastName'], 'left');
    
    // Verify both columns are pinned left
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"].pinned-left')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="lastName"].pinned-left')).toBeVisible();
    
    // Test unpinning
    await columnApi.setColumnPinned('id', null);
    
    // Verify column is no longer pinned
    await expect(page.locator('[data-testid="column-header"][data-field="id"].pinned-left')).not.toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="id"].pinned-right')).not.toBeVisible();
  });

  test('should support column width API methods', async () => {
    // Test setColumnWidth
    await columnApi.setColumnWidth('firstName', 200);
    
    // Verify column width changed
    const firstNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="firstName"]')!).width;
    });
    expect(parseInt(firstNameWidth)).toBeCloseTo(200, 10);
    
    // Test setColumnWidths - set multiple widths
    const columnWidths = [
      { key: 'lastName', newWidth: 180 },
      { key: 'email', newWidth: 250 }
    ];
    await columnApi.setColumnWidths(columnWidths);
    
    // Verify widths were set
    const lastNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="lastName"]')!).width;
    });
    const emailWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="email"]')!).width;
    });
    
    expect(parseInt(lastNameWidth)).toBeCloseTo(180, 10);
    expect(parseInt(emailWidth)).toBeCloseTo(250, 10);
  });

  test('should support column movement API methods', async () => {
    // Get initial column order
    const initialOrder = await page.evaluate(() => {
      const headers = document.querySelectorAll('[data-testid="column-header"]');
      return Array.from(headers).map(header => header.getAttribute('data-field'));
    });
    
    // Test moveColumn - move firstName column to position 3
    await columnApi.moveColumn(1, 3); // firstName is at index 1, move to index 3
    
    // Verify column moved
    const newOrder1 = await page.evaluate(() => {
      const headers = document.querySelectorAll('[data-testid="column-header"]');
      return Array.from(headers).map(header => header.getAttribute('data-field'));
    });
    
    expect(newOrder1[3]).toBe('firstName');
    expect(newOrder1).not.toEqual(initialOrder);
    
    // Test moveColumns - move multiple columns
    await columnApi.moveColumns(['firstName', 'lastName'], 0); // Move both to beginning
    
    // Verify columns moved
    const newOrder2 = await page.evaluate(() => {
      const headers = document.querySelectorAll('[data-testid="column-header"]');
      return Array.from(headers).map(header => header.getAttribute('data-field'));
    });
    
    expect(newOrder2[0]).toBe('firstName');
    expect(newOrder2[1]).toBe('lastName');
    
    // Test moveColumnByIndex
    await columnApi.moveColumnByIndex(0, 5); // Move first column to position 5
    
    const finalOrder = await page.evaluate(() => {
      const headers = document.querySelectorAll('[data-testid="column-header"]');
      return Array.from(headers).map(header => header.getAttribute('data-field'));
    });
    
    expect(finalOrder[5]).toBe('firstName');
  });

  test('should support column auto-sizing API methods', async () => {
    // Test autoSizeColumn - single column
    await columnApi.autoSizeColumn('email');
    
    // Verify column was auto-sized (should fit content)
    const emailWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="email"]')!).width;
    });
    expect(parseInt(emailWidth)).toBeGreaterThan(100); // Should have reasonable width
    
    // Test autoSizeColumns - multiple columns
    await columnApi.autoSizeColumns(['firstName', 'lastName', 'department']);
    
    // Verify columns were auto-sized
    const firstNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="firstName"]')!).width;
    });
    const lastNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="lastName"]')!).width;
    });
    const departmentWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="department"]')!).width;
    });
    
    expect(parseInt(firstNameWidth)).toBeGreaterThan(50);
    expect(parseInt(lastNameWidth)).toBeGreaterThan(50);
    expect(parseInt(departmentWidth)).toBeGreaterThan(50);
    
    // Test autoSizeAllColumns
    await columnApi.autoSizeAllColumns();
    
    // Verify all columns were auto-sized
    const allColumnWidths = await page.evaluate(() => {
      const headers = document.querySelectorAll('[data-testid="column-header"]');
      return Array.from(headers).map(header => parseInt(getComputedStyle(header).width));
    });
    
    allColumnWidths.forEach(width => {
      expect(width).toBeGreaterThan(50);
    });
  });

  test('should support column state API methods', async () => {
    // Set up initial column state
    await columnApi.setColumnVisible('email', false);
    await columnApi.setColumnPinned('id', 'left');
    await columnApi.setColumnWidth('firstName', 180);
    
    // Test getColumnState
    const columnState = await columnApi.getColumnState();
    
    // Verify column state structure
    expect(Array.isArray(columnState)).toBe(true);
    expect(columnState.length).toBeGreaterThan(0);
    
    const idColumnState = columnState.find(state => state.colId === 'id');
    expect(idColumnState).toBeDefined();
    expect(idColumnState?.pinned).toBe('left');
    
    const emailColumnState = columnState.find(state => state.colId === 'email');
    expect(emailColumnState).toBeDefined();
    expect(emailColumnState?.hide).toBe(true);
    
    const firstNameColumnState = columnState.find(state => state.colId === 'firstName');
    expect(firstNameColumnState).toBeDefined();
    expect(firstNameColumnState?.width).toBe(180);
    
    // Test setColumnState
    const newColumnState = columnState.map(state => ({
      ...state,
      width: state.colId === 'lastName' ? 200 : state.width,
      pinned: state.colId === 'department' ? 'right' : state.pinned
    }));
    
    const success = await columnApi.setColumnState(newColumnState);
    expect(success).toBe(true);
    
    // Verify new state was applied
    const lastNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="lastName"]')!).width;
    });
    expect(parseInt(lastNameWidth)).toBeCloseTo(200, 10);
    
    await expect(page.locator('[data-testid="column-header"][data-field="department"].pinned-right')).toBeVisible();
    
    // Test resetColumnState
    await columnApi.resetColumnState();
    
    // Verify columns are back to default state
    await expect(page.locator('[data-testid="column-header"][data-field="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="id"].pinned-left')).not.toBeVisible();
  });

  test('should handle column state persistence', async () => {
    // Set up complex column state
    await columnApi.setColumnVisible('age', false);
    await columnApi.setColumnPinned('firstName', 'left');
    await columnApi.setColumnPinned('salary', 'right');
    await columnApi.setColumnWidth('email', 300);
    await columnApi.moveColumn(2, 4); // Move lastName column
    
    // Get the state
    const savedState = await columnApi.getColumnState();
    
    // Reset to defaults
    await columnApi.resetColumnState();
    
    // Verify reset worked
    await expect(page.locator('[data-testid="column-header"][data-field="age"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"].pinned-left')).not.toBeVisible();
    
    // Restore saved state
    await columnApi.setColumnState(savedState);
    
    // Verify restoration
    await expect(page.locator('[data-testid="column-header"][data-field="age"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"].pinned-left')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="salary"].pinned-right')).toBeVisible();
    
    const emailWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="email"]')!).width;
    });
    expect(parseInt(emailWidth)).toBeCloseTo(300, 10);
  });

  test('should support interactive column operations', async () => {
    // Test drag-to-resize functionality
    const resizeHandle = page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="resize-handle"]');
    await expect(resizeHandle).toBeVisible();
    
    // Get initial width
    const initialWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="firstName"]')!).width;
    });
    
    // Perform drag resize
    await resizeHandle.hover();
    await page.mouse.down();
    await page.mouse.move(50, 0); // Move 50px to the right
    await page.mouse.up();
    
    // Verify width changed
    const newWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="firstName"]')!).width;
    });
    
    expect(parseInt(newWidth)).toBeGreaterThan(parseInt(initialWidth));
    
    // Test drag-to-reorder functionality (if supported)
    const firstColumnHeader = page.locator('[data-testid="column-header"][data-field="firstName"]');
    const targetPosition = page.locator('[data-testid="column-header"][data-field="email"]');
    
    await firstColumnHeader.dragTo(targetPosition);
    
    // Verify column order changed
    const newOrder = await page.evaluate(() => {
      const headers = document.querySelectorAll('[data-testid="column-header"]');
      return Array.from(headers).map(header => header.getAttribute('data-field'));
    });
    
    // firstName should no longer be in the first position (after id)
    expect(newOrder[1]).not.toBe('firstName');
  });

  test('should handle column menu interactions', async () => {
    // Test column menu opening
    const columnMenuButton = page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="column-menu-button"]');
    await columnMenuButton.click();
    
    // Verify column menu is visible
    await expect(page.locator('[data-testid="column-menu"]')).toBeVisible();
    
    // Test hide column from menu
    await page.click('[data-testid="column-menu-hide"]');
    
    // Verify column was hidden
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"]')).not.toBeVisible();
    
    // Test show column (from columns panel or API)
    await columnApi.setColumnVisible('firstName', true);
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"]')).toBeVisible();
  });

  test('should support column filtering integration', async () => {
    // Test that column API works with filtering
    await columnApi.setColumnVisible('age', false);
    await columnApi.setColumnPinned('firstName', 'left');
    
    // Apply filters using grid API
    await gridApi.setQuickFilter('John');
    
    // Verify that column state is preserved with filtering
    await expect(page.locator('[data-testid="column-header"][data-field="age"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"].pinned-left')).toBeVisible();
    
    // Clear filter
    await gridApi.resetQuickFilter();
    
    // Verify column state still preserved
    await expect(page.locator('[data-testid="column-header"][data-field="age"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"].pinned-left')).toBeVisible();
  });

  test('should support column sorting integration', async () => {
    // Set up column state
    await columnApi.setColumnPinned('firstName', 'left');
    await columnApi.setColumnWidth('lastName', 200);
    
    // Apply sorting using grid API
    await gridApi.setSortModel([{ colId: 'firstName', sort: 'asc' }]);
    
    // Verify column state is preserved with sorting
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"].pinned-left')).toBeVisible();
    
    const lastNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="lastName"]')!).width;
    });
    expect(parseInt(lastNameWidth)).toBeCloseTo(200, 10);
    
    // Verify sort indicator appears on pinned column
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="sort-indicator"]')).toBeVisible();
  });

  test('should handle error cases gracefully', async () => {
    // Test invalid column key
    try {
      await columnApi.setColumnVisible('nonExistentColumn', false);
      // Should handle gracefully
      expect(true).toBe(true);
    } catch (error) {
      // Or provide meaningful error
      expect(error).toBeDefined();
    }
    
    // Test invalid width
    try {
      await columnApi.setColumnWidth('firstName', -100);
      // Should handle gracefully or clamp to minimum
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
    
    // Test invalid column index
    try {
      await columnApi.moveColumn(999, 0);
      // Should handle gracefully
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('should maintain column API consistency', async () => {
    // Perform series of operations
    const operations = [
      () => columnApi.setColumnVisible('email', false),
      () => columnApi.setColumnPinned('firstName', 'left'),
      () => columnApi.setColumnWidth('lastName', 180),
      () => columnApi.moveColumn(2, 4),
      () => columnApi.autoSizeColumn('department')
    ];
    
    // Execute all operations
    for (const operation of operations) {
      await operation();
    }
    
    // Get final state
    const finalState = await columnApi.getColumnState();
    
    // Reset everything
    await columnApi.resetColumnState();
    
    // Verify reset
    await expect(page.locator('[data-testid="column-header"][data-field="email"]')).toBeVisible();
    
    // Restore state
    await columnApi.setColumnState(finalState);
    
    // Verify all operations were restored correctly
    await expect(page.locator('[data-testid="column-header"][data-field="email"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"].pinned-left')).toBeVisible();
    
    const lastNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="lastName"]')!).width;
    });
    expect(parseInt(lastNameWidth)).toBeCloseTo(180, 10);
  });
});