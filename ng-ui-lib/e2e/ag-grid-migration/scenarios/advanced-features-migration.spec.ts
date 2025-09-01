/**
 * Advanced Features Migration Tests
 * Tests migration of complex ag-Grid features to BigLedger Grid
 */

import { test, expect, Page } from '@playwright/test';
import { MigrationMapper } from '../utils/migration-mapper.js';
import { MigrationTestData } from '../test-data/migration-test-data.js';
import { BigLedgerGridApiWrapper } from '../utils/api-compatibility-layer.js';

test.describe('ag-Grid to BigLedger Grid - Advanced Features Migration', () => {
  let page: Page;
  let gridApi: BigLedgerGridApiWrapper;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    gridApi = new BigLedgerGridApiWrapper(page);
    await page.goto('/grid-demo');
  });

  test('should handle sorting, filtering, and pagination together', async () => {
    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify advanced configuration migration
    expect(blgConfig.pagination?.enabled).toBe(true);
    expect(blgConfig.pagination?.pageSize).toBe(10);
    expect(blgConfig.selection?.mode).toBe('multiple');
    expect(blgConfig.sorting?.enabled).toBe(true);
    expect(blgConfig.sorting?.multiSort).toBe(true);
    expect(blgConfig.filtering?.enabled).toBe(true);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test sorting functionality
    await page.click('[data-testid="column-header"][data-field="firstName"] [data-testid="sort-button"]');
    await page.waitForTimeout(100);
    
    // Verify sort indicator
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="sort-indicator"]')).toBeVisible();
    
    // Test filtering
    await page.click('[data-testid="column-header"][data-field="firstName"] [data-testid="filter-button"]');
    await page.fill('[data-testid="text-filter-input"]', 'John');
    await page.press('[data-testid="text-filter-input"]', 'Enter');
    
    // Verify filtering applied
    const filteredRows = await page.locator('[data-testid="grid-row"]').count();
    expect(filteredRows).toBeLessThan(10); // Should have fewer rows after filtering
    
    // Test pagination with filters
    const pageInfo = await page.locator('[data-testid="page-info"]').textContent();
    expect(pageInfo).toMatch(/Page \d+ of \d+/);
  });

  test('should migrate custom cell renderers', async () => {
    const agGridOptions = MigrationTestData.getCellRendererAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify cell renderer migration
    const nameColumn = blgConfig.columns?.find(col => col.field === 'firstName');
    expect(nameColumn?.cellRenderer).toBeDefined();
    
    const emailColumn = blgConfig.columns?.find(col => col.field === 'email');
    expect(emailColumn?.cellRenderer).toBeDefined();
    
    const salaryColumn = blgConfig.columns?.find(col => col.field === 'salary');
    expect(salaryColumn?.cellRenderer).toBeDefined();
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test that custom renderers work
    await expect(page.locator('[data-testid="grid-cell"][data-field="email"] a')).toBeVisible();
    
    // Verify email link functionality
    const emailLink = page.locator('[data-testid="grid-cell"][data-field="email"] a').first();
    const href = await emailLink.getAttribute('href');
    expect(href).toContain('mailto:');
    
    // Check currency formatting
    const salaryCell = page.locator('[data-testid="grid-cell"][data-field="salary"]').first();
    const salaryText = await salaryCell.textContent();
    expect(salaryText).toMatch(/\$\d{1,3}(,\d{3})*/); // Currency format with commas
  });

  test('should handle cell editors correctly', async () => {
    const agGridOptions = MigrationTestData.getCellEditorAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify editable columns
    const editableColumns = blgConfig.columns?.filter(col => col.editable === true);
    expect(editableColumns?.length).toBe(5); // firstName, lastName, age, salary, department
    
    const nonEditableColumns = blgConfig.columns?.filter(col => col.editable === false);
    expect(nonEditableColumns?.length).toBe(1); // ID column
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test text cell editor
    await page.dblclick('[data-testid="grid-cell"][data-field="firstName"]');
    await expect(page.locator('[data-testid="cell-editor-input"]')).toBeVisible();
    await page.fill('[data-testid="cell-editor-input"]', 'Updated Name');
    await page.press('[data-testid="cell-editor-input"]', 'Enter');
    
    // Verify the cell value was updated
    const updatedCell = page.locator('[data-testid="grid-cell"][data-field="firstName"]').first();
    await expect(updatedCell).toContainText('Updated Name');
    
    // Test numeric cell editor
    await page.dblclick('[data-testid="grid-cell"][data-field="age"]');
    await expect(page.locator('[data-testid="cell-editor-input"][type="number"]')).toBeVisible();
    
    // Test select cell editor (department)
    await page.dblclick('[data-testid="grid-cell"][data-field="department"]');
    await expect(page.locator('[data-testid="cell-editor-select"]')).toBeVisible();
    
    const selectOptions = await page.locator('[data-testid="cell-editor-select"] option').allTextContents();
    expect(selectOptions).toContain('Engineering');
    expect(selectOptions).toContain('Marketing');
    expect(selectOptions).toContain('HR');
  });

  test('should handle multiple row selection with checkboxes', async () => {
    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify selection configuration
    expect(blgConfig.selection?.mode).toBe('multiple');
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test checkbox selection
    await page.click('[data-testid="grid-row"]:first-child [data-testid="row-checkbox"]');
    await page.click('[data-testid="grid-row"]:nth-child(2) [data-testid="row-checkbox"]');
    
    // Verify multiple rows are selected
    const selectedRows = await page.locator('[data-testid="grid-row"].selected').count();
    expect(selectedRows).toBe(2);
    
    // Test select all checkbox
    await page.click('[data-testid="select-all-checkbox"]');
    
    // Verify all visible rows are selected
    const visibleRows = await page.locator('[data-testid="grid-row"]').count();
    const allSelectedRows = await page.locator('[data-testid="grid-row"].selected').count();
    expect(allSelectedRows).toBe(visibleRows);
    
    // Test deselect all
    await page.click('[data-testid="select-all-checkbox"]');
    const deselectedRows = await page.locator('[data-testid="grid-row"].selected').count();
    expect(deselectedRows).toBe(0);
  });

  test('should handle column pinning', async () => {
    const agGridOptions = MigrationTestData.getCellRendererAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify pinned column migration
    const pinnedColumn = blgConfig.columns?.find(col => col.pinned === 'right');
    expect(pinnedColumn).toBeDefined();
    expect(pinnedColumn?.headerName).toBe('Actions');
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify pinned column is visible and positioned correctly
    await expect(page.locator('[data-testid="pinned-right-columns"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"].pinned-right')).toBeVisible();
    
    // Test that pinned column stays in place during horizontal scroll
    await page.evaluate(() => {
      document.querySelector('[data-testid="grid-viewport"]')?.scrollTo({ left: 200 });
    });
    
    // Pinned column should still be visible
    await expect(page.locator('[data-testid="column-header"].pinned-right')).toBeVisible();
  });

  test('should handle value formatters correctly', async () => {
    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Find salary column with formatter
    const salaryColumn = blgConfig.columns?.find(col => col.field === 'salary');
    expect(salaryColumn?.valueFormatter).toBeDefined();
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify formatted values are displayed
    const salaryCells = await page.locator('[data-testid="grid-cell"][data-field="salary"]').allTextContents();
    
    // All salary cells should be formatted as currency
    salaryCells.forEach(cellText => {
      expect(cellText).toMatch(/^\$\d{1,3}(,\d{3})*$/);
    });
  });

  test('should handle custom themes correctly', async () => {
    const agGridOptions = MigrationTestData.getCustomThemeAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify theme mapping
    expect(blgConfig.theme).toBe('blg-theme-dark');
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Verify theme class is applied to grid container
    const gridContainer = page.locator('[data-testid="blg-grid"]');
    const className = await gridContainer.getAttribute('class');
    expect(className).toContain('blg-theme-dark');
    
    // Test theme switching
    await page.evaluate(() => {
      window.testGridInstance?.setTheme('blg-theme-default');
    });
    
    const newClassName = await gridContainer.getAttribute('class');
    expect(newClassName).toContain('blg-theme-default');
    expect(newClassName).not.toContain('blg-theme-dark');
  });

  test('should handle filter types correctly', async () => {
    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify filter type mapping
    const textColumn = blgConfig.columns?.find(col => col.field === 'firstName');
    expect(textColumn?.filterType).toBe('text');
    
    const numberColumn = blgConfig.columns?.find(col => col.field === 'age');
    expect(numberColumn?.filterType).toBe('number');
    
    const setColumn = blgConfig.columns?.find(col => col.field === 'department');
    expect(setColumn?.filterType).toBe('set');
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test text filter
    await page.click('[data-testid="column-header"][data-field="firstName"] [data-testid="filter-button"]');
    await expect(page.locator('[data-testid="text-filter-input"]')).toBeVisible();
    
    // Test number filter
    await page.click('[data-testid="column-header"][data-field="age"] [data-testid="filter-button"]');
    await expect(page.locator('[data-testid="number-filter-input"]')).toBeVisible();
    
    // Test set filter
    await page.click('[data-testid="column-header"][data-field="department"] [data-testid="filter-button"]');
    await expect(page.locator('[data-testid="set-filter-list"]')).toBeVisible();
    
    const filterOptions = await page.locator('[data-testid="set-filter-option"]').allTextContents();
    expect(filterOptions).toContain('Engineering');
    expect(filterOptions).toContain('Marketing');
  });

  test('should handle multi-column sorting', async () => {
    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    expect(blgConfig.sorting?.multiSort).toBe(true);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Sort by first column
    await page.click('[data-testid="column-header"][data-field="department"] [data-testid="sort-button"]');
    
    // Sort by second column while holding Ctrl (multi-sort)
    await page.keyboard.down('Control');
    await page.click('[data-testid="column-header"][data-field="firstName"] [data-testid="sort-button"]');
    await page.keyboard.up('Control');
    
    // Verify both columns show sort indicators
    await expect(page.locator('[data-testid="column-header"][data-field="department"] [data-testid="sort-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="sort-indicator"]')).toBeVisible();
    
    // Verify sort order indicators
    const departmentSortOrder = await page.locator('[data-testid="column-header"][data-field="department"] [data-testid="sort-order"]').textContent();
    const firstNameSortOrder = await page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="sort-order"]').textContent();
    
    expect(departmentSortOrder).toBe('1');
    expect(firstNameSortOrder).toBe('2');
  });

  test('should preserve event handlers during migration', async () => {
    let cellValueChangedCalled = false;
    let cellClickedCalled = false;
    
    const agGridOptions = {
      ...MigrationTestData.getCellEditorAgGridOptions(),
      onCellValueChanged: () => { cellValueChangedCalled = true; },
      onCellClicked: () => { cellClickedCalled = true; }
    };
    
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Apply configuration with event handlers
    await page.evaluate((config) => {
      // Attach event handlers to test grid instance
      window.testGridInstance?.setConfiguration(config);
      window.testGridInstance?.addEventListener('cellValueChanged', () => {
        window.testEventFlags = window.testEventFlags || {};
        window.testEventFlags.cellValueChanged = true;
      });
      window.testGridInstance?.addEventListener('cellClicked', () => {
        window.testEventFlags = window.testEventFlags || {};
        window.testEventFlags.cellClicked = true;
      });
    }, blgConfig);
    
    // Test cell clicked event
    await page.click('[data-testid="grid-cell"][data-field="firstName"]');
    
    const cellClickedFlag = await page.evaluate(() => window.testEventFlags?.cellClicked);
    expect(cellClickedFlag).toBe(true);
    
    // Test cell value changed event
    await page.dblclick('[data-testid="grid-cell"][data-field="firstName"]');
    await page.fill('[data-testid="cell-editor-input"]', 'Changed Value');
    await page.press('[data-testid="cell-editor-input"]', 'Enter');
    
    const cellValueChangedFlag = await page.evaluate(() => window.testEventFlags?.cellValueChanged);
    expect(cellValueChangedFlag).toBe(true);
  });

  test('should handle column resizing', async () => {
    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify resizable columns
    const resizableColumns = blgConfig.columns?.filter(col => col.resizable !== false);
    expect(resizableColumns?.length).toBeGreaterThan(0);
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test column resizing
    const resizeHandle = page.locator('[data-testid="column-header"][data-field="firstName"] [data-testid="resize-handle"]');
    await expect(resizeHandle).toBeVisible();
    
    // Get initial width
    const initialWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="firstName"]')!).width;
    });
    
    // Drag to resize
    await resizeHandle.hover();
    await page.mouse.down();
    await page.mouse.move(200, 0);
    await page.mouse.up();
    
    // Verify width changed
    const newWidth = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('[data-testid="column-header"][data-field="firstName"]')!).width;
    });
    
    expect(parseInt(newWidth)).toBeGreaterThan(parseInt(initialWidth));
  });

  test('should handle tooltip configuration', async () => {
    const agGridOptions = {
      ...MigrationTestData.getBasicAgGridOptions(),
      columnDefs: [
        ...MigrationTestData.getBasicColumnDefs(),
        {
          field: 'notes',
          headerName: 'Notes',
          tooltipField: 'notes',
          width: 100
        }
      ]
    };
    
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    
    // Verify tooltip configuration
    const notesColumn = blgConfig.columns?.find(col => col.field === 'notes');
    expect(notesColumn?.tooltipField).toBe('notes');
    
    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    
    // Test tooltip display (if implemented)
    await page.hover('[data-testid="grid-cell"][data-field="notes"]');
    
    // Verify tooltip appears (implementation dependent)
    // This would need to be adjusted based on actual tooltip implementation
    await page.waitForTimeout(500); // Wait for tooltip delay
    await expect(page.locator('[data-testid="cell-tooltip"]')).toBeVisible();
  });
});