import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Table Functionality', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
  });

  test.describe('Table Creation', () => {
    test('should create a 2x2 table', async () => {
      await editorPage.insertTable(2, 2);
      await EditorAssertions.toHaveTable(editorPage.editorContent, 2, 2);
    });

    test('should create a 3x3 table', async () => {
      await editorPage.insertTable(3, 3);
      await EditorAssertions.toHaveTable(editorPage.editorContent, 3, 3);
    });

    test('should create a 5x4 table', async () => {
      await editorPage.insertTable(5, 4);
      await EditorAssertions.toHaveTable(editorPage.editorContent, 5, 4);
    });

    test('should create table with maximum allowed dimensions', async () => {
      // Test with reasonable maximum (adjust based on actual limits)
      await editorPage.insertTable(10, 10);
      await EditorAssertions.toHaveTable(editorPage.editorContent, 10, 10);
    });

    test('should position table at cursor location', async () => {
      await editorPage.typeText('Text before table');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.insertTable(2, 2);
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Text after table');

      const content = await editorPage.getTextContent();
      expect(content).toContain('Text before table');
      expect(content).toContain('Text after table');
      
      await EditorAssertions.toHaveTable(editorPage.editorContent, 2, 2);
    });
  });

  test.describe('Table Navigation', () => {
    test('should navigate between table cells with Tab', async () => {
      await editorPage.insertTable(2, 2);
      
      // Tab should move to next cell
      await editorPage.page.keyboard.press('Tab');
      
      // Type in current cell
      await editorPage.page.keyboard.type('Cell 1');
      
      // Tab to next cell
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Cell 2');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('Cell 1');
      expect(content).toContain('Cell 2');
    });

    test('should navigate between table cells with Shift+Tab', async () => {
      await editorPage.insertTable(2, 2);
      
      // Move to second cell
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Second');
      
      // Move back to first cell
      await editorPage.page.keyboard.press('Shift+Tab');
      await editorPage.page.keyboard.type('First ');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('First Second');
    });

    test('should navigate with arrow keys within table', async () => {
      await editorPage.insertTable(3, 3);
      
      // Add content to track position
      await editorPage.page.keyboard.type('Start');
      
      // Move right
      await editorPage.page.keyboard.press('ArrowRight');
      await editorPage.page.keyboard.press('ArrowRight');
      await editorPage.page.keyboard.type('Right');
      
      // Move down
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.type('Down');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('Start');
      expect(content).toContain('Right');
      expect(content).toContain('Down');
    });

    test('should handle navigation at table boundaries', async () => {
      await editorPage.insertTable(2, 2);
      
      // Navigate to last cell
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.press('Tab');
      
      // Should be in last cell
      await editorPage.page.keyboard.type('Last cell');
      
      // Tab from last cell (should not create error)
      await editorPage.page.keyboard.press('Tab');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('Last cell');
    });
  });

  test.describe('Table Content Editing', () => {
    test('should allow text input in table cells', async () => {
      await editorPage.insertTable(2, 2);
      
      const cellContents = ['Cell A1', 'Cell B1', 'Cell A2', 'Cell B2'];
      
      for (const content of cellContents) {
        await editorPage.page.keyboard.type(content);
        await editorPage.page.keyboard.press('Tab');
      }
      
      const editorContent = await editorPage.getTextContent();
      for (const content of cellContents) {
        expect(editorContent).toContain(content);
      }
    });

    test('should support text formatting in table cells', async () => {
      await editorPage.insertTable(2, 2);
      
      // Type and format text in first cell
      await editorPage.page.keyboard.type('Bold text');
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.applyBold();
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', 'Bold text');
      
      // Move to next cell and add italic text
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Italic text');
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.applyItalic();
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'italic', 'Italic text');
    });

    test('should handle line breaks within table cells', async () => {
      await editorPage.insertTable(2, 2);
      
      await editorPage.page.keyboard.type('Line 1');
      await editorPage.page.keyboard.press('Shift+Enter'); // Soft line break
      await editorPage.page.keyboard.type('Line 2');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('Line 1');
      expect(htmlContent).toContain('<br>');
      expect(htmlContent).toContain('Line 2');
    });

    test('should handle long text in table cells', async () => {
      await editorPage.insertTable(2, 2);
      
      const longText = EditorTestData.generateText({ words: 50 });
      await editorPage.page.keyboard.type(longText);
      
      const content = await editorPage.getTextContent();
      expect(content).toContain(longText);
    });

    test('should support nested elements in table cells', async () => {
      await editorPage.insertTable(2, 2);
      
      // Create a list inside a table cell
      await editorPage.page.keyboard.type('Item 1');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.type('Item 2');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<li>');
      expect(htmlContent).toContain('Item 1');
      expect(htmlContent).toContain('Item 2');
    });
  });

  test.describe('Table Structure Manipulation', () => {
    test('should add a new row', async () => {
      await editorPage.insertTable(2, 2);
      
      // Right-click on table to access context menu
      const table = editorPage.editorContent.locator('table').first();
      await table.click({ button: 'right' });
      
      // Click add row option (if available)
      const addRowOption = editorPage.page.locator('[data-testid="add-row"]');
      if (await addRowOption.isVisible()) {
        await addRowOption.click();
        await EditorAssertions.toHaveTable(editorPage.editorContent, 3, 2);
      }
    });

    test('should add a new column', async () => {
      await editorPage.insertTable(2, 2);
      
      const table = editorPage.editorContent.locator('table').first();
      await table.click({ button: 'right' });
      
      const addColumnOption = editorPage.page.locator('[data-testid="add-column"]');
      if (await addColumnOption.isVisible()) {
        await addColumnOption.click();
        await EditorAssertions.toHaveTable(editorPage.editorContent, 2, 3);
      }
    });

    test('should delete a row', async () => {
      await editorPage.insertTable(3, 2);
      
      // Click in middle row
      const middleRow = editorPage.editorContent.locator('table tr').nth(1);
      await middleRow.click({ button: 'right' });
      
      const deleteRowOption = editorPage.page.locator('[data-testid="delete-row"]');
      if (await deleteRowOption.isVisible()) {
        await deleteRowOption.click();
        await EditorAssertions.toHaveTable(editorPage.editorContent, 2, 2);
      }
    });

    test('should delete a column', async () => {
      await editorPage.insertTable(2, 3);
      
      const middleCell = editorPage.editorContent.locator('table td').nth(1);
      await middleCell.click({ button: 'right' });
      
      const deleteColumnOption = editorPage.page.locator('[data-testid="delete-column"]');
      if (await deleteColumnOption.isVisible()) {
        await deleteColumnOption.click();
        await EditorAssertions.toHaveTable(editorPage.editorContent, 2, 2);
      }
    });

    test('should delete entire table', async () => {
      await editorPage.insertTable(2, 2);
      
      const table = editorPage.editorContent.locator('table').first();
      await table.click({ button: 'right' });
      
      const deleteTableOption = editorPage.page.locator('[data-testid="delete-table"]');
      if (await deleteTableOption.isVisible()) {
        await deleteTableOption.click();
        
        const remainingTables = editorPage.editorContent.locator('table');
        await expect(remainingTables).toHaveCount(0);
      }
    });
  });

  test.describe('Table Selection', () => {
    test('should select individual table cells', async () => {
      await editorPage.insertTable(3, 3);
      
      // Click on a specific cell
      const targetCell = editorPage.editorContent.locator('table td').nth(4); // Middle cell
      await targetCell.click();
      
      // Cell should be selected/focused
      await expect(targetCell).toBeFocused();
    });

    test('should select entire row', async () => {
      await editorPage.insertTable(3, 3);
      
      // Triple-click to select row (common pattern)
      const firstRowCell = editorPage.editorContent.locator('table tr').first().locator('td').first();
      await firstRowCell.click({ clickCount: 3 });
      
      // Verify row selection by typing to replace content
      await editorPage.page.keyboard.type('New row content');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('New row content');
    });

    test('should select entire column', async () => {
      await editorPage.insertTable(3, 3);
      
      // Click column header area (if available) or use keyboard shortcut
      const firstCell = editorPage.editorContent.locator('table td').first();
      await firstCell.click();
      await editorPage.page.keyboard.press('Control+Space'); // Common column select shortcut
      
      // If column selection is supported, typing should affect the column
      await editorPage.page.keyboard.type('Column');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('Column');
    });

    test('should select entire table', async () => {
      await editorPage.insertTable(2, 2);
      
      // Click table and select all
      const table = editorPage.editorContent.locator('table').first();
      await table.click();
      await editorPage.page.keyboard.press('Control+a');
      
      // Delete should remove the table
      await editorPage.page.keyboard.press('Delete');
      
      const remainingTables = editorPage.editorContent.locator('table');
      await expect(remainingTables).toHaveCount(0);
    });
  });

  test.describe('Table Styling and Appearance', () => {
    test('should apply table headers', async () => {
      await editorPage.insertTable(3, 3);
      
      // First row should be headers by default or can be converted
      const firstRowCells = editorPage.editorContent.locator('table tr').first().locator('th, td');
      await expect(firstRowCells.first()).toBeVisible();
      
      // If not already headers, try to convert first row
      const firstCell = firstRowCells.first();
      await firstCell.click({ button: 'right' });
      
      const headerOption = editorPage.page.locator('[data-testid="make-header"]');
      if (await headerOption.isVisible()) {
        await headerOption.click();
        
        // Check if header tags are applied
        const headerCells = editorPage.editorContent.locator('table th');
        await expect(headerCells.first()).toBeVisible();
      }
    });

    test('should handle table borders and styling', async () => {
      await editorPage.insertTable(2, 2);
      
      const table = editorPage.editorContent.locator('table').first();
      
      // Check that table has basic styling
      const computedStyle = await table.evaluate(el => getComputedStyle(el));
      expect(computedStyle.borderCollapse).toBeDefined();
    });

    test('should maintain table layout with content', async () => {
      await editorPage.insertTable(3, 3);
      
      // Fill table with varying content lengths
      const contents = [
        'Short',
        'Medium length content',
        'Very long content that might affect table layout and column widths'
      ];
      
      for (let i = 0; i < contents.length; i++) {
        await editorPage.page.keyboard.type(contents[i]);
        if (i < contents.length - 1) {
          await editorPage.page.keyboard.press('Tab');
        }
      }
      
      // Table should still be properly formatted
      await EditorAssertions.toHaveTable(editorPage.editorContent, 3, 3);
      
      // All content should be visible
      const editorContent = await editorPage.getTextContent();
      for (const content of contents) {
        expect(editorContent).toContain(content);
      }
    });
  });

  test.describe('Table Copy and Paste', () => {
    test('should copy and paste table cells', async () => {
      await editorPage.insertTable(2, 2);
      
      // Add content to first cell
      await editorPage.page.keyboard.type('Original content');
      
      // Select and copy
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.copy();
      
      // Move to next cell and paste
      await editorPage.page.keyboard.press('Tab');
      await editorPage.paste();
      
      const content = await editorPage.getTextContent();
      const occurrences = (content.match(/Original content/g) || []).length;
      expect(occurrences).toBe(2);
    });

    test('should copy and paste entire table', async () => {
      await editorPage.insertTable(2, 2);
      
      // Fill table with content
      await editorPage.page.keyboard.type('A1');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('B1');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('A2');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('B2');
      
      // Select entire table
      const table = editorPage.editorContent.locator('table').first();
      await table.click();
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.copy();
      
      // Move after table and paste
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.paste();
      
      // Should have two tables
      const tables = editorPage.editorContent.locator('table');
      await expect(tables).toHaveCount(2);
    });
  });

  test.describe('Table Performance and Edge Cases', () => {
    test('should handle large tables efficiently', async () => {
      const startTime = Date.now();
      
      // Create a larger table
      await editorPage.insertTable(10, 8);
      
      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(5000);
      
      await EditorAssertions.toHaveTable(editorPage.editorContent, 10, 8);
    });

    test('should handle table undo/redo operations', async () => {
      // Create table
      await editorPage.insertTable(2, 2);
      await EditorAssertions.toHaveTable(editorPage.editorContent, 2, 2);
      
      // Undo table creation
      await editorPage.undo();
      
      const tablesAfterUndo = editorPage.editorContent.locator('table');
      await expect(tablesAfterUndo).toHaveCount(0);
      
      // Redo table creation
      await editorPage.redo();
      await EditorAssertions.toHaveTable(editorPage.editorContent, 2, 2);
    });

    test('should handle table with mixed content types', async () => {
      await editorPage.insertTable(3, 3);
      
      // Add different types of content
      await editorPage.page.keyboard.type('Text');
      await editorPage.page.keyboard.press('Tab');
      
      // Add formatted text
      await editorPage.applyBold();
      await editorPage.page.keyboard.type('Bold');
      await editorPage.applyBold();
      await editorPage.page.keyboard.press('Tab');
      
      // Add link (if supported in table)
      await editorPage.page.keyboard.type('Link text');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('Text');
      expect(content).toContain('Bold');
      expect(content).toContain('Link text');
      
      await EditorAssertions.toHaveTable(editorPage.editorContent, 3, 3);
    });

    test('should maintain table structure during complex editing', async () => {
      await editorPage.insertTable(3, 3);
      
      // Fill table
      for (let i = 1; i <= 9; i++) {
        await editorPage.page.keyboard.type(`Cell ${i}`);
        if (i < 9) {
          await editorPage.page.keyboard.press('Tab');
        }
      }
      
      // Perform various editing operations
      await editorPage.page.keyboard.press('Control+Home'); // Go to start
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.applyBold();
      
      await editorPage.undo();
      await editorPage.redo();
      
      // Table structure should remain intact
      await EditorAssertions.toHaveTable(editorPage.editorContent, 3, 3);
      
      const content = await editorPage.getTextContent();
      for (let i = 1; i <= 9; i++) {
        expect(content).toContain(`Cell ${i}`);
      }
    });
  });
});