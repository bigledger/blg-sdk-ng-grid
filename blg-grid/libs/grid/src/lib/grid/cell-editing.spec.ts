import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { Grid } from './grid';
import { GridStateService } from '@blg/core';
import { TestGridWrapperComponent } from '../../test-utilities/test-grid-wrapper.component';
import {
  MockDataFactory,
  MockColumnFactory,
  MockConfigFactory,
  TestDOMHelpers,
  TestEventHelpers,
  TestAsyncHelpers
} from '../../test-utilities/test-utils';

describe('Grid Component - Cell Editing', () => {
  let wrapperComponent: TestGridWrapperComponent;
  let wrapperFixture: ComponentFixture<TestGridWrapperComponent>;
  let gridStateService: GridStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Grid,
        TestGridWrapperComponent,
        NoopAnimationsModule,
        ScrollingModule,
        DragDropModule
      ],
      providers: [GridStateService]
    }).compileComponents();

    wrapperFixture = TestBed.createComponent(TestGridWrapperComponent);
    wrapperComponent = wrapperFixture.componentInstance;
    gridStateService = TestBed.inject(GridStateService);
  });

  afterEach(() => {
    wrapperFixture?.destroy();
    gridStateService?.reset();
  });

  describe('Edit Mode Activation', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(3);
      testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should enter edit mode on double-click', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const cellElement = TestDOMHelpers.getCellElement(wrapperFixture, 0, 'firstName');
      TestEventHelpers.doubleClick(cellElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const editingCell = wrapperComponent.editingCell;
      expect(editingCell).toBeTruthy();
      expect(editingCell?.rowIndex).toBe(0);
      expect(editingCell?.columnId).toBe('firstName');
    });

    it('should enter edit mode with F2 key', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      
      // Focus and navigate to cell
      gridElement.focus();
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowRight'); // Move to firstName column
      wrapperFixture.detectChanges();

      // Press F2 to edit
      TestEventHelpers.keyPress(gridElement, 'F2');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const editingCell = wrapperComponent.editingCell;
      expect(editingCell).toBeTruthy();
      expect(editingCell?.columnId).toBe('firstName');
    });

    it('should enter edit mode with Enter key', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      
      // Focus and navigate to editable cell
      gridElement.focus();
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowRight'); // Move to firstName column
      wrapperFixture.detectChanges();

      // Press Enter to edit
      TestEventHelpers.pressEnter(gridElement);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const editingCell = wrapperComponent.editingCell;
      expect(editingCell).toBeTruthy();
    });

    it('should not enter edit mode on non-editable columns', async () => {
      // Make first column non-editable
      testColumns[0].cellEditor = false;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const cellElement = TestDOMHelpers.getCellElement(wrapperFixture, 0, testColumns[0].id);
      TestEventHelpers.doubleClick(cellElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const editingCell = wrapperComponent.editingCell;
      expect(editingCell).toBeFalsy();
    });

    it('should clear previous edit when starting new edit', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Start editing first cell
      wrapperComponent.startEdit(0, 'firstName', 'test1');
      wrapperFixture.detectChanges();

      expect(wrapperComponent.editingCell?.columnId).toBe('firstName');

      // Start editing different cell
      wrapperComponent.startEdit(0, 'lastName', 'test2');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.editingCell?.columnId).toBe('lastName');
    });
  });

  describe('Edit Value Management', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, firstName: 'Alice', age: 30, active: true, hireDate: new Date('2020-01-15') },
        { id: 2, firstName: 'Bob', age: 25, active: false, hireDate: new Date('2021-06-10') }
      ];
      testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should initialize edit value with current cell value', async () => {
      wrapperFixture.detectChanges();
      
      const currentValue = testData[0].firstName;
      wrapperComponent.startEdit(0, 'firstName', currentValue);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.grid.editValue()).toBe(currentValue);
      expect(wrapperComponent.grid.originalEditValue()).toBe(currentValue);
    });

    it('should handle different data types in edit mode', async () => {
      wrapperFixture.detectChanges();

      // String
      wrapperComponent.startEdit(0, 'firstName', testData[0].firstName);
      wrapperFixture.detectChanges();
      expect(wrapperComponent.grid.editValue()).toBe(testData[0].firstName);

      // Number
      wrapperComponent.startEdit(0, 'age', testData[0].age);
      wrapperFixture.detectChanges();
      expect(wrapperComponent.grid.editValue()).toBe(testData[0].age);

      // Boolean
      wrapperComponent.startEdit(0, 'active', testData[0].active);
      wrapperFixture.detectChanges();
      expect(wrapperComponent.grid.editValue()).toBe('true'); // Converted to string for editing

      // Date
      wrapperComponent.startEdit(0, 'hireDate', testData[0].hireDate);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Date should be converted to YYYY-MM-DD format
      const editValue = wrapperComponent.grid.editValue();
      expect(editValue).toBe('2020-01-15');
    });

    it('should update edit value as user types', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.startEdit(0, 'firstName', 'Alice');
      wrapperFixture.detectChanges();

      // Simulate user input
      wrapperComponent.grid.updateEditValue('Alice Updated');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.grid.editValue()).toBe('Alice Updated');
    });
  });

  describe('Commit Edit', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, firstName: 'Alice', age: 30, active: true, hireDate: new Date('2020-01-15') },
        { id: 2, firstName: 'Bob', age: 25, active: false, hireDate: new Date('2021-06-10') }
      ];
      testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should commit string edits correctly', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();
      
      wrapperComponent.startEdit(0, 'firstName', 'Alice');
      wrapperComponent.grid.updateEditValue('Alice Updated');
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.gridData[0].firstName).toBe('Alice Updated');
      expect(wrapperComponent.editingCell).toBeFalsy();
    });

    it('should commit numeric edits with type conversion', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.startEdit(0, 'age', 30);
      wrapperComponent.grid.updateEditValue('35');
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.gridData[0].age).toBe(35);
      expect(typeof wrapperComponent.gridData[0].age).toBe('number');
    });

    it('should commit boolean edits with type conversion', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.startEdit(0, 'active', true);
      wrapperComponent.grid.updateEditValue('false');
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.gridData[0].active).toBe(false);
      expect(typeof wrapperComponent.gridData[0].active).toBe('boolean');
    });

    it('should handle null/empty values correctly', async () => {
      wrapperFixture.detectChanges();
      
      // Empty string for number should become null
      wrapperComponent.startEdit(0, 'age', 30);
      wrapperComponent.grid.updateEditValue('');
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.gridData[0].age).toBeNull();
    });

    it('should commit with Enter key', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.startEdit(0, 'firstName', 'Alice');
      wrapperComponent.grid.updateEditValue('Alice Updated');
      wrapperFixture.detectChanges();

      // Find the editor input and simulate Enter
      const editorInput = document.querySelector('.blg-grid-editor-input') as HTMLInputElement;
      if (editorInput) {
        TestEventHelpers.keyPress(editorInput, 'Enter');
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      }

      expect(wrapperComponent.gridData[0].firstName).toBe('Alice Updated');
      expect(wrapperComponent.editingCell).toBeFalsy();
    });

    it('should emit cell edit events', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();
      
      const originalValue = testData[0].firstName;
      const newValue = 'Alice Updated';

      wrapperComponent.startEdit(0, 'firstName', originalValue);
      wrapperComponent.grid.updateEditValue(newValue);
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const gridEvents = wrapperComponent.events.filter(e => e.type === 'cell-edit');
      expect(gridEvents).toHaveLength(1);

      const editEvent = gridEvents[0];
      expect(editEvent.data.rowIndex).toBe(0);
      expect(editEvent.data.columnId).toBe('firstName');
      expect(editEvent.data.oldValue).toBe(originalValue);
      expect(editEvent.data.newValue).toBe(newValue);
      expect(editEvent.data.rowData).toBeTruthy();
    });
  });

  describe('Cancel Edit', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(2);
      testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should cancel edit and revert changes', async () => {
      wrapperFixture.detectChanges();
      
      const originalValue = testData[0].firstName;
      
      wrapperComponent.startEdit(0, 'firstName', originalValue);
      wrapperComponent.grid.updateEditValue('Modified Value');
      wrapperComponent.cancelEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.gridData[0].firstName).toBe(originalValue);
      expect(wrapperComponent.editingCell).toBeFalsy();
    });

    it('should cancel edit with Escape key', async () => {
      wrapperFixture.detectChanges();
      
      const originalValue = testData[0].firstName;
      
      wrapperComponent.startEdit(0, 'firstName', originalValue);
      wrapperComponent.grid.updateEditValue('Modified Value');
      wrapperFixture.detectChanges();

      // Find the editor input and simulate Escape
      const editorInput = document.querySelector('.blg-grid-editor-input') as HTMLInputElement;
      if (editorInput) {
        TestEventHelpers.keyPress(editorInput, 'Escape');
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      }

      expect(wrapperComponent.gridData[0].firstName).toBe(originalValue);
      expect(wrapperComponent.editingCell).toBeFalsy();
    });

    it('should not emit events when canceling edit', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();
      
      wrapperComponent.startEdit(0, 'firstName', testData[0].firstName);
      wrapperComponent.grid.updateEditValue('Modified Value');
      wrapperComponent.cancelEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const cellEditEvents = wrapperComponent.events.filter(e => e.type === 'cell-edit');
      expect(cellEditEvents).toHaveLength(0);
    });
  });

  describe('Tab Navigation in Edit Mode', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(3);
      testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should move to next editable cell with Tab', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Start editing first editable cell
      const editableColumns = testColumns.filter(col => col.cellEditor !== false);
      const firstEditableColumn = editableColumns[0];
      
      wrapperComponent.startEdit(0, firstEditableColumn.id, 'test');
      wrapperFixture.detectChanges();

      // Simulate Tab key
      const editorInput = document.querySelector('.blg-grid-editor-input') as HTMLInputElement;
      if (editorInput) {
        TestEventHelpers.keyPress(editorInput, 'Tab');
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      }

      // Should move to next editable column
      const editingCell = wrapperComponent.editingCell;
      expect(editingCell).toBeTruthy();
      expect(editingCell?.columnId).toBe(editableColumns[1].id);
    });

    it('should move to previous editable cell with Shift+Tab', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Start editing second editable cell
      const editableColumns = testColumns.filter(col => col.cellEditor !== false);
      
      wrapperComponent.startEdit(0, editableColumns[1].id, 'test');
      wrapperFixture.detectChanges();

      // Simulate Shift+Tab key
      const editorInput = document.querySelector('.blg-grid-editor-input') as HTMLInputElement;
      if (editorInput) {
        TestEventHelpers.keyPress(editorInput, 'Tab', { shiftKey: true });
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      }

      // Should move to previous editable column
      const editingCell = wrapperComponent.editingCell;
      expect(editingCell).toBeTruthy();
      expect(editingCell?.columnId).toBe(editableColumns[0].id);
    });

    it('should move to next row when reaching end of editable columns', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Start editing last editable cell in first row
      const editableColumns = testColumns.filter(col => col.cellEditor !== false);
      const lastEditableColumn = editableColumns[editableColumns.length - 1];
      
      wrapperComponent.startEdit(0, lastEditableColumn.id, 'test');
      wrapperFixture.detectChanges();

      // Tab should move to first editable column of next row
      const editorInput = document.querySelector('.blg-grid-editor-input') as HTMLInputElement;
      if (editorInput) {
        TestEventHelpers.keyPress(editorInput, 'Tab');
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      }

      const editingCell = wrapperComponent.editingCell;
      expect(editingCell).toBeTruthy();
      expect(editingCell?.rowIndex).toBe(1);
      expect(editingCell?.columnId).toBe(editableColumns[0].id);
    });
  });

  describe('Edit Validation', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, firstName: 'Alice', age: 30, salary: 50000 }
      ];
      testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should handle invalid numeric input gracefully', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.startEdit(0, 'age', 30);
      wrapperComponent.grid.updateEditValue('not-a-number');
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Should result in NaN, which becomes null
      expect(isNaN(wrapperComponent.gridData[0].age)).toBe(true);
    });

    it('should handle very long string input', async () => {
      wrapperFixture.detectChanges();
      
      const longString = 'a'.repeat(10000);
      
      wrapperComponent.startEdit(0, 'firstName', 'Alice');
      wrapperComponent.grid.updateEditValue(longString);
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.gridData[0].firstName).toBe(longString);
    });

    it('should handle special characters in input', async () => {
      wrapperFixture.detectChanges();
      
      const specialChars = '!@#$%^&*(){}[]|\\:";\'<>,.?/~`';
      
      wrapperComponent.startEdit(0, 'firstName', 'Alice');
      wrapperComponent.grid.updateEditValue(specialChars);
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.gridData[0].firstName).toBe(specialChars);
    });
  });

  describe('Edit with Pagination', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(50);
      testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getPaginatedConfig();
    });

    it('should edit cells correctly across pages', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Edit cell on first page
      const originalValue = testData[0].firstName;
      const newValue = 'Updated on Page 1';
      
      wrapperComponent.startEdit(0, 'firstName', originalValue);
      wrapperComponent.grid.updateEditValue(newValue);
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();

      expect(wrapperComponent.gridData[0].firstName).toBe(newValue);

      // Go to second page
      wrapperComponent.goToPage(1);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Edit cell on second page
      const pageSize = wrapperComponent.pageSize;
      const secondPageIndex = 0; // First item on second page (display index)
      const actualDataIndex = pageSize; // Actual index in original data
      
      const originalValue2 = testData[actualDataIndex].firstName;
      const newValue2 = 'Updated on Page 2';
      
      wrapperComponent.startEdit(secondPageIndex, 'firstName', originalValue2);
      wrapperComponent.grid.updateEditValue(newValue2);
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Go back to first page and verify edit persisted
      wrapperComponent.goToPage(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.data[0].firstName).toBe(newValue);
      expect(wrapperComponent.data[actualDataIndex].firstName).toBe(newValue2);
    });
  });

  describe('Performance', () => {
    it('should handle rapid edit operations efficiently', async () => {
      const testData = MockDataFactory.generateRows(100);
      const testColumns = MockColumnFactory.getEditableColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const startTime = performance.now();

      // Perform rapid edits
      for (let i = 0; i < 10; i++) {
        wrapperComponent.startEdit(i % 5, 'firstName', `Original${i}`);
        wrapperComponent.grid.updateEditValue(`Updated${i}`);
        wrapperComponent.commitEdit();
        wrapperFixture.detectChanges();
      }

      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid edits efficiently (< 100ms for 10 edits)
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle edit on empty data gracefully', () => {
      wrapperComponent.data = [];
      wrapperComponent.columns = MockColumnFactory.getEditableColumns();
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      expect(() => {
        wrapperComponent.startEdit(0, 'firstName', 'test');
        wrapperFixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle edit on invalid row index', () => {
      const testData = MockDataFactory.generateRows(3);
      wrapperComponent.data = testData;
      wrapperComponent.columns = MockColumnFactory.getEditableColumns();
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      expect(() => {
        wrapperComponent.startEdit(100, 'firstName', 'test');
        wrapperComponent.commitEdit();
        wrapperFixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle edit on invalid column ID', () => {
      const testData = MockDataFactory.generateRows(3);
      wrapperComponent.data = testData;
      wrapperComponent.columns = MockColumnFactory.getEditableColumns();
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      expect(() => {
        wrapperComponent.startEdit(0, 'nonexistentColumn', 'test');
        wrapperComponent.commitEdit();
        wrapperFixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle concurrent edit attempts', async () => {
      const testData = MockDataFactory.generateRows(3);
      wrapperComponent.data = testData;
      wrapperComponent.columns = MockColumnFactory.getEditableColumns();
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Start multiple edits rapidly (second should replace first)
      wrapperComponent.startEdit(0, 'firstName', 'test1');
      wrapperComponent.startEdit(0, 'lastName', 'test2');
      wrapperComponent.commitEdit();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Only the last edit should be active/committed
      expect(wrapperComponent.editingCell).toBeFalsy();
    });
  });
});