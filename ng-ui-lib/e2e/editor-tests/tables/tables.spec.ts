import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Table Features', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Table Creation', () => {
    test('should create table with insert button', async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      
      await editor.waitForContentUpdate();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<table>');
      expect(htmlContent).toContain('<tr>');
      expect(htmlContent).toContain('<td>');
      
      // Should have 3 rows and 3 columns
      const rows = editor.page.locator('table tr');
      const rowCount = await rows.count();
      expect(rowCount).toBe(3);
      
      const cells = editor.page.locator('table td');
      const cellCount = await cells.count();
      expect(cellCount).toBe(9); // 3x3
    });

    test('should create table with custom dimensions', async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-5x4"]');
      await insertTableButton.click();
      
      await editor.waitForContentUpdate();
      
      const rows = editor.page.locator('table tr');
      const rowCount = await rows.count();
      expect(rowCount).toBe(4);
      
      const cells = editor.page.locator('table td');
      const cellCount = await cells.count();
      expect(cellCount).toBe(20); // 5x4
    });

    test('should create table with headers', async () => {
      await editor.page.click('[data-testid="insert-table"]');
      
      const tableDialog = editor.page.locator('[data-testid="table-dialog"]');
      await expect(tableDialog).toBeVisible();
      
      // Set dimensions
      await editor.page.fill('[data-testid="table-rows-input"]', '3');
      await editor.page.fill('[data-testid="table-cols-input"]', '4');
      
      // Enable header row
      await editor.page.check('[data-testid="table-header-row-checkbox"]');
      
      await editor.page.click('[data-testid="table-dialog-create"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<thead>');
      expect(htmlContent).toContain('<th>');
      expect(htmlContent).toContain('<tbody>');
    });

    test('should position cursor in first cell after creation', async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      
      await editor.waitForContentUpdate();
      
      // First cell should be focused
      const firstCell = editor.page.locator('table td').first();
      const isFirstCellFocused = await firstCell.evaluate(cell => {
        const selection = window.getSelection();
        return selection?.focusNode?.parentElement === cell || 
               selection?.focusNode?.parentElement?.parentElement === cell;
      });
      
      expect(isFirstCellFocused).toBe(true);
    });

    test('should create table with proper styling', async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      
      await editor.waitForContentUpdate();
      
      const table = editor.page.locator('table').first();
      
      // Check table styling
      const tableBorder = await table.evaluate(el => 
        window.getComputedStyle(el).border
      );
      expect(tableBorder).toBeTruthy();
      
      // Check cell styling
      const firstCell = editor.page.locator('table td').first();
      const cellBorder = await firstCell.evaluate(el => 
        window.getComputedStyle(el).border
      );
      expect(cellBorder).toBeTruthy();
    });
  });

  test.describe('Table Editing', () => {
    test.beforeEach(async () => {
      // Create a 3x3 table for each test
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should edit cell content', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      const testText = 'Cell content test';
      await editor.page.keyboard.type(testText);
      
      const cellContent = await firstCell.textContent();
      expect(cellContent).toContain(testText);
    });

    test('should navigate between cells with Tab', async () => {
      const cells = editor.page.locator('table td');
      
      // Click first cell
      await cells.first().click();
      await editor.page.keyboard.type('Cell 1');
      
      // Tab to next cell
      await editor.page.keyboard.press('Tab');
      await editor.page.keyboard.type('Cell 2');
      
      // Tab to next cell
      await editor.page.keyboard.press('Tab');
      await editor.page.keyboard.type('Cell 3');
      
      // Verify content
      const cell1Content = await cells.first().textContent();
      const cell2Content = await cells.nth(1).textContent();
      const cell3Content = await cells.nth(2).textContent();
      
      expect(cell1Content).toContain('Cell 1');
      expect(cell2Content).toContain('Cell 2');
      expect(cell3Content).toContain('Cell 3');
    });

    test('should navigate between cells with Shift+Tab', async () => {
      const cells = editor.page.locator('table td');
      
      // Start from third cell
      await cells.nth(2).click();
      await editor.page.keyboard.type('Cell 3');
      
      // Shift+Tab to previous cell
      await editor.page.keyboard.press('Shift+Tab');
      await editor.page.keyboard.type('Cell 2');
      
      // Shift+Tab to first cell
      await editor.page.keyboard.press('Shift+Tab');
      await editor.page.keyboard.type('Cell 1');
      
      const cell1Content = await cells.first().textContent();
      const cell2Content = await cells.nth(1).textContent();
      const cell3Content = await cells.nth(2).textContent();
      
      expect(cell1Content).toContain('Cell 1');
      expect(cell2Content).toContain('Cell 2');
      expect(cell3Content).toContain('Cell 3');
    });

    test('should navigate between cells with arrow keys', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      // Right arrow should move to next cell in row
      await editor.page.keyboard.press('ArrowRight');
      await editor.page.keyboard.type('Right cell');
      
      // Down arrow should move to cell below
      await editor.page.keyboard.press('ArrowDown');
      await editor.page.keyboard.type('Down cell');
      
      // Left arrow should move to previous cell in row
      await editor.page.keyboard.press('ArrowLeft');
      await editor.page.keyboard.type('Left cell');
      
      // Up arrow should move to cell above
      await editor.page.keyboard.press('ArrowUp');
      await editor.page.keyboard.type('Up cell');
      
      const cells = editor.page.locator('table td');
      const cell1 = await cells.nth(1).textContent(); // Right from first
      const cell4 = await cells.nth(4).textContent(); // Down from cell 2
      const cell3 = await cells.nth(3).textContent(); // Left from cell 5
      const cell0 = await cells.nth(0).textContent(); // Up from cell 4
      
      expect(cell1).toContain('Right cell');
      expect(cell4).toContain('Down cell');
      expect(cell3).toContain('Left cell');
      expect(cell0).toContain('Up cell');
    });

    test('should format text within cells', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      await editor.page.keyboard.type('Bold text');
      await editor.page.keyboard.press('Control+a');
      await editor.toggleBold();
      
      const cellHtml = await firstCell.innerHTML();
      expect(cellHtml).toMatch(/<(strong|b)>.*Bold text.*<\/(strong|b)>/);
    });

    test('should support multi-line content in cells', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      await editor.page.keyboard.type('Line 1');
      await editor.page.keyboard.press('Shift+Enter');
      await editor.page.keyboard.type('Line 2');
      await editor.page.keyboard.press('Shift+Enter');
      await editor.page.keyboard.type('Line 3');
      
      const cellContent = await firstCell.textContent();
      expect(cellContent).toContain('Line 1');
      expect(cellContent).toContain('Line 2');
      expect(cellContent).toContain('Line 3');
    });
  });

  test.describe('Cell Selection', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should select single cell', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      // Cell should have selection styling
      const cellClass = await firstCell.getAttribute('class');
      expect(cellClass).toMatch(/selected|active/);
    });

    test('should select multiple cells by dragging', async () => {
      const firstCell = editor.page.locator('table td').first();
      const thirdCell = editor.page.locator('table td').nth(2);
      
      const firstCellBox = await firstCell.boundingBox();
      const thirdCellBox = await thirdCell.boundingBox();
      
      expect(firstCellBox).not.toBeNull();
      expect(thirdCellBox).not.toBeNull();
      
      if (firstCellBox && thirdCellBox) {
        // Drag from first cell to third cell
        await editor.page.mouse.move(
          firstCellBox.x + firstCellBox.width / 2,
          firstCellBox.y + firstCellBox.height / 2
        );
        await editor.page.mouse.down();
        
        await editor.page.mouse.move(
          thirdCellBox.x + thirdCellBox.width / 2,
          thirdCellBox.y + thirdCellBox.height / 2
        );
        await editor.page.mouse.up();
        
        // Multiple cells should be selected
        const selectedCells = editor.page.locator('table td.selected, table td.active');
        const selectedCount = await selectedCells.count();
        expect(selectedCount).toBeGreaterThan(1);
      }
    });

    test('should select entire row', async () => {
      const table = editor.page.locator('table').first();
      await table.hover();
      
      // Row selector should appear on hover
      const rowSelector = editor.page.locator('[data-testid="table-row-selector"]').first();
      if (await rowSelector.isVisible()) {
        await rowSelector.click();
        
        // All cells in first row should be selected
        const firstRowCells = editor.page.locator('table tr:first-child td');
        const cellCount = await firstRowCells.count();
        
        const selectedCells = editor.page.locator('table td.selected, table td.active');
        const selectedCount = await selectedCells.count();
        
        expect(selectedCount).toBe(cellCount);
      }
    });

    test('should select entire column', async () => {
      const table = editor.page.locator('table').first();
      await table.hover();
      
      const columnSelector = editor.page.locator('[data-testid="table-column-selector"]').first();
      if (await columnSelector.isVisible()) {
        await columnSelector.click();
        
        // All cells in first column should be selected
        const firstColumnCells = editor.page.locator('table tr td:first-child');
        const cellCount = await firstColumnCells.count();
        
        const selectedCells = editor.page.locator('table td.selected, table td.active');
        const selectedCount = await selectedCells.count();
        
        expect(selectedCount).toBe(cellCount);
      }
    });

    test('should extend selection with Shift+Click', async () => {
      const firstCell = editor.page.locator('table td').first();
      const fifthCell = editor.page.locator('table td').nth(4);
      
      // Click first cell
      await firstCell.click();
      
      // Shift+click fifth cell to extend selection
      await fifthCell.click({ modifiers: ['Shift'] });
      
      // Multiple cells should be selected
      const selectedCells = editor.page.locator('table td.selected, table td.active');
      const selectedCount = await selectedCells.count();
      expect(selectedCount).toBeGreaterThan(1);
    });
  });

  test.describe('Row Operations', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should insert row above', async () => {
      const secondRowFirstCell = editor.page.locator('table tr:nth-child(2) td:first-child');
      await secondRowFirstCell.click();
      
      // Right-click to open context menu
      await secondRowFirstCell.click({ button: 'right' });
      
      const insertRowAboveOption = editor.page.locator('[data-testid="table-insert-row-above"]');
      if (await insertRowAboveOption.isVisible()) {
        await insertRowAboveOption.click();
        
        const rows = editor.page.locator('table tr');
        const rowCount = await rows.count();
        expect(rowCount).toBe(4); // Was 3, now 4
      }
    });

    test('should insert row below', async () => {
      const secondRowFirstCell = editor.page.locator('table tr:nth-child(2) td:first-child');
      await secondRowFirstCell.click();
      
      await secondRowFirstCell.click({ button: 'right' });
      
      const insertRowBelowOption = editor.page.locator('[data-testid="table-insert-row-below"]');
      if (await insertRowBelowOption.isVisible()) {
        await insertRowBelowOption.click();
        
        const rows = editor.page.locator('table tr');
        const rowCount = await rows.count();
        expect(rowCount).toBe(4);
      }
    });

    test('should delete row', async () => {
      const secondRowFirstCell = editor.page.locator('table tr:nth-child(2) td:first-child');
      await secondRowFirstCell.click();
      
      await secondRowFirstCell.click({ button: 'right' });
      
      const deleteRowOption = editor.page.locator('[data-testid="table-delete-row"]');
      if (await deleteRowOption.isVisible()) {
        await deleteRowOption.click();
        
        const rows = editor.page.locator('table tr');
        const rowCount = await rows.count();
        expect(rowCount).toBe(2); // Was 3, now 2
      }
    });

    test('should not delete last row', async () => {
      // Delete rows until only one remains
      for (let i = 0; i < 2; i++) {
        const firstRowFirstCell = editor.page.locator('table tr:first-child td:first-child');
        await firstRowFirstCell.click();
        await firstRowFirstCell.click({ button: 'right' });
        
        const deleteRowOption = editor.page.locator('[data-testid="table-delete-row"]');
        if (await deleteRowOption.isVisible()) {
          await deleteRowOption.click();
        }
      }
      
      const rows = editor.page.locator('table tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1); // Should keep at least one row
    });

    test('should duplicate row', async () => {
      const firstRowFirstCell = editor.page.locator('table tr:first-child td:first-child');
      await firstRowFirstCell.click();
      
      // Add content to first row
      await editor.page.keyboard.type('Test content');
      
      await firstRowFirstCell.click({ button: 'right' });
      
      const duplicateRowOption = editor.page.locator('[data-testid="table-duplicate-row"]');
      if (await duplicateRowOption.isVisible()) {
        await duplicateRowOption.click();
        
        const rows = editor.page.locator('table tr');
        const rowCount = await rows.count();
        expect(rowCount).toBe(4); // Was 3, now 4
        
        // Duplicated row should have same content
        const secondRowFirstCell = editor.page.locator('table tr:nth-child(2) td:first-child');
        const content = await secondRowFirstCell.textContent();
        expect(content).toContain('Test content');
      }
    });
  });

  test.describe('Column Operations', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should insert column left', async () => {
      const secondColumnFirstCell = editor.page.locator('table tr:first-child td:nth-child(2)');
      await secondColumnFirstCell.click();
      
      await secondColumnFirstCell.click({ button: 'right' });
      
      const insertColumnLeftOption = editor.page.locator('[data-testid="table-insert-column-left"]');
      if (await insertColumnLeftOption.isVisible()) {
        await insertColumnLeftOption.click();
        
        const firstRowCells = editor.page.locator('table tr:first-child td');
        const cellCount = await firstRowCells.count();
        expect(cellCount).toBe(4); // Was 3, now 4
      }
    });

    test('should insert column right', async () => {
      const secondColumnFirstCell = editor.page.locator('table tr:first-child td:nth-child(2)');
      await secondColumnFirstCell.click();
      
      await secondColumnFirstCell.click({ button: 'right' });
      
      const insertColumnRightOption = editor.page.locator('[data-testid="table-insert-column-right"]');
      if (await insertColumnRightOption.isVisible()) {
        await insertColumnRightOption.click();
        
        const firstRowCells = editor.page.locator('table tr:first-child td');
        const cellCount = await firstRowCells.count();
        expect(cellCount).toBe(4);
      }
    });

    test('should delete column', async () => {
      const secondColumnFirstCell = editor.page.locator('table tr:first-child td:nth-child(2)');
      await secondColumnFirstCell.click();
      
      await secondColumnFirstCell.click({ button: 'right' });
      
      const deleteColumnOption = editor.page.locator('[data-testid="table-delete-column"]');
      if (await deleteColumnOption.isVisible()) {
        await deleteColumnOption.click();
        
        const firstRowCells = editor.page.locator('table tr:first-child td');
        const cellCount = await firstRowCells.count();
        expect(cellCount).toBe(2); // Was 3, now 2
      }
    });

    test('should not delete last column', async () => {
      // Delete columns until only one remains
      for (let i = 0; i < 2; i++) {
        const firstColumnFirstCell = editor.page.locator('table tr:first-child td:first-child');
        await firstColumnFirstCell.click();
        await firstColumnFirstCell.click({ button: 'right' });
        
        const deleteColumnOption = editor.page.locator('[data-testid="table-delete-column"]');
        if (await deleteColumnOption.isVisible()) {
          await deleteColumnOption.click();
        }
      }
      
      const firstRowCells = editor.page.locator('table tr:first-child td');
      const cellCount = await firstRowCells.count();
      expect(cellCount).toBeGreaterThanOrEqual(1); // Should keep at least one column
    });
  });

  test.describe('Cell Merging and Splitting', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should merge cells horizontally', async () => {
      const firstCell = editor.page.locator('table tr:first-child td:first-child');
      const secondCell = editor.page.locator('table tr:first-child td:nth-child(2)');
      
      // Select first cell
      await firstCell.click();
      
      // Shift+click second cell to select both
      await secondCell.click({ modifiers: ['Shift'] });
      
      // Right-click to open context menu
      await secondCell.click({ button: 'right' });
      
      const mergeCellsOption = editor.page.locator('[data-testid="table-merge-cells"]');
      if (await mergeCellsOption.isVisible()) {
        await mergeCellsOption.click();
        
        // First cell should have colspan="2"
        const colspan = await firstCell.getAttribute('colspan');
        expect(colspan).toBe('2');
        
        // Second cell should be removed
        const firstRowCells = editor.page.locator('table tr:first-child td');
        const cellCount = await firstRowCells.count();
        expect(cellCount).toBe(2); // Was 3, now 2 (one merged)
      }
    });

    test('should merge cells vertically', async () => {
      const topCell = editor.page.locator('table tr:first-child td:first-child');
      const bottomCell = editor.page.locator('table tr:nth-child(2) td:first-child');
      
      await topCell.click();
      await bottomCell.click({ modifiers: ['Shift'] });
      
      await bottomCell.click({ button: 'right' });
      
      const mergeCellsOption = editor.page.locator('[data-testid="table-merge-cells"]');
      if (await mergeCellsOption.isVisible()) {
        await mergeCellsOption.click();
        
        // First cell should have rowspan="2"
        const rowspan = await topCell.getAttribute('rowspan');
        expect(rowspan).toBe('2');
      }
    });

    test('should split merged cells', async () => {
      // First merge two cells
      const firstCell = editor.page.locator('table tr:first-child td:first-child');
      const secondCell = editor.page.locator('table tr:first-child td:nth-child(2)');
      
      await firstCell.click();
      await secondCell.click({ modifiers: ['Shift'] });
      await secondCell.click({ button: 'right' });
      
      const mergeCellsOption = editor.page.locator('[data-testid="table-merge-cells"]');
      if (await mergeCellsOption.isVisible()) {
        await mergeCellsOption.click();
        
        // Now split the merged cell
        await firstCell.click();
        await firstCell.click({ button: 'right' });
        
        const splitCellsOption = editor.page.locator('[data-testid="table-split-cells"]');
        if (await splitCellsOption.isVisible()) {
          await splitCellsOption.click();
          
          // Should be back to 3 cells in first row
          const firstRowCells = editor.page.locator('table tr:first-child td');
          const cellCount = await firstRowCells.count();
          expect(cellCount).toBe(3);
        }
      }
    });
  });

  test.describe('Table Properties', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should open table properties dialog', async () => {
      const table = editor.page.locator('table').first();
      await table.click({ button: 'right' });
      
      const propertiesOption = editor.page.locator('[data-testid="table-properties"]');
      if (await propertiesOption.isVisible()) {
        await propertiesOption.click();
        
        const propertiesDialog = editor.page.locator('[data-testid="table-properties-dialog"]');
        await expect(propertiesDialog).toBeVisible();
      }
    });

    test('should modify table width', async () => {
      const table = editor.page.locator('table').first();
      await table.click({ button: 'right' });
      
      const propertiesOption = editor.page.locator('[data-testid="table-properties"]');
      if (await propertiesOption.isVisible()) {
        await propertiesOption.click();
        
        const widthInput = editor.page.locator('[data-testid="table-width-input"]');
        await widthInput.fill('500');
        
        const applyButton = editor.page.locator('[data-testid="table-properties-apply"]');
        await applyButton.click();
        
        const tableWidth = await table.evaluate(el => 
          window.getComputedStyle(el).width
        );
        expect(parseInt(tableWidth)).toBe(500);
      }
    });

    test('should modify table border', async () => {
      const table = editor.page.locator('table').first();
      await table.click({ button: 'right' });
      
      const propertiesOption = editor.page.locator('[data-testid="table-properties"]');
      if (await propertiesOption.isVisible()) {
        await propertiesOption.click();
        
        const borderInput = editor.page.locator('[data-testid="table-border-input"]');
        await borderInput.fill('3');
        
        const applyButton = editor.page.locator('[data-testid="table-properties-apply"]');
        await applyButton.click();
        
        const border = await table.getAttribute('border');
        expect(border).toBe('3');
      }
    });

    test('should set table background color', async () => {
      const table = editor.page.locator('table').first();
      await table.click({ button: 'right' });
      
      const propertiesOption = editor.page.locator('[data-testid="table-properties"]');
      if (await propertiesOption.isVisible()) {
        await propertiesOption.click();
        
        const backgroundColorPicker = editor.page.locator('[data-testid="table-background-color"]');
        await backgroundColorPicker.click();
        
        const yellowOption = editor.page.locator('[data-testid="color-option-yellow"]');
        await yellowOption.click();
        
        const applyButton = editor.page.locator('[data-testid="table-properties-apply"]');
        await applyButton.click();
        
        const backgroundColor = await table.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        expect(backgroundColor).toMatch(/yellow|rgb\(255,\s*255,\s*0\)/);
      }
    });
  });

  test.describe('Copy and Paste Table Data', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should copy and paste cell content', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      const testContent = 'Test cell content';
      await editor.page.keyboard.type(testContent);
      
      // Select all content in cell
      await editor.page.keyboard.press('Control+a');
      await editor.copyText();
      
      // Move to another cell and paste
      const secondCell = editor.page.locator('table td').nth(1);
      await secondCell.click();
      await editor.pasteText();
      
      const secondCellContent = await secondCell.textContent();
      expect(secondCellContent).toContain(testContent);
    });

    test('should copy and paste multiple cells', async () => {
      // Fill first two cells
      const cells = editor.page.locator('table td');
      await cells.first().click();
      await editor.page.keyboard.type('Cell 1');
      
      await cells.nth(1).click();
      await editor.page.keyboard.type('Cell 2');
      
      // Select both cells (if drag selection works)
      const firstCellBox = await cells.first().boundingBox();
      const secondCellBox = await cells.nth(1).boundingBox();
      
      if (firstCellBox && secondCellBox) {
        await editor.page.mouse.move(
          firstCellBox.x + firstCellBox.width / 2,
          firstCellBox.y + firstCellBox.height / 2
        );
        await editor.page.mouse.down();
        
        await editor.page.mouse.move(
          secondCellBox.x + secondCellBox.width / 2,
          secondCellBox.y + secondCellBox.height / 2
        );
        await editor.page.mouse.up();
        
        // Copy selection
        await editor.copyText();
        
        // Paste in another location
        await cells.nth(3).click();
        await editor.pasteText();
        
        const thirdCellContent = await cells.nth(3).textContent();
        const fourthCellContent = await cells.nth(4).textContent();
        
        expect(thirdCellContent).toContain('Cell 1');
        expect(fourthCellContent).toContain('Cell 2');
      }
    });

    test('should paste tabular data from clipboard', async ({ context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      // Set clipboard with TSV data
      const tsvData = 'A1\\tB1\\tC1\\nA2\\tB2\\tC2\\nA3\\tB3\\tC3';
      await editor.page.evaluate((data) => {
        navigator.clipboard.writeText(data);
      }, tsvData);
      
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      await editor.pasteText();
      
      // Verify data was pasted correctly
      const cells = editor.page.locator('table td');
      
      const cell1Content = await cells.first().textContent();
      const cell2Content = await cells.nth(1).textContent();
      const cell3Content = await cells.nth(2).textContent();
      
      expect(cell1Content).toContain('A1');
      expect(cell2Content).toContain('B1');
      expect(cell3Content).toContain('C1');
    });
  });

  test.describe('CSV Import and Export', () => {
    test('should import CSV data', async () => {
      const importButton = editor.page.locator('[data-testid="import-csv-data"]');
      await importButton.click();
      
      const csvDialog = editor.page.locator('[data-testid="csv-import-dialog"]');
      if (await csvDialog.isVisible()) {
        const csvData = 'Name,Age,City\\nJohn,25,New York\\nJane,30,Los Angeles\\nBob,35,Chicago';
        
        const csvTextarea = editor.page.locator('[data-testid="csv-import-textarea"]');
        await csvTextarea.fill(csvData);
        
        const importCsvButton = editor.page.locator('[data-testid="csv-import-button"]');
        await importCsvButton.click();
        
        // Should create a table with the CSV data
        const table = editor.page.locator('table');
        await expect(table).toBeVisible();
        
        const cells = editor.page.locator('table td');
        const firstCellContent = await cells.first().textContent();
        expect(firstCellContent).toContain('Name');
      }
    });

    test('should export table as CSV', async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      // Fill table with data
      const cells = editor.page.locator('table td');
      await cells.first().click();
      await editor.page.keyboard.type('Name');
      
      await cells.nth(1).click();
      await editor.page.keyboard.type('Age');
      
      await cells.nth(2).click();
      await editor.page.keyboard.type('City');
      
      // Right-click on table
      const table = editor.page.locator('table').first();
      await table.click({ button: 'right' });
      
      const exportOption = editor.page.locator('[data-testid="table-export-csv"]');
      if (await exportOption.isVisible()) {
        // Mock download to capture CSV content
        const [download] = await Promise.all([
          editor.page.waitForEvent('download'),
          exportOption.click()
        ]);
        
        expect(download.suggestedFilename()).toContain('.csv');
      }
    });

    test('should handle CSV with special characters', async () => {
      const importButton = editor.page.locator('[data-testid="import-csv-data"]');
      await importButton.click();
      
      const csvDialog = editor.page.locator('[data-testid="csv-import-dialog"]');
      if (await csvDialog.isVisible()) {
        const csvData = '"Name with, comma","Age","Description with \\"quotes\\""\\n"John, Jr.",25,"A \\"special\\" person"';
        
        const csvTextarea = editor.page.locator('[data-testid="csv-import-textarea"]');
        await csvTextarea.fill(csvData);
        
        const importCsvButton = editor.page.locator('[data-testid="csv-import-button"]');
        await importCsvButton.click();
        
        const cells = editor.page.locator('table td');
        const firstCellContent = await cells.first().textContent();
        expect(firstCellContent).toContain('Name with, comma');
        
        const thirdCellContent = await cells.nth(2).textContent();
        expect(thirdCellContent).toContain('Description with "quotes"');
      }
    });
  });

  test.describe('Table Resize and Column Width', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should resize column by dragging border', async () => {
      const table = editor.page.locator('table').first();
      await table.hover();
      
      // Look for column resize handles
      const resizeHandle = editor.page.locator('[data-testid="column-resize-handle"]').first();
      
      if (await resizeHandle.isVisible()) {
        const handleBox = await resizeHandle.boundingBox();
        expect(handleBox).not.toBeNull();
        
        if (handleBox) {
          // Drag resize handle
          await editor.page.mouse.move(handleBox.x, handleBox.y);
          await editor.page.mouse.down();
          await editor.page.mouse.move(handleBox.x + 50, handleBox.y);
          await editor.page.mouse.up();
          
          // Column width should have changed
          const firstColumn = editor.page.locator('table td:first-child').first();
          const columnWidth = await firstColumn.evaluate(el => 
            el.getBoundingClientRect().width
          );
          expect(columnWidth).toBeGreaterThan(50);
        }
      }
    });

    test('should set fixed column width', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click({ button: 'right' });
      
      const columnPropertiesOption = editor.page.locator('[data-testid="column-properties"]');
      if (await columnPropertiesOption.isVisible()) {
        await columnPropertiesOption.click();
        
        const widthInput = editor.page.locator('[data-testid="column-width-input"]');
        await widthInput.fill('150');
        
        const applyButton = editor.page.locator('[data-testid="column-properties-apply"]');
        await applyButton.click();
        
        const columnWidth = await firstCell.evaluate(el => 
          window.getComputedStyle(el).width
        );
        expect(parseInt(columnWidth)).toBe(150);
      }
    });

    test('should auto-resize columns to content', async () => {
      // Add long content to first cell
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      const longContent = 'This is a very long content that should cause the column to auto-resize';
      await editor.page.keyboard.type(longContent);
      
      // Right-click on column
      await firstCell.click({ button: 'right' });
      
      const autoResizeOption = editor.page.locator('[data-testid="column-auto-resize"]');
      if (await autoResizeOption.isVisible()) {
        await autoResizeOption.click();
        
        // Column should be wider now
        const columnWidth = await firstCell.evaluate(el => 
          el.getBoundingClientRect().width
        );
        expect(columnWidth).toBeGreaterThan(100);
      }
    });
  });

  test.describe('Table Keyboard Shortcuts', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should support Enter to create new row', async () => {
      const lastRowLastCell = editor.page.locator('table tr:last-child td:last-child');
      await lastRowLastCell.click();
      
      // Press Enter should create new row
      await editor.page.keyboard.press('Enter');
      
      const rows = editor.page.locator('table tr');
      const rowCount = await rows.count();
      expect(rowCount).toBe(4); // Was 3, now 4
    });

    test('should support Ctrl+Enter for line break within cell', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      await editor.page.keyboard.type('Line 1');
      await editor.page.keyboard.press('Control+Enter');
      await editor.page.keyboard.type('Line 2');
      
      const cellContent = await firstCell.textContent();
      expect(cellContent).toContain('Line 1');
      expect(cellContent).toContain('Line 2');
      
      const cellHtml = await firstCell.innerHTML();
      expect(cellHtml).toContain('<br>');
    });

    test('should support Delete key to clear cell content', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      await editor.page.keyboard.type('Content to delete');
      
      // Select all and delete
      await editor.page.keyboard.press('Control+a');
      await editor.page.keyboard.press('Delete');
      
      const cellContent = await firstCell.textContent();
      expect(cellContent.trim()).toBe('');
    });

    test('should support Escape to exit table editing', async () => {
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      await editor.page.keyboard.press('Escape');
      
      // Focus should move outside the table
      const focusedElement = await editor.page.evaluate(() => 
        document.activeElement?.tagName
      );
      expect(focusedElement).not.toBe('TD');
    });
  });

  test.describe('Table Accessibility', () => {
    test.beforeEach(async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
    });

    test('should have proper table structure', async () => {
      const table = editor.page.locator('table').first();
      
      // Should have proper table elements
      await expect(table).toBeVisible();
      
      const tbody = table.locator('tbody');
      await expect(tbody).toBeVisible();
    });

    test('should support table headers', async () => {
      // Convert first row to headers
      const firstRowCells = editor.page.locator('table tr:first-child td');
      const firstCell = firstRowCells.first();
      
      await firstCell.click({ button: 'right' });
      
      const headerOption = editor.page.locator('[data-testid="convert-to-header"]');
      if (await headerOption.isVisible()) {
        await headerOption.click();
        
        const headers = editor.page.locator('table th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);
      }
    });

    test('should have proper ARIA attributes', async () => {
      const table = editor.page.locator('table').first();
      
      const role = await table.getAttribute('role');
      expect(role).toBe('table');
      
      // Cells should have proper roles
      const firstCell = editor.page.locator('table td').first();
      const cellRole = await firstCell.getAttribute('role');
      expect(cellRole).toMatch(/cell|gridcell/);
    });

    test('should support screen reader navigation', async () => {
      const table = editor.page.locator('table').first();
      const ariaLabel = await table.getAttribute('aria-label');
      
      // Should have descriptive label
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/table|grid/i);
    });
  });
});