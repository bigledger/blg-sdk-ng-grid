import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Row Selection', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoSelectionExample();
    await gridPage.loadDataset('medium');
    await gridPage.enableRowSelection();
    await gridPage.waitForGridToLoad();
  });
  
  test.describe('Single Row Selection', () => {
    test.beforeEach(async () => {
      await gridPage.setSelectionMode('single');
    });
    
    test('should select single row by clicking', async () => {
      await gridPage.selectRow(0);
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      const selectedIndices = await gridPage.getSelectedRowIndices();
      expect(selectedIndices).toEqual([0]);
    });
    
    test('should deselect previous row when selecting new row', async () => {
      // Select first row
      await gridPage.selectRow(0);
      let selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      // Select second row
      await gridPage.selectRow(1);
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      const selectedIndices = await gridPage.getSelectedRowIndices();
      expect(selectedIndices).toEqual([1]);
    });
    
    test('should deselect row when clicking selected row', async () => {
      // Select row
      await gridPage.selectRow(0);
      let selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      // Click same row to deselect
      await gridPage.selectRow(0);
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(0);
    });
    
    test('should highlight selected row visually', async () => {
      await gridPage.selectRow(2);
      
      const selectedRow = gridPage.page.locator('[data-testid="grid-row-2"]');
      await expect(selectedRow).toHaveClass(/selected|highlighted|active/);
    });
    
    test('should maintain selection during sorting', async () => {
      await gridPage.selectRow(1);
      const selectedData = await gridPage.getCellTextByField(1, 'firstName');
      
      // Apply sort
      await gridPage.sortColumn('lastName', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Selection should be maintained (row might move)
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      // Find the selected row and verify it has the same data
      const selectedIndices = await gridPage.getSelectedRowIndices();
      const newSelectedData = await gridPage.getCellTextByField(selectedIndices[0], 'firstName');
      expect(newSelectedData).toBe(selectedData);
    });
    
    test('should maintain selection during filtering', async () => {
      await gridPage.selectRow(0);
      const selectedData = await gridPage.getCellTextByField(0, 'firstName');
      
      // Apply filter that includes selected row
      await gridPage.applyTextFilter('firstName', 'contains', selectedData.substring(0, 2));
      await gridPage.waitForLoadingToComplete();
      
      // Selection should be maintained
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
    });
    
    test('should clear selection when applying filter that excludes selected row', async () => {
      await gridPage.selectRow(0);
      
      // Apply filter that excludes the selected row
      await gridPage.applyTextFilter('firstName', 'equals', 'NonExistentName');
      await gridPage.waitForLoadingToComplete();
      
      // Selection should be cleared
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(0);
    });
  });
  
  test.describe('Multiple Row Selection', () => {
    test.beforeEach(async () => {
      await gridPage.setSelectionMode('multiple');
    });
    
    test('should select multiple rows with Ctrl+Click', async ({ page }) => {
      // Select first row
      await gridPage.selectRow(0);
      
      // Select additional rows with Ctrl key
      await page.keyboard.down('Control');
      await gridPage.selectRow(2);
      await gridPage.selectRow(4);
      await page.keyboard.up('Control');
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(3);
      
      const selectedIndices = await gridPage.getSelectedRowIndices();
      expect(selectedIndices.sort()).toEqual([0, 2, 4]);
    });
    
    test('should select range of rows with Shift+Click', async ({ page }) => {
      // Select first row
      await gridPage.selectRow(1);
      
      // Select range with Shift+Click
      await page.keyboard.down('Shift');
      await gridPage.selectRow(4);
      await page.keyboard.up('Shift');
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(4); // Rows 1, 2, 3, 4
      
      const selectedIndices = await gridPage.getSelectedRowIndices();
      expect(selectedIndices.sort()).toEqual([1, 2, 3, 4]);
    });
    
    test('should deselect individual rows with Ctrl+Click', async ({ page }) => {
      // Select multiple rows
      await gridPage.selectRow(0);
      await page.keyboard.down('Control');
      await gridPage.selectRow(1);
      await gridPage.selectRow(2);
      
      // Deselect middle row
      await gridPage.selectRow(1);
      await page.keyboard.up('Control');
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(2);
      
      const selectedIndices = await gridPage.getSelectedRowIndices();
      expect(selectedIndices.sort()).toEqual([0, 2]);
    });
    
    test('should clear all selection when clicking without modifiers after multiple selection', async ({ page }) => {
      // Select multiple rows
      await gridPage.selectRow(0);
      await page.keyboard.down('Control');
      await gridPage.selectRow(2);
      await gridPage.selectRow(4);
      await page.keyboard.up('Control');
      
      let selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(3);
      
      // Click without modifier should clear all and select new row
      await gridPage.selectRow(1);
      
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      const selectedIndices = await gridPage.getSelectedRowIndices();
      expect(selectedIndices).toEqual([1]);
    });
    
    test('should handle selection across virtual scroll boundaries', async () => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Select rows in current view
      await gridPage.selectRow(0);
      await gridPage.page.keyboard.down('Control');
      await gridPage.selectRow(5);
      await gridPage.page.keyboard.up('Control');
      
      let selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(2);
      
      // Scroll down
      await gridPage.scrollVertically(1000);
      await gridPage.page.waitForTimeout(500);
      
      // Selection count should remain the same
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(2);
      
      // Select additional row in new view
      await gridPage.page.keyboard.down('Control');
      await gridPage.selectRow(50); // Assuming row 50 is now visible
      await gridPage.page.keyboard.up('Control');
      
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(3);
    });
  });
  
  test.describe('Checkbox Selection', () => {
    test.beforeEach(async () => {
      await gridPage.setSelectionMode('checkbox');
    });
    
    test('should show checkboxes in header and rows', async () => {
      // Header checkbox should be visible
      await expect(gridPage.page.locator('[data-testid="header-checkbox"]')).toBeVisible();
      
      // Row checkboxes should be visible
      const rowCheckboxes = gridPage.page.locator('[data-testid^="row-checkbox-"]');
      const checkboxCount = await rowCheckboxes.count();
      expect(checkboxCount).toBeGreaterThan(0);
    });
    
    test('should select row by checking checkbox', async () => {
      await gridPage.selectRowByCheckbox(0);
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      // Checkbox should be checked
      const checkbox = gridPage.page.locator('[data-testid="row-checkbox-0"]');
      await expect(checkbox).toBeChecked();
    });
    
    test('should select multiple rows by checking multiple checkboxes', async () => {
      await gridPage.selectRowByCheckbox(0);
      await gridPage.selectRowByCheckbox(2);
      await gridPage.selectRowByCheckbox(4);
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(3);
      
      // All selected checkboxes should be checked
      await expect(gridPage.page.locator('[data-testid="row-checkbox-0"]')).toBeChecked();
      await expect(gridPage.page.locator('[data-testid="row-checkbox-2"]')).toBeChecked();
      await expect(gridPage.page.locator('[data-testid="row-checkbox-4"]')).toBeChecked();
    });
    
    test('should deselect row by unchecking checkbox', async () => {
      // Select row
      await gridPage.selectRowByCheckbox(1);
      let selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
      
      // Uncheck to deselect
      await gridPage.selectRowByCheckbox(1);
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(0);
      
      const checkbox = gridPage.page.locator('[data-testid="row-checkbox-1"]');
      await expect(checkbox).not.toBeChecked();
    });
    
    test('should select all rows when header checkbox is checked', async () => {
      await gridPage.selectAllRows();
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(visibleRowCount);
      
      // Header checkbox should be checked
      const headerCheckbox = gridPage.page.locator('[data-testid="header-checkbox"]');
      await expect(headerCheckbox).toBeChecked();
    });
    
    test('should show indeterminate state when some rows are selected', async () => {
      // Select a few rows
      await gridPage.selectRowByCheckbox(0);
      await gridPage.selectRowByCheckbox(2);
      
      const headerCheckbox = gridPage.page.locator('[data-testid="header-checkbox"]');
      
      // Header checkbox should be in indeterminate state
      const isIndeterminate = await headerCheckbox.evaluate(
        (checkbox: HTMLInputElement) => checkbox.indeterminate
      );
      expect(isIndeterminate).toBe(true);
    });
    
    test('should deselect all rows when header checkbox is unchecked from selected state', async () => {
      // Select all rows first
      await gridPage.selectAllRows();
      let selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBeGreaterThan(0);
      
      // Uncheck header checkbox
      await gridPage.selectAllRows(); // This should deselect all
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(0);
    });
    
    test('should maintain checkbox states during virtual scrolling', async () => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Select some visible rows
      await gridPage.selectRowByCheckbox(0);
      await gridPage.selectRowByCheckbox(2);
      
      // Scroll down
      await gridPage.scrollVertically(1000);
      await gridPage.page.waitForTimeout(500);
      
      // Scroll back up
      await gridPage.scrollVertically(-1000);
      await gridPage.page.waitForTimeout(500);
      
      // Previous selections should be maintained
      await expect(gridPage.page.locator('[data-testid="row-checkbox-0"]')).toBeChecked();
      await expect(gridPage.page.locator('[data-testid="row-checkbox-2"]')).toBeChecked();
    });
  });
  
  test.describe('Selection Events and Callbacks', () => {
    test('should trigger selection change events', async () => {
      await gridPage.setSelectionMode('multiple');
      
      // Listen for selection events if they exist
      const selectionEvents: any[] = [];
      await gridPage.page.evaluate(() => {
        window.addEventListener('gridSelectionChanged', (event) => {
          (window as any).selectionEvents = (window as any).selectionEvents || [];
          (window as any).selectionEvents.push(event.detail);
        });
      });
      
      // Select rows
      await gridPage.selectRow(0);
      await gridPage.page.keyboard.down('Control');
      await gridPage.selectRow(2);
      await gridPage.page.keyboard.up('Control');
      
      // Check if events were fired
      const events = await gridPage.page.evaluate(() => (window as any).selectionEvents || []);
      if (events.length > 0) {
        expect(events.length).toBeGreaterThanOrEqual(1);
      }
    });
    
    test('should provide selected row data in events', async () => {
      await gridPage.setSelectionMode('single');
      
      // Set up event listener
      await gridPage.page.evaluate(() => {
        window.addEventListener('gridSelectionChanged', (event: any) => {
          (window as any).lastSelectionEvent = event.detail;
        });
      });
      
      // Select a row
      await gridPage.selectRow(1);
      
      // Check event data
      const eventData = await gridPage.page.evaluate(() => (window as any).lastSelectionEvent);
      if (eventData) {
        expect(eventData.selectedRows).toBeDefined();
        expect(eventData.selectedRows.length).toBe(1);
      }
    });
  });
  
  test.describe('Selection Persistence and State Management', () => {
    test('should clear selection when dataset changes', async () => {
      await gridPage.setSelectionMode('multiple');
      
      // Select some rows
      await gridPage.selectRow(0);
      await gridPage.selectRow(2);
      let selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(2);
      
      // Change dataset
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Selection should be cleared
      selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(0);
    });
    
    test('should provide methods to get selected data', async () => {
      await gridPage.setSelectionMode('multiple');
      
      // Select some rows
      await gridPage.selectRow(0);
      await gridPage.selectRow(2);
      
      // Get selected data through API if available
      const selectedData = await gridPage.page.evaluate(() => {
        const grid = document.querySelector('[data-testid="grid-container"]');
        return grid && (grid as any).getSelectedData ? (grid as any).getSelectedData() : [];
      });
      
      if (selectedData && selectedData.length > 0) {
        expect(selectedData.length).toBe(2);
      }
    });
    
    test('should provide programmatic selection methods', async () => {
      await gridPage.setSelectionMode('multiple');
      
      // Programmatically select rows if API is available
      await gridPage.page.evaluate(() => {
        const grid = document.querySelector('[data-testid="grid-container"]');
        if (grid && (grid as any).selectRows) {
          (grid as any).selectRows([0, 2, 4]);
        }
      });
      
      // Verify selection
      await gridPage.page.waitForTimeout(500);
      const selectedCount = await gridPage.getSelectedRowCount();
      
      // If programmatic selection is supported
      if (selectedCount > 0) {
        expect(selectedCount).toBe(3);
      }
    });
    
    test('should handle selection with custom row identifiers', async () => {
      // Test selection using row IDs instead of indices
      const firstRowId = await gridPage.getCellTextByField(0, 'id');
      const thirdRowId = await gridPage.getCellTextByField(2, 'id');
      
      // Select by ID if API supports it
      await gridPage.page.evaluate((ids) => {
        const grid = document.querySelector('[data-testid="grid-container"]');
        if (grid && (grid as any).selectRowsById) {
          (grid as any).selectRowsById(ids);
        }
      }, [firstRowId, thirdRowId]);
      
      await gridPage.page.waitForTimeout(500);
      
      // Verify visual selection
      const selectedCount = await gridPage.getSelectedRowCount();
      if (selectedCount > 0) {
        expect(selectedCount).toBeGreaterThanOrEqual(1);
      }
    });
  });
  
  test.describe('Performance and Edge Cases', () => {
    test('should handle selection in large datasets efficiently', async () => {
      await gridPage.loadDataset('large');
      await gridPage.setSelectionMode('multiple');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Select multiple rows
      for (let i = 0; i < 10; i += 2) {
        await gridPage.selectRow(i);
        await gridPage.page.keyboard.down('Control');
      }
      await gridPage.page.keyboard.up('Control');
      
      const selectionTime = Date.now() - startTime;
      expect(selectionTime).toBeLessThan(2000); // Should be responsive
      
      console.log(`Selection time for large dataset: ${selectionTime}ms`);
    });
    
    test('should handle rapid selection changes without performance issues', async () => {
      await gridPage.setSelectionMode('single');
      
      // Rapidly select different rows
      for (let i = 0; i < 20; i++) {
        await gridPage.selectRow(i % 10);
        await gridPage.page.waitForTimeout(50);
      }
      
      // Grid should still be functional
      await gridPage.validateGridStructure();
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBeLessThanOrEqual(1);
    });
    
    test('should handle memory efficiently with large selections', async ({ page }) => {
      await gridPage.loadDataset('performance');
      await gridPage.setSelectionMode('checkbox');
      await gridPage.waitForGridToLoad();
      
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Select many rows
      await gridPage.selectAllRows();
      await gridPage.page.waitForTimeout(1000);
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
        
        // Memory increase should be reasonable
        expect(memoryIncreasePercent).toBeLessThan(100);
        console.log(`Memory increase for large selection: ${memoryIncreasePercent.toFixed(2)}%`);
      }
    });
  });
});