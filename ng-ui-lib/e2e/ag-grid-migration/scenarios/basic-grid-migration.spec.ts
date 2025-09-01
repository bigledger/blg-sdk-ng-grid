/**
 * Basic Grid Migration Tests
 * Tests the migration of basic ag-Grid configurations to BigLedger Grid
 */

import { test, expect, Page } from '@playwright/test';
import { MigrationMapper } from '../utils/migration-mapper.js';
import { MigrationTestData } from '../test-data/migration-test-data.js';
import { BigLedgerGridApiWrapper } from '../utils/api-compatibility-layer.js';

test.describe('ag-Grid to BigLedger Grid - Basic Migration', () => {
  let page: Page;
  let gridApi: BigLedgerGridApiWrapper;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    gridApi = new BigLedgerGridApiWrapper(page);
    await page.goto('/grid-demo'); // Assumes a demo page exists
  });

  test('should render identical output for basic grid with rowData and columnDefs', async () => {
    // Get ag-Grid configuration
    const agGridOptions = MigrationTestData.getBasicAgGridOptions();
    
    // Migrate to BLG configuration
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify data migration
    expect(blgConfig.data).toBeDefined();
    expect(blgConfig.data?.length).toBe(10);
    expect(blgConfig.columns).toBeDefined();
    expect(blgConfig.columns?.length).toBe(7);
    
    // Apply configuration to grid (assuming a test interface exists)
    await page.evaluate((config) => {
      // This would apply the BLG configuration to the grid
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify grid renders correctly
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    
    // Verify row count
    const displayedRows = await page.locator('[data-testid="grid-row"]').count();
    expect(displayedRows).toBeGreaterThan(0);
    
    // Verify column headers
    const columnHeaders = await page.locator('[data-testid="column-header"]').count();
    expect(columnHeaders).toBe(7);
    
    // Verify first row data
    const firstRowData = await page.locator('[data-testid="grid-row"]:first-child [data-testid="grid-cell"]').allTextContents();
    expect(firstRowData[1]).toBe('John'); // firstName
    expect(firstRowData[2]).toBe('Doe');  // lastName
  });

  test('should handle pagination correctly', async () => {
    const agGridOptions = MigrationTestData.getBasicAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify pagination configuration
    expect(blgConfig.pagination?.enabled).toBe(true);
    expect(blgConfig.pagination?.pageSize).toBe(5);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify pagination controls exist
    await expect(page.locator('[data-testid="pagination-controls"]')).toBeVisible();
    
    // Verify page size is respected
    const visibleRows = await page.locator('[data-testid="grid-row"]:visible').count();
    expect(visibleRows).toBeLessThanOrEqual(5);
    
    // Test pagination navigation
    await page.click('[data-testid="next-page-button"]');
    await page.waitForTimeout(100); // Allow for pagination to complete
    
    // Verify we moved to next page
    const pageInfo = await page.locator('[data-testid="page-info"]').textContent();
    expect(pageInfo).toContain('2'); // Should be on page 2
  });

  test('should maintain row selection behavior', async () => {
    const agGridOptions = MigrationTestData.getBasicAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify selection configuration
    expect(blgConfig.selection?.mode).toBe('single');
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test single row selection
    await page.click('[data-testid="grid-row"]:first-child');
    
    // Verify only one row is selected
    const selectedRows = await page.locator('[data-testid="grid-row"].selected').count();
    expect(selectedRows).toBe(1);
    
    // Click another row and verify selection moves
    await page.click('[data-testid="grid-row"]:nth-child(2)');
    const newSelectedRows = await page.locator('[data-testid="grid-row"].selected').count();
    expect(newSelectedRows).toBe(1);
    
    // Verify the first row is no longer selected
    const firstRowSelected = await page.locator('[data-testid="grid-row"]:first-child').getAttribute('class');
    expect(firstRowSelected).not.toContain('selected');
  });

  test('should preserve column properties', async () => {
    const agGridOptions = MigrationTestData.getBasicAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify column mapping
    const columns = blgConfig.columns!;
    
    // Check ID column
    const idColumn = columns.find(col => col.field === 'id');
    expect(idColumn).toBeDefined();
    expect(idColumn?.headerName).toBe('ID');
    expect(idColumn?.width).toBe(80);
    expect(idColumn?.sortable).toBe(true);
    
    // Check firstName column
    const firstNameColumn = columns.find(col => col.field === 'firstName');
    expect(firstNameColumn).toBeDefined();
    expect(firstNameColumn?.headerName).toBe('First Name');
    expect(firstNameColumn?.width).toBe(120);
    expect(firstNameColumn?.sortable).toBe(true);
    expect(firstNameColumn?.filterable).toBe(true);
    expect(firstNameColumn?.filterType).toBe('text');
    
    // Check salary column
    const salaryColumn = columns.find(col => col.field === 'salary');
    expect(salaryColumn).toBeDefined();
    expect(salaryColumn?.filterType).toBe('number');
  });

  test('should handle empty data gracefully', async () => {
    const agGridOptions = {
      ...MigrationTestData.getBasicAgGridOptions(),
      rowData: []
    };
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify empty data handling
    expect(blgConfig.data).toBeDefined();
    expect(blgConfig.data?.length).toBe(0);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify grid shows empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="grid-row"]')).toHaveCount(0);
    
    // Verify column headers still show
    const columnHeaders = await page.locator('[data-testid="column-header"]').count();
    expect(columnHeaders).toBe(7);
  });

  test('should handle null and undefined values in data', async () => {
    const agGridOptions = {
      ...MigrationTestData.getBasicAgGridOptions(),
      rowData: [
        { id: 1, firstName: 'John', lastName: null, email: undefined, age: 30, salary: 0 },
        { id: 2, firstName: '', lastName: 'Smith', email: 'jane@example.com', age: null },
        { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' } // Missing fields
      ]
    };
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify grid handles null/undefined values
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBe(3);
    
    // Check that empty/null cells are handled appropriately
    const firstRowCells = await page.locator('[data-testid="grid-row"]:first-child [data-testid="grid-cell"]').allTextContents();
    expect(firstRowCells[2]).toBe(''); // null lastName should be empty
  });

  test('should preserve theme configuration', async () => {
    const agGridOptions = {
      ...MigrationTestData.getBasicAgGridOptions(),
      theme: 'ag-theme-alpine'
    };
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify theme mapping
    expect(blgConfig.theme).toBe('blg-theme-default');
    
    // Test different theme mappings
    const darkThemeOptions = {
      ...agGridOptions,
      theme: 'ag-theme-alpine-dark'
    };
    const darkBlgConfig = MigrationMapper.migrateGridOptions(darkThemeOptions);
    expect(darkBlgConfig.theme).toBe('blg-theme-dark');
  });

  test('should preserve row and header height settings', async () => {
    const agGridOptions = {
      ...MigrationTestData.getBasicAgGridOptions(),
      rowHeight: 50,
      headerHeight: 60
    };
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify height settings
    expect(blgConfig.rowHeight).toBe(50);
    expect(blgConfig.headerHeight).toBe(60);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify heights are applied (if grid supports CSS custom properties)
    const headerHeight = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="grid-header"]')!).height;
    });
    
    const rowHeight = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="grid-row"]')!).height;
    });
    
    expect(parseInt(headerHeight)).toBeCloseTo(60, 5);
    expect(parseInt(rowHeight)).toBeCloseTo(50, 5);
  });

  test('should handle column width specifications', async () => {
    const agGridOptions = MigrationTestData.getBasicAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify column widths are applied
    const idColumnWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="id"]')!).width;
    });
    
    const emailColumnWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="email"]')!).width;
    });
    
    expect(parseInt(idColumnWidth)).toBeCloseTo(80, 10);
    expect(parseInt(emailColumnWidth)).toBeCloseTo(200, 10);
  });

  test('should generate compatibility warnings for unsupported features', async () => {
    const agGridOptions = {
      ...MigrationTestData.getBasicAgGridOptions(),
      masterDetail: true,
      treeData: true,
      rowModelType: 'serverSide' as const
    };
    
    const warnings = MigrationMapper.generateMigrationWarnings(agGridOptions);
    
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.includes('Master-Detail'))).toBe(true);
    expect(warnings.some(w => w.includes('Tree data'))).toBe(true);
    expect(warnings.some(w => w.includes('serverSide'))).toBe(true);
  });

  test('should generate accurate compatibility report', async () => {
    const agGridOptions = MigrationTestData.getBasicAgGridOptions();
    const report = MigrationMapper.generateCompatibilityReport(agGridOptions);
    
    // Verify basic features are compatible
    expect(report.compatible).toContain('Basic row data');
    expect(report.compatible).toContain('Column definitions');
    expect(report.compatible).toContain('Pagination');
    expect(report.compatible).toContain('Row selection');
    
    // Verify unsupported features are empty for basic config
    expect(report.unsupported.length).toBe(0);
    
    // Test with complex configuration
    const complexOptions = {
      ...agGridOptions,
      masterDetail: true,
      treeData: true
    };
    const complexReport = MigrationMapper.generateCompatibilityReport(complexOptions);
    
    expect(complexReport.requiresWork.length).toBeGreaterThan(0);
    expect(complexReport.unsupported.length).toBeGreaterThan(0);
  });
});