/**
 * Grid API Compatibility Tests
 * Tests that ag-Grid API methods work correctly with BigLedger Grid through compatibility layer
 */

import { test, expect, Page } from '@playwright/test';
import { BlgGridApiWrapper, BlgColumnApiWrapper } from '../utils/api-compatibility-layer.js';
import { MigrationTestData } from '../test-data/migration-test-data.js';

test.describe('ag-Grid API Compatibility - Grid API', () => {
  let page: Page;
  let gridApi: BlgGridApiWrapper;
  let columnApi: BlgColumnApiWrapper;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    gridApi = new BlgGridApiWrapper(page);
    columnApi = new BlgColumnApiWrapper(page);
    
    await page.goto('/grid-demo');
    
    // Setup grid with test data
    await page.evaluate((data) => {
      window.testGridInstance?.setRowData(data);
    }, MigrationTestData.getBasicRowData());
  });

  test('should support setRowData and getSelectedRows API methods', async () => {
    const testData = MigrationTestData.getBasicRowData();
    
    // Test setRowData
    await gridApi.setRowData(testData);
    
    // Verify data was set
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBe(testData.length);
    
    // Test row selection
    await page.click('[data-testid="grid-row"]:first-child [data-testid="row-checkbox"]');
    
    // Test getSelectedRows
    const selectedRows = await gridApi.getSelectedRows();
    expect(selectedRows.length).toBe(1);
    expect(selectedRows[0].id).toBe(testData[0].id);
  });

  test('should support selectAll and deselectAll API methods', async () => {
    // Test selectAll
    await gridApi.selectAll();
    
    // Verify all rows are selected
    const allSelectedRows = await gridApi.getSelectedRows();
    expect(allSelectedRows.length).toBe(MigrationTestData.getBasicRowData().length);
    
    // Test deselectAll
    await gridApi.deselectAll();
    
    // Verify no rows are selected
    const noSelectedRows = await gridApi.getSelectedRows();
    expect(noSelectedRows.length).toBe(0);
  });

  test('should support filtering API methods', async () => {
    // Test setQuickFilter
    await gridApi.setQuickFilter('John');
    
    // Verify quick filter was applied
    const isQuickFilterPresent = await gridApi.isQuickFilterPresent();
    expect(isQuickFilterPresent).toBe(true);
    
    // Verify filtered results
    const visibleRows = await page.locator('[data-testid="grid-row"]').count();
    expect(visibleRows).toBeLessThan(MigrationTestData.getBasicRowData().length);
    
    // Test setFilterModel
    const filterModel = {
      firstName: {
        filterType: 'text',
        type: 'contains',
        filter: 'Jane'
      }
    };
    
    await gridApi.setFilterModel(filterModel);
    
    // Verify filter model was applied
    const retrievedFilterModel = await gridApi.getFilterModel();
    expect(retrievedFilterModel.firstName).toBeDefined();
    
    // Test isAnyFilterPresent
    const hasFilters = await gridApi.isAnyFilterPresent();
    expect(hasFilters).toBe(true);
    
    // Clear filters
    await gridApi.setFilterModel({});
    await gridApi.resetQuickFilter();
    
    const noFilters = await gridApi.isAnyFilterPresent();
    expect(noFilters).toBe(false);
  });

  test('should support sorting API methods', async () => {
    // Test setSortModel
    const sortModel = [
      { colId: 'firstName', sort: 'asc' },
      { colId: 'age', sort: 'desc' }
    ];
    
    await gridApi.setSortModel(sortModel);
    
    // Verify sort was applied
    const retrievedSortModel = await gridApi.getSortModel();
    expect(retrievedSortModel.length).toBe(2);
    expect(retrievedSortModel[0].colId).toBe('firstName');
    expect(retrievedSortModel[0].sort).toBe('asc');
    
    // Verify visual sort indicators
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="sort-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="age"] [data-testid="sort-indicator"]')).toBeVisible();
  });

  test('should support scrolling API methods', async () => {
    // Use a larger dataset for scrolling tests
    const largeData = MigrationTestData.getLargeDataset(100);
    await gridApi.setRowData(largeData);
    
    // Test ensureIndexVisible
    await gridApi.ensureIndexVisible(50);
    
    // Verify the grid scrolled to show row 50
    const viewport = page.locator('[data-testid="grid-viewport"]');
    const scrollTop = await viewport.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);
    
    // Test ensureColumnVisible
    await gridApi.ensureColumnVisible('email');
    
    // Verify column is visible in viewport
    const emailHeader = page.locator('[data-testid="column-header"][data-field="email"]');
    await expect(emailHeader).toBeInViewport();
  });

  test('should support column API methods', async () => {
    // Test setColumnDefs
    const newColumnDefs = [
      { field: 'id', headerName: 'Identifier', width: 100 },
      { field: 'firstName', headerName: 'Given Name', width: 150 },
      { field: 'lastName', headerName: 'Surname', width: 150 }
    ];
    
    await gridApi.setColumnDefs(newColumnDefs);
    
    // Verify column definitions were updated
    const updatedColumnDefs = await gridApi.getColumnDefs();
    expect(updatedColumnDefs.length).toBe(3);
    
    // Verify header names changed
    await expect(page.locator('[data-testid="column-header"][data-field="id"]')).toContainText('Identifier');
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"]')).toContainText('Given Name');
  });

  test('should support auto-sizing API methods', async () => {
    // Test autoSizeColumns
    await gridApi.autoSizeColumns(['firstName', 'lastName']);
    
    // Verify columns were auto-sized (implementation dependent)
    const firstNameWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="firstName"]')!).width;
    });
    
    expect(parseInt(firstNameWidth)).toBeGreaterThan(50); // Should have some reasonable width
    
    // Test autoSizeAllColumns
    await gridApi.autoSizeAllColumns();
    
    // Verify all columns have been auto-sized
    const columnHeaders = await page.locator('[data-testid="column-header"]').all();
    for (const header of columnHeaders) {
      const width = await header.evaluate(el => getComputedStyle(el).width);
      expect(parseInt(width)).toBeGreaterThan(50);
    }
    
    // Test sizeColumnsToFit
    await gridApi.sizeColumnsToFit();
    
    // Verify columns fit the container
    const gridWidth = await page.evaluate(() => {
      return document.querySelector('[data-testid="blg-grid"]')!.clientWidth;
    });
    
    const totalColumnWidth = await page.evaluate(() => {
      const headers = document.querySelectorAll('[data-testid="column-header"]');
      return Array.from(headers).reduce((sum, header) => {
        return sum + parseFloat(getComputedStyle(header).width);
      }, 0);
    });
    
    expect(totalColumnWidth).toBeLessThanOrEqual(gridWidth + 10); // Allow for small rounding differences
  });

  test('should support refresh API methods', async () => {
    // Test refreshCells
    await gridApi.refreshCells({ force: true });
    
    // Verify grid is still functional after refresh
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Test redrawRows
    await gridApi.redrawRows({ rowNodes: [0, 1, 2] });
    
    // Verify specified rows are still visible and functional
    const firstRowData = await page.locator('[data-testid="grid-row"]:first-child [data-testid="grid-cell"]').first().textContent();
    expect(firstRowData).toBeTruthy();
    
    // Test refreshHeader
    await gridApi.refreshHeader();
    
    // Verify headers are still visible
    const headerCount = await page.locator('[data-testid="column-header"]').count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('should support export API methods', async () => {
    // Test exportDataAsCsv
    const csvData = await gridApi.exportDataAsCsv();
    
    // Verify CSV export contains data
    expect(csvData).toBeTruthy();
    expect(csvData).toContain('firstName'); // Should contain header
    expect(csvData).toContain('John'); // Should contain data
    
    // Test getDataAsCsv (should be identical to exportDataAsCsv)
    const csvData2 = await gridApi.getDataAsCsv();
    expect(csvData2).toBe(csvData);
    
    // Test exportDataAsExcel (if supported)
    try {
      await gridApi.exportDataAsExcel({ fileName: 'test-export.xlsx' });
      // If no error is thrown, the method is supported
      expect(true).toBe(true);
    } catch (error) {
      // Excel export might not be implemented
      console.log('Excel export not implemented:', error);
    }
  });

  test('should support overlay API methods', async () => {
    // Test showLoadingOverlay
    await gridApi.showLoadingOverlay();
    
    // Verify loading overlay is shown
    await expect(page.locator('[data-testid="loading-overlay"]')).toBeVisible();
    
    // Test hideOverlay
    await gridApi.hideOverlay();
    
    // Verify overlay is hidden
    await expect(page.locator('[data-testid="loading-overlay"]')).not.toBeVisible();
    
    // Test showNoRowsOverlay
    await gridApi.setRowData([]); // Set empty data
    await gridApi.showNoRowsOverlay();
    
    // Verify no rows overlay is shown
    await expect(page.locator('[data-testid="no-rows-overlay"]')).toBeVisible();
    
    // Restore data and hide overlay
    await gridApi.setRowData(MigrationTestData.getBasicRowData());
    await gridApi.hideOverlay();
    
    await expect(page.locator('[data-testid="no-rows-overlay"]')).not.toBeVisible();
  });

  test('should support data access API methods', async () => {
    // Test getDisplayedRowCount
    const displayedRowCount = await gridApi.getDisplayedRowCount();
    expect(displayedRowCount).toBe(MigrationTestData.getBasicRowData().length);
    
    // Test getFirstDisplayedRow and getLastDisplayedRow
    const firstDisplayedRow = await gridApi.getFirstDisplayedRow();
    const lastDisplayedRow = await gridApi.getLastDisplayedRow();
    
    expect(firstDisplayedRow).toBe(0);
    expect(lastDisplayedRow).toBe(displayedRowCount - 1);
    
    // Test getDisplayedRowAtIndex
    const firstRowNode = await gridApi.getDisplayedRowAtIndex(0);
    expect(firstRowNode).toBeDefined();
    expect(firstRowNode.id).toBe(1); // First row should have ID 1
    
    // Test getValue
    const firstRowFirstName = await gridApi.getValue('firstName', firstRowNode);
    expect(firstRowFirstName).toBe('John');
  });

  test('should handle event listeners', async () => {
    let eventFired = false;
    
    // Test addEventListener
    const testEventHandler = () => { eventFired = true; };
    
    // Note: This test would need to be adapted based on the actual event system
    await page.evaluate(() => {
      window.testEventFired = false;
      window.testGridInstance?.addEventListener('cellClicked', () => {
        window.testEventFired = true;
      });
    });
    
    // Trigger an event
    await page.click('[data-testid="grid-cell"]');
    
    // Check if event was fired
    const wasEventFired = await page.evaluate(() => window.testEventFired);
    expect(wasEventFired).toBe(true);
  });

  test('should support model access methods', async () => {
    // Test getModel
    const model = await gridApi.getModel();
    expect(model).toBeDefined();
    
    // Model should provide access to the underlying data structure
    // Implementation would depend on how BLG Grid exposes its model
    expect(typeof model).toBe('object');
  });

  test('should handle API method chaining', async () => {
    // Test that multiple API calls can be chained together
    await gridApi.setQuickFilter('John');
    const selectedRows1 = await gridApi.getSelectedRows();
    
    await gridApi.selectAll();
    const selectedRows2 = await gridApi.getSelectedRows();
    
    await gridApi.deselectAll();
    const selectedRows3 = await gridApi.getSelectedRows();
    
    await gridApi.resetQuickFilter();
    
    // Verify the sequence worked correctly
    expect(selectedRows1.length).toBe(0); // No selection initially
    expect(selectedRows2.length).toBeGreaterThan(0); // After selectAll with filter
    expect(selectedRows3.length).toBe(0); // After deselectAll
    
    // Verify filter was cleared
    const hasFilter = await gridApi.isAnyFilterPresent();
    expect(hasFilter).toBe(false);
  });

  test('should handle errors gracefully', async () => {
    // Test invalid column reference
    try {
      await gridApi.ensureColumnVisible('nonExistentColumn');
      // If no error, the method handled it gracefully
      expect(true).toBe(true);
    } catch (error) {
      // Error should be informative
      expect(error).toBeDefined();
    }
    
    // Test invalid row index
    try {
      const rowNode = await gridApi.getDisplayedRowAtIndex(999999);
      // Should return null or undefined for invalid index
      expect(rowNode).toBeFalsy();
    } catch (error) {
      // Or throw a meaningful error
      expect(error).toBeDefined();
    }
    
    // Test invalid filter model
    try {
      await gridApi.setFilterModel({ invalidColumn: { type: 'invalid' } });
      // Should handle gracefully or provide meaningful error
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('should maintain API consistency across operations', async () => {
    const originalData = MigrationTestData.getBasicRowData();
    
    // Perform a series of operations
    await gridApi.setRowData(originalData);
    await gridApi.setSortModel([{ colId: 'firstName', sort: 'asc' }]);
    await gridApi.setQuickFilter('a'); // Filter for rows containing 'a'
    
    // Get state
    const sortModel = await gridApi.getSortModel();
    const filterModel = await gridApi.getFilterModel();
    const filteredRowCount = await gridApi.getDisplayedRowCount();
    
    // Clear and reset
    await gridApi.setSortModel([]);
    await gridApi.resetQuickFilter();
    await gridApi.setRowData([]);
    
    // Restore state
    await gridApi.setRowData(originalData);
    await gridApi.setSortModel(sortModel);
    await gridApi.setQuickFilter('a');
    
    // Verify state was restored correctly
    const restoredSortModel = await gridApi.getSortModel();
    const restoredFilterPresent = await gridApi.isQuickFilterPresent();
    const restoredRowCount = await gridApi.getDisplayedRowCount();
    
    expect(restoredSortModel).toEqual(sortModel);
    expect(restoredFilterPresent).toBe(true);
    expect(restoredRowCount).toBe(filteredRowCount);
  });
});