import { test, expect, Page } from '@playwright/test';
import { GridHelper } from '../helpers/grid-helper';
import { TestHelpers } from '../helpers/test-helpers';

/**
 * Multi-Filters Suite - Tests advanced multi-filter system capabilities
 * 
 * This comprehensive test suite validates BigLedger Grid's sophisticated multi-filter system,
 * featuring visual filter builder with drag-and-drop, natural language query processing,
 * advanced logical operators (XOR, NAND, NOR), formula editor with syntax highlighting,
 * real-time preview, and performance optimization - far exceeding ag-grid's capabilities.
 */
test.describe('Multi-Filters Suite', () => {
  let page: Page;
  let gridHelper: GridHelper;
  let testHelper: TestHelpers;
  
  // Multi-filter performance tracking
  let multiFilterMetrics: {
    builderRenderTime: number;
    queryProcessingTime: number;
    filterExecutionTime: number;
    previewUpdateTime: number;
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    gridHelper = new GridHelper(page);
    testHelper = new TestHelpers(page);
    
    // Enable multi-filter performance monitoring
    await page.addInitScript(() => {
      (window as any).multiFilterMetrics = {
        builderRenderTime: 0,
        queryProcessingTime: 0,
        filterExecutionTime: 0,
        previewUpdateTime: 0
      };
    });
  });

  test.beforeEach(async () => {
    await page.goto('/grid-demo?dataset=complex&rows=50000&cols=30&multifilter=enabled');
    await testHelper.waitForElement('[data-testid="grid-container"]', 10000);
  });

  test.describe('Visual Filter Builder with Drag-and-Drop', () => {
    
    test('should provide intuitive visual filter construction', async () => {
      await test.step('Open visual filter builder', async () => {
        await page.locator('[data-testid="multi-filter-builder"]').click();
        
        const startTime = Date.now();
        await testHelper.waitForElement('[data-testid="filter-builder-canvas"]', 5000);
        const builderLoadTime = Date.now() - startTime;
        
        expect(builderLoadTime).toBeLessThan(2000);
        
        // Verify builder components are available
        const componentPalette = page.locator('[data-testid="filter-component-palette"]');
        await expect(componentPalette).toBeVisible();
        
        const builderCanvas = page.locator('[data-testid="filter-builder-canvas"]');
        await expect(builderCanvas).toBeVisible();
      });

      await test.step('Drag filter components to build complex query', async () => {
        // Available components
        const components = [
          { type: 'field-selector', name: 'Field Selector' },
          { type: 'operator', name: 'Operator' },
          { type: 'value-input', name: 'Value Input' },
          { type: 'logical-and', name: 'AND' },
          { type: 'logical-or', name: 'OR' },
          { type: 'logical-not', name: 'NOT' },
          { type: 'group', name: 'Group' }
        ];

        const canvas = page.locator('[data-testid="filter-builder-canvas"]');
        
        // Build filter: (Name contains 'John' OR Age > 30) AND Department = 'Engineering'
        
        // 1. Drag group container
        const groupComponent = page.locator('[data-testid="component-group"]');
        await groupComponent.dragTo(canvas, { targetPosition: { x: 200, y: 100 } });
        
        // 2. Drag first condition: Name contains 'John'
        const fieldSelector1 = page.locator('[data-testid="component-field-selector"]');
        await fieldSelector1.dragTo(canvas, { targetPosition: { x: 250, y: 150 } });
        
        const operator1 = page.locator('[data-testid="component-operator"]');
        await operator1.dragTo(canvas, { targetPosition: { x: 350, y: 150 } });
        
        const valueInput1 = page.locator('[data-testid="component-value-input"]');
        await valueInput1.dragTo(canvas, { targetPosition: { x: 450, y: 150 } });
        
        // 3. Drag OR operator
        const orOperator = page.locator('[data-testid="component-logical-or"]');
        await orOperator.dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
        
        // 4. Drag second condition: Age > 30
        const fieldSelector2 = page.locator('[data-testid="component-field-selector"]');
        await fieldSelector2.dragTo(canvas, { targetPosition: { x: 250, y: 250 } });
        
        const operator2 = page.locator('[data-testid="component-operator"]');
        await operator2.dragTo(canvas, { targetPosition: { x: 350, y: 250 } });
        
        const valueInput2 = page.locator('[data-testid="component-value-input"]');
        await valueInput2.dragTo(canvas, { targetPosition: { x: 450, y: 250 } });
        
        // 5. Drag final AND condition
        const andOperator = page.locator('[data-testid="component-logical-and"]');
        await andOperator.dragTo(canvas, { targetPosition: { x: 300, y: 300 } });
        
        // Verify components are connected
        const connections = page.locator('[data-testid^="filter-connection-"]');
        expect(await connections.count()).toBeGreaterThan(0);
      });

      await test.step('Configure dragged components', async () => {
        // Configure first field selector
        const fieldSelector1 = page.locator('[data-testid="canvas-component-field-selector-1"]');
        await fieldSelector1.click();
        await page.locator('[data-testid="field-dropdown"]').selectOption('name');
        
        // Configure first operator
        const operator1 = page.locator('[data-testid="canvas-component-operator-1"]');
        await operator1.click();
        await page.locator('[data-testid="operator-dropdown"]').selectOption('contains');
        
        // Configure first value
        const valueInput1 = page.locator('[data-testid="canvas-component-value-1"]');
        await valueInput1.click();
        await page.fill('[data-testid="value-input-field"]', 'John');
        
        // Configure second condition
        const fieldSelector2 = page.locator('[data-testid="canvas-component-field-selector-2"]');
        await fieldSelector2.click();
        await page.locator('[data-testid="field-dropdown"]').selectOption('age');
        
        const operator2 = page.locator('[data-testid="canvas-component-operator-2"]');
        await operator2.click();
        await page.locator('[data-testid="operator-dropdown"]').selectOption('greaterThan');
        
        const valueInput2 = page.locator('[data-testid="canvas-component-value-2"]');
        await valueInput2.click();
        await page.fill('[data-testid="value-input-field"]', '30');
        
        // Verify configuration is reflected visually
        await expect(fieldSelector1).toContainText('name');
        await expect(operator1).toContainText('contains');
        await expect(valueInput1).toContainText('John');
      });

      await test.step('Test auto-connection and smart routing', async () => {
        // Drag a new component near existing ones
        const newOperator = page.locator('[data-testid="component-logical-xor"]');
        const canvas = page.locator('[data-testid="filter-builder-canvas"]');
        
        // Drop near existing components to test auto-connection
        await newOperator.dragTo(canvas, { targetPosition: { x: 300, y: 350 } });
        
        // Verify smart connection suggestions appear
        const connectionSuggestions = page.locator('[data-testid="connection-suggestions"]');
        await expect(connectionSuggestions).toBeVisible();
        
        // Accept suggested connection
        await page.locator('[data-testid="accept-connection-suggestion"]').click();
        
        // Verify connection is established
        const newConnection = page.locator('[data-testid*="filter-connection-xor"]');
        await expect(newConnection).toBeVisible();
      });
    });

    test('should support advanced component operations', async () => {
      await test.step('Test component grouping and ungrouping', async () => {
        await page.locator('[data-testid="multi-filter-builder"]').click();
        await testHelper.waitForElement('[data-testid="filter-builder-canvas"]', 5000);
        
        // Create multiple components
        const canvas = page.locator('[data-testid="filter-builder-canvas"]');
        const components = ['field-selector', 'operator', 'value-input'];
        
        for (let i = 0; i < components.length; i++) {
          const component = page.locator(`[data-testid="component-${components[i]}"]`);
          await component.dragTo(canvas, { targetPosition: { x: 200 + i * 100, y: 150 } });
        }
        
        // Select multiple components
        await page.keyboard.down('Control');
        for (let i = 1; i <= 3; i++) {
          await page.locator(`[data-testid="canvas-component-${i}"]`).click();
        }
        await page.keyboard.up('Control');
        
        // Group selected components
        await page.locator('[data-testid="group-selected-components"]').click();
        
        // Verify group was created
        const componentGroup = page.locator('[data-testid="component-group-1"]');
        await expect(componentGroup).toBeVisible();
        
        // Test ungrouping
        await componentGroup.click({ button: 'right' });
        await page.locator('[data-testid="ungroup-components"]').click();
        
        // Verify components are ungrouped
        expect(await page.locator('[data-testid^="canvas-component-"]').count()).toBe(3);
      });

      await test.step('Test component templates and reusability', async () => {
        // Create a reusable component template
        const canvas = page.locator('[data-testid="filter-builder-canvas"]');
        
        // Build common pattern: field equals value
        const fieldSelector = page.locator('[data-testid="component-field-selector"]');
        await fieldSelector.dragTo(canvas, { targetPosition: { x: 200, y: 100 } });
        
        const operator = page.locator('[data-testid="component-operator"]');
        await operator.dragTo(canvas, { targetPosition: { x: 300, y: 100 } });
        
        const valueInput = page.locator('[data-testid="component-value-input"]');
        await valueInput.dragTo(canvas, { targetPosition: { x: 400, y: 100 } });
        
        // Select all and save as template
        await page.keyboard.press('Control+a');
        await page.locator('[data-testid="save-as-template"]').click();
        
        await page.fill('[data-testid="template-name"]', 'Field Equals Value');
        await page.fill('[data-testid="template-description"]', 'Basic field equality check');
        await page.locator('[data-testid="save-template-confirm"]').click();
        
        // Verify template is saved
        const templateSuccess = page.locator('[data-testid="template-save-success"]');
        await expect(templateSuccess).toBeVisible();
        
        // Clear canvas and apply template
        await page.locator('[data-testid="clear-canvas"]').click();
        await page.locator('[data-testid="template-library"]').click();
        await page.locator('[data-testid="template-field-equals-value"]').click();
        await page.locator('[data-testid="apply-template"]').click();
        
        // Verify template was applied
        expect(await page.locator('[data-testid^="canvas-component-"]').count()).toBe(3);
      });
    });
  });

  test.describe('Natural Language Query Processing', () => {
    
    test('should parse and execute natural language queries', async () => {
      await test.step('Enable natural language processor', async () => {
        await page.locator('[data-testid="natural-language-filter"]').click();
        
        const nlpPanel = page.locator('[data-testid="nlp-filter-panel"]');
        await expect(nlpPanel).toBeVisible();
        
        // Verify NLP engine is ready
        const nlpStatus = page.locator('[data-testid="nlp-engine-status"]');
        await expect(nlpStatus).toContainText('Ready');
      });

      await test.step('Test simple natural language queries', async () => {
        const simpleQueries = [
          {
            query: 'show all employees with salary greater than 75000',
            expected: { field: 'salary', operator: 'greaterThan', value: '75000' }
          },
          {
            query: 'find customers from New York or California',
            expected: { field: 'state', operator: 'in', values: ['New York', 'California'] }
          },
          {
            query: 'display records where status is not completed',
            expected: { field: 'status', operator: 'notEquals', value: 'completed' }
          },
          {
            query: 'get all orders between January and March 2024',
            expected: { field: 'orderDate', operator: 'between', values: ['2024-01-01', '2024-03-31'] }
          }
        ];

        for (const { query, expected } of simpleQueries) {
          const startTime = Date.now();
          
          await page.fill('[data-testid="nlp-query-input"]', query);
          await page.locator('[data-testid="process-nlp-query"]').click();
          
          await testHelper.waitForElement('[data-testid="nlp-processing-complete"]', 5000);
          const processingTime = Date.now() - startTime;
          
          expect(processingTime).toBeLessThan(3000); // Should process quickly
          
          // Verify query parsing
          const parsedQuery = page.locator('[data-testid="parsed-query-display"]');
          const queryStructure = await parsedQuery.getAttribute('data-structure');
          const parsed = JSON.parse(queryStructure || '{}');
          
          expect(parsed.field).toBe(expected.field);
          expect(parsed.operator).toBe(expected.operator);
          
          // Apply parsed filter
          await page.locator('[data-testid="apply-nlp-filter"]').click();
          await testHelper.waitForElement('[data-testid="filter-results"]', 3000);
          
          const resultCount = await gridHelper.getVisibleRowCount();
          expect(resultCount).toBeGreaterThan(0);
          expect(resultCount).toBeLessThan(50000); // Should be filtered
          
          // Clear for next query
          await page.locator('[data-testid="clear-nlp-filter"]').click();
        }
      });

      await test.step('Test complex natural language queries', async () => {
        const complexQueries = [
          'show employees in engineering department with salary above average and performance rating excellent',
          'find customers who placed orders in the last 30 days but have not made any payments',
          'display products with low inventory that are in high demand categories but not on sale',
          'get all invoices that are overdue by more than 60 days and have amount greater than 10000'
        ];

        for (const query of complexQueries) {
          const startTime = Date.now();
          
          await page.fill('[data-testid="nlp-query-input"]', query);
          await page.locator('[data-testid="process-nlp-query"]').click();
          
          await testHelper.waitForElement('[data-testid="nlp-processing-complete"]', 10000);
          const processingTime = Date.now() - startTime;
          
          expect(processingTime).toBeLessThan(8000);
          
          // Verify complex query structure
          const parsedQuery = page.locator('[data-testid="parsed-query-display"]');
          const queryStructure = await parsedQuery.getAttribute('data-structure');
          const parsed = JSON.parse(queryStructure || '{}');
          
          expect(parsed.conditions).toBeDefined();
          expect(parsed.conditions.length).toBeGreaterThan(1); // Multi-condition
          expect(parsed.logic).toBeDefined(); // Should have logical operators
          
          // Test query execution
          await page.locator('[data-testid="apply-nlp-filter"]').click();
          await testHelper.waitForElement('[data-testid="filter-results"]', 5000);
          
          const resultCount = await gridHelper.getVisibleRowCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
        }
      });

      await test.step('Test query refinement and suggestions', async () => {
        // Test ambiguous query
        await page.fill('[data-testid="nlp-query-input"]', 'show high value customers');
        await page.locator('[data-testid="process-nlp-query"]').click();
        
        // Should show clarification options
        const clarificationPanel = page.locator('[data-testid="nlp-clarification-panel"]');
        await expect(clarificationPanel).toBeVisible();
        
        const clarificationOptions = page.locator('[data-testid^="clarification-option-"]');
        expect(await clarificationOptions.count()).toBeGreaterThan(1);
        
        // Select clarification
        await clarificationOptions.first().click();
        
        // Should refine the query
        const refinedQuery = page.locator('[data-testid="refined-query"]');
        await expect(refinedQuery).toBeVisible();
        
        const refinedText = await refinedQuery.textContent();
        expect(refinedText).toContain('total_purchases > ');
      });

      await test.step('Test multi-language support', async () => {
        const multilingualQueries = [
          { lang: 'es', query: 'mostrar todos los empleados con salario mayor que 50000' },
          { lang: 'fr', query: 'afficher tous les clients de Paris avec commandes récentes' },
          { lang: 'de', query: 'zeige alle Produkte mit niedrigem Lagerbestand' }
        ];

        for (const { lang, query } of multilingualQueries) {
          await page.locator('[data-testid="nlp-language-selector"]').selectOption(lang);
          
          await page.fill('[data-testid="nlp-query-input"]', query);
          await page.locator('[data-testid="process-nlp-query"]').click();
          
          await testHelper.waitForElement('[data-testid="nlp-processing-complete"]', 5000);
          
          // Should successfully parse non-English queries
          const parsedQuery = page.locator('[data-testid="parsed-query-display"]');
          const queryStructure = await parsedQuery.getAttribute('data-structure');
          const parsed = JSON.parse(queryStructure || '{}');
          
          expect(parsed.field).toBeDefined();
          expect(parsed.operator).toBeDefined();
        }
      });
    });
  });

  test.describe('Advanced Logical Operators (XOR, NAND, NOR)', () => {
    
    test('should support extended logical operator set', async () => {
      await test.step('Test XOR (Exclusive OR) operations', async () => {
        await page.locator('[data-testid="advanced-filter-builder"]').click();
        
        // Build XOR condition: (Status = 'Active' XOR Priority = 'High')
        // This should match records that are either Active OR High priority, but not both
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-1"]', 'status');
        await page.selectOption('[data-testid="condition-operator-1"]', 'equals');
        await page.fill('[data-testid="condition-value-1"]', 'Active');
        
        await page.locator('[data-testid="add-logical-operator"]').click();
        await page.selectOption('[data-testid="logical-operator-1"]', 'XOR');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-2"]', 'priority');
        await page.selectOption('[data-testid="condition-operator-2"]', 'equals');
        await page.fill('[data-testid="condition-value-2"]', 'High');
        
        await page.locator('[data-testid="apply-advanced-filter"]').click();
        await testHelper.waitForElement('[data-testid="filter-results"]', 3000);
        
        // Verify XOR logic: should not include records that are both Active AND High priority
        const results = await gridHelper.getVisibleRowCount();
        expect(results).toBeGreaterThan(0);
        
        // Check some results to verify XOR logic
        for (let i = 0; i < Math.min(5, results); i++) {
          const statusCell = await gridHelper.getCellText(i, 'status');
          const priorityCell = await gridHelper.getCellText(i, 'priority');
          
          // Should be (Active AND not High) OR (High AND not Active)
          const isActive = statusCell === 'Active';
          const isHigh = priorityCell === 'High';
          expect(isActive !== isHigh).toBe(true); // XOR condition
        }
      });

      await test.step('Test NAND (Not AND) operations', async () => {
        await page.locator('[data-testid="clear-advanced-filter"]').click();
        
        // Build NAND condition: NOT (Department = 'IT' AND Salary > 80000)
        // This should exclude records that are both IT department AND high salary
        
        await page.locator('[data-testid="add-logical-operator"]').click();
        await page.selectOption('[data-testid="logical-operator-root"]', 'NAND');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-1"]', 'department');
        await page.selectOption('[data-testid="condition-operator-1"]', 'equals');
        await page.fill('[data-testid="condition-value-1"]', 'IT');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-2"]', 'salary');
        await page.selectOption('[data-testid="condition-operator-2"]', 'greaterThan');
        await page.fill('[data-testid="condition-value-2"]', '80000');
        
        await page.locator('[data-testid="apply-advanced-filter"]').click();
        await testHelper.waitForElement('[data-testid="filter-results"]', 3000);
        
        // Verify NAND logic
        const results = await gridHelper.getVisibleRowCount();
        expect(results).toBeGreaterThan(0);
        
        // Check that no results have both IT department AND salary > 80000
        for (let i = 0; i < Math.min(10, results); i++) {
          const deptCell = await gridHelper.getCellText(i, 'department');
          const salaryCell = await gridHelper.getCellText(i, 'salary');
          const salary = parseFloat(salaryCell.replace(/[$,]/g, ''));
          
          // Should NOT be (IT AND salary > 80000)
          const isIT = deptCell === 'IT';
          const isHighSalary = salary > 80000;
          expect(isIT && isHighSalary).toBe(false); // NAND condition
        }
      });

      await test.step('Test NOR (Not OR) operations', async () => {
        await page.locator('[data-testid="clear-advanced-filter"]').click();
        
        // Build NOR condition: NOT (Status = 'Inactive' OR Priority = 'Low')
        // This should exclude records that are either Inactive OR Low priority
        
        await page.locator('[data-testid="add-logical-operator"]').click();
        await page.selectOption('[data-testid="logical-operator-root"]', 'NOR');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-1"]', 'status');
        await page.selectOption('[data-testid="condition-operator-1"]', 'equals');
        await page.fill('[data-testid="condition-value-1"]', 'Inactive');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-2"]', 'priority');
        await page.selectOption('[data-testid="condition-operator-2"]', 'equals');
        await page.fill('[data-testid="condition-value-2"]', 'Low');
        
        await page.locator('[data-testid="apply-advanced-filter"]').click();
        await testHelper.waitForElement('[data-testid="filter-results"]', 3000);
        
        // Verify NOR logic
        const results = await gridHelper.getVisibleRowCount();
        expect(results).toBeGreaterThan(0);
        
        // Check that no results are either Inactive OR Low priority
        for (let i = 0; i < Math.min(10, results); i++) {
          const statusCell = await gridHelper.getCellText(i, 'status');
          const priorityCell = await gridHelper.getCellText(i, 'priority');
          
          // Should NOT be (Inactive OR Low priority)
          const isInactive = statusCell === 'Inactive';
          const isLowPriority = priorityCell === 'Low';
          expect(isInactive || isLowPriority).toBe(false); // NOR condition
        }
      });

      await test.step('Test complex nested logical operations', async () => {
        await page.locator('[data-testid="clear-advanced-filter"]').click();
        
        // Build complex nested condition:
        // (A AND B) XOR (C OR D) NAND (E NOR F)
        // Where: A=Status='Active', B=Dept='Sales', C=Salary>50K, D=Experience>5, E=Priority='Low', F=Region='West'
        
        // Create first group: (Status='Active' AND Department='Sales')
        await page.locator('[data-testid="add-condition-group"]').click();
        await page.selectOption('[data-testid="group-logic-1"]', 'AND');
        
        await page.locator('[data-testid="add-condition-to-group-1"]').click();
        await page.selectOption('[data-testid="group-1-field-1"]', 'status');
        await page.selectOption('[data-testid="group-1-operator-1"]', 'equals');
        await page.fill('[data-testid="group-1-value-1"]', 'Active');
        
        await page.locator('[data-testid="add-condition-to-group-1"]').click();
        await page.selectOption('[data-testid="group-1-field-2"]', 'department');
        await page.selectOption('[data-testid="group-1-operator-2"]', 'equals');
        await page.fill('[data-testid="group-1-value-2"]', 'Sales');
        
        // Add XOR between groups
        await page.locator('[data-testid="add-inter-group-logic"]').click();
        await page.selectOption('[data-testid="inter-group-logic-1"]', 'XOR');
        
        // Create second group: (Salary > 50000 OR Experience > 5)
        await page.locator('[data-testid="add-condition-group"]').click();
        await page.selectOption('[data-testid="group-logic-2"]', 'OR');
        
        await page.locator('[data-testid="add-condition-to-group-2"]').click();
        await page.selectOption('[data-testid="group-2-field-1"]', 'salary');
        await page.selectOption('[data-testid="group-2-operator-1"]', 'greaterThan');
        await page.fill('[data-testid="group-2-value-1"]', '50000');
        
        await page.locator('[data-testid="add-condition-to-group-2"]').click();
        await page.selectOption('[data-testid="group-2-field-2"]', 'experience');
        await page.selectOption('[data-testid="group-2-operator-2"]', 'greaterThan');
        await page.fill('[data-testid="group-2-value-2"]', '5');
        
        // Apply complex filter
        await page.locator('[data-testid="apply-advanced-filter"]').click();
        await testHelper.waitForElement('[data-testid="filter-results"]', 5000);
        
        const results = await gridHelper.getVisibleRowCount();
        expect(results).toBeGreaterThan(0);
        
        // Verify the complex logic is working
        const filterSummary = page.locator('[data-testid="active-filter-summary"]');
        await expect(filterSummary).toContainText('Complex multi-condition filter active');
      });
    });

    test('should provide visual representation of logical operations', async () => {
      await test.step('Test logical operator visualization', async () => {
        await page.locator('[data-testid="visual-logic-builder"]').click();
        
        // Build visual logical circuit
        const canvas = page.locator('[data-testid="logic-circuit-canvas"]');
        
        // Add logic gates
        const andGate = page.locator('[data-testid="logic-gate-AND"]');
        await andGate.dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
        
        const orGate = page.locator('[data-testid="logic-gate-OR"]');
        await orGate.dragTo(canvas, { targetPosition: { x: 500, y: 200 } });
        
        const xorGate = page.locator('[data-testid="logic-gate-XOR"]');
        await xorGate.dragTo(canvas, { targetPosition: { x: 700, y: 200 } });
        
        // Add input conditions
        const input1 = page.locator('[data-testid="logic-input"]');
        await input1.dragTo(canvas, { targetPosition: { x: 100, y: 150 } });
        
        const input2 = page.locator('[data-testid="logic-input"]');
        await input2.dragTo(canvas, { targetPosition: { x: 100, y: 250 } });
        
        // Verify gates are visually distinct
        const andGateCanvas = page.locator('[data-testid="canvas-and-gate-1"]');
        const orGateCanvas = page.locator('[data-testid="canvas-or-gate-1"]');
        const xorGateCanvas = page.locator('[data-testid="canvas-xor-gate-1"]');
        
        // Each should have different visual representation
        await expect(andGateCanvas).toHaveClass(/and-gate/);
        await expect(orGateCanvas).toHaveClass(/or-gate/);
        await expect(xorGateCanvas).toHaveClass(/xor-gate/);
        
        // Test truth table display
        await andGateCanvas.click();
        const truthTable = page.locator('[data-testid="truth-table-AND"]');
        await expect(truthTable).toBeVisible();
        
        // Verify truth table content
        const truthTableRows = truthTable.locator('tr');
        expect(await truthTableRows.count()).toBe(5); // Header + 4 combinations
      });
    });
  });

  test.describe('Formula Editor with Syntax Highlighting', () => {
    
    test('should provide advanced formula editing capabilities', async () => {
      await test.step('Open formula editor', async () => {
        await page.locator('[data-testid="formula-filter-mode"]').click();
        
        const formulaEditor = page.locator('[data-testid="formula-editor"]');
        await expect(formulaEditor).toBeVisible();
        
        // Verify syntax highlighting is active
        const syntaxHighlighter = page.locator('[data-testid="syntax-highlighter"]');
        await expect(syntaxHighlighter).toBeVisible();
      });

      await test.step('Test basic formula syntax and highlighting', async () => {
        const formulas = [
          {
            formula: 'SUM(salary) > 100000',
            expectedHighlights: ['SUM', 'salary', '>', '100000']
          },
          {
            formula: 'AVG(performance_rating) >= 4.0 AND COUNT(projects) > 5',
            expectedHighlights: ['AVG', 'AND', 'COUNT', '>=']
          },
          {
            formula: 'IF(department == "Sales", revenue * 0.1, revenue * 0.05) > 1000',
            expectedHighlights: ['IF', '==', '*']
          }
        ];

        for (const { formula, expectedHighlights } of formulas) {
          await page.fill('[data-testid="formula-input"]', formula);
          await page.waitForTimeout(500); // Allow syntax highlighting to process
          
          // Verify syntax highlighting
          for (const highlight of expectedHighlights) {
            const highlightedElement = page.locator(`[data-testid="syntax-highlight"][data-token="${highlight}"]`);
            await expect(highlightedElement).toBeVisible();
          }
          
          // Verify no syntax errors
          const syntaxErrors = page.locator('[data-testid="syntax-error"]');
          expect(await syntaxErrors.count()).toBe(0);
          
          await page.fill('[data-testid="formula-input"]', '');
        }
      });

      await test.step('Test autocomplete and IntelliSense', async () => {
        // Start typing a function name
        await page.fill('[data-testid="formula-input"]', 'SU');
        
        // Verify autocomplete appears
        const autocomplete = page.locator('[data-testid="formula-autocomplete"]');
        await expect(autocomplete).toBeVisible();
        
        // Verify suggestions
        const suggestions = page.locator('[data-testid^="autocomplete-suggestion-"]');
        const suggestionTexts = await suggestions.allTextContents();
        expect(suggestionTexts).toContain('SUM');
        expect(suggestionTexts).toContain('SUBTRACT');
        
        // Select suggestion
        await page.locator('[data-testid="autocomplete-suggestion-SUM"]').click();
        
        // Verify function is inserted with parameters
        const formulaValue = await page.locator('[data-testid="formula-input"]').inputValue();
        expect(formulaValue).toBe('SUM(');
        
        // Type field name and verify field autocomplete
        await page.type('[data-testid="formula-input"]', 'sal');
        
        const fieldSuggestions = page.locator('[data-testid^="field-suggestion-"]');
        const fieldTexts = await fieldSuggestions.allTextContents();
        expect(fieldTexts).toContain('salary');
        expect(fieldTexts).toContain('sales_total');
        
        await page.locator('[data-testid="field-suggestion-salary"]').click();
        
        const finalValue = await page.locator('[data-testid="formula-input"]').inputValue();
        expect(finalValue).toBe('SUM(salary');
      });

      await test.step('Test formula validation and error reporting', async () => {
        const invalidFormulas = [
          {
            formula: 'SUM(nonexistent_field) > 100',
            expectedError: 'Unknown field: nonexistent_field'
          },
          {
            formula: 'salary > "invalid_comparison"',
            expectedError: 'Type mismatch: cannot compare number to string'
          },
          {
            formula: 'IF(status == "Active")',
            expectedError: 'IF function requires 3 arguments'
          },
          {
            formula: 'salary + department',
            expectedError: 'Cannot perform arithmetic on mixed types'
          }
        ];

        for (const { formula, expectedError } of invalidFormulas) {
          await page.fill('[data-testid="formula-input"]', formula);
          await page.locator('[data-testid="validate-formula"]').click();
          
          // Verify error is shown
          const errorDisplay = page.locator('[data-testid="formula-error"]');
          await expect(errorDisplay).toBeVisible();
          
          const errorText = await errorDisplay.textContent();
          expect(errorText).toContain(expectedError);
          
          // Verify error highlighting in editor
          const errorHighlight = page.locator('[data-testid="error-highlight"]');
          await expect(errorHighlight).toBeVisible();
          
          await page.fill('[data-testid="formula-input"]', '');
        }
      });

      await test.step('Test advanced formula functions', async () => {
        const advancedFormulas = [
          {
            name: 'Statistical Analysis',
            formula: 'PERCENTILE(salary, 0.95) < salary AND STDEV(performance) < 1.0'
          },
          {
            name: 'Date Calculations',
            formula: 'DATEDIFF(TODAY(), hire_date) > 365 AND MONTH(last_review) == MONTH(TODAY())'
          },
          {
            name: 'String Operations',
            formula: 'REGEX_MATCH(email, "^[a-zA-Z0-9._%+-]+@company\\.com$") AND LENGTH(name) > 5'
          },
          {
            name: 'Conditional Aggregation',
            formula: 'SUMIF(department, "Engineering", salary) / COUNTIF(department, "Engineering") > 80000'
          }
        ];

        for (const { name, formula } of advancedFormulas) {
          await page.fill('[data-testid="formula-input"]', formula);
          await page.locator('[data-testid="validate-formula"]').click();
          
          // Should validate successfully
          const validationSuccess = page.locator('[data-testid="formula-valid"]');
          await expect(validationSuccess).toBeVisible();
          
          // Test execution
          await page.locator('[data-testid="execute-formula"]').click();
          await testHelper.waitForElement('[data-testid="formula-results"]', 5000);
          
          const results = await gridHelper.getVisibleRowCount();
          expect(results).toBeGreaterThanOrEqual(0);
          
          // Capture screenshot of complex formula
          await page.screenshot({
            path: `e2e/screenshots/formula-${name.replace(/\s/g, '-').toLowerCase()}.png`,
            clip: { x: 0, y: 0, width: 800, height: 400 }
          });
          
          await page.locator('[data-testid="clear-formula"]').click();
        }
      });
    });

    test('should support formula library and custom functions', async () => {
      await test.step('Browse formula library', async () => {
        await page.locator('[data-testid="formula-library"]').click();
        
        const libraryPanel = page.locator('[data-testid="formula-library-panel"]');
        await expect(libraryPanel).toBeVisible();
        
        // Verify categories
        const categories = page.locator('[data-testid^="formula-category-"]');
        const categoryNames = await categories.allTextContents();
        expect(categoryNames).toContain('Math & Statistics');
        expect(categoryNames).toContain('Date & Time');
        expect(categoryNames).toContain('Text & String');
        expect(categoryNames).toContain('Logical');
        
        // Browse math category
        await page.locator('[data-testid="formula-category-math"]').click();
        
        const mathFunctions = page.locator('[data-testid^="formula-function-"]');
        expect(await mathFunctions.count()).toBeGreaterThan(10);
        
        // Test function documentation
        await mathFunctions.first().hover();
        const documentation = page.locator('[data-testid="function-documentation"]');
        await expect(documentation).toBeVisible();
        
        const docContent = await documentation.textContent();
        expect(docContent).toContain('Parameters:');
        expect(docContent).toContain('Example:');
      });

      await test.step('Create custom formula function', async () => {
        await page.locator('[data-testid="create-custom-function"]').click();
        
        // Define custom function
        await page.fill('[data-testid="function-name"]', 'PROFIT_MARGIN');
        await page.fill('[data-testid="function-parameters"]', 'revenue, costs');
        await page.fill('[data-testid="function-body"]', '(revenue - costs) / revenue * 100');
        await page.fill('[data-testid="function-description"]', 'Calculates profit margin as percentage');
        
        await page.locator('[data-testid="save-custom-function"]').click();
        
        // Verify function is available
        const customFunctions = page.locator('[data-testid="formula-category-custom"]');
        await customFunctions.click();
        
        const profitMarginFunction = page.locator('[data-testid="formula-function-PROFIT_MARGIN"]');
        await expect(profitMarginFunction).toBeVisible();
        
        // Test custom function usage
        await profitMarginFunction.click();
        
        const formulaInput = await page.locator('[data-testid="formula-input"]').inputValue();
        expect(formulaInput).toBe('PROFIT_MARGIN(revenue, costs)');
        
        // Validate and execute
        await page.locator('[data-testid="validate-formula"]').click();
        await expect(page.locator('[data-testid="formula-valid"]')).toBeVisible();
      });
    });
  });

  test.describe('Real-Time Preview', () => {
    
    test('should provide live preview of filter results', async () => {
      await test.step('Enable real-time preview', async () => {
        await page.locator('[data-testid="enable-real-time-preview"]').click();
        
        const previewPanel = page.locator('[data-testid="filter-preview-panel"]');
        await expect(previewPanel).toBeVisible();
        
        // Verify preview settings
        const previewSettings = page.locator('[data-testid="preview-settings"]');
        await previewSettings.click();
        
        await page.locator('[data-testid="preview-update-delay"]').fill('300'); // 300ms delay
        await page.locator('[data-testid="preview-sample-size"]').fill('100'); // Show 100 sample results
        await page.locator('[data-testid="apply-preview-settings"]').click();
      });

      await test.step('Test live preview updates', async () => {
        await page.locator('[data-testid="advanced-filter-builder"]').click();
        
        // Start building filter
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-1"]', 'salary');
        
        // Preview should update as we build
        const previewResults = page.locator('[data-testid="preview-results"]');
        await expect(previewResults).toContainText('All records'); // No filter yet
        
        // Add operator
        await page.selectOption('[data-testid="condition-operator-1"]', 'greaterThan');
        await expect(previewResults).toContainText('All records'); // Still no value
        
        // Add value - should trigger preview update
        const startTime = Date.now();
        await page.fill('[data-testid="condition-value-1"]', '50000');
        
        await testHelper.waitForElement('[data-testid="preview-updated"]', 1000);
        const updateTime = Date.now() - startTime;
        
        expect(updateTime).toBeLessThan(800); // Should update quickly
        
        // Verify preview shows filtered count
        const previewText = await previewResults.textContent();
        expect(previewText).toMatch(/\d+ records match/);
        
        // Verify preview grid shows sample results
        const previewGrid = page.locator('[data-testid="preview-grid"]');
        await expect(previewGrid).toBeVisible();
        
        const previewRows = previewGrid.locator('[data-testid^="preview-row-"]');
        expect(await previewRows.count()).toBeGreaterThan(0);
        expect(await previewRows.count()).toBeLessThanOrEqual(100); // Respects sample size
      });

      await test.step('Test preview with complex filters', async () => {
        // Clear and build complex filter
        await page.locator('[data-testid="clear-advanced-filter"]').click();
        
        // Build: (Salary > 50000 AND Department = 'Engineering') OR (Salary > 80000)
        await page.locator('[data-testid="add-condition-group"]').click();
        
        // First condition in group
        await page.locator('[data-testid="add-condition-to-group-1"]').click();
        await page.selectOption('[data-testid="group-1-field-1"]', 'salary');
        await page.selectOption('[data-testid="group-1-operator-1"]', 'greaterThan');
        await page.fill('[data-testid="group-1-value-1"]', '50000');
        
        // Preview should update
        await testHelper.waitForElement('[data-testid="preview-updated"]', 1000);
        const firstCount = await page.locator('[data-testid="preview-count"]').textContent();
        
        // Add AND condition to group
        await page.selectOption('[data-testid="group-1-logic"]', 'AND');
        await page.locator('[data-testid="add-condition-to-group-1"]').click();
        await page.selectOption('[data-testid="group-1-field-2"]', 'department');
        await page.selectOption('[data-testid="group-1-operator-2"]', 'equals');
        await page.fill('[data-testid="group-1-value-2"]', 'Engineering');
        
        // Preview should update with more restrictive filter
        await testHelper.waitForElement('[data-testid="preview-updated"]', 1000);
        const secondCount = await page.locator('[data-testid="preview-count"]').textContent();
        
        // Second count should be less than first (more restrictive)
        const first = parseInt(firstCount?.match(/\d+/)?.[0] || '0');
        const second = parseInt(secondCount?.match(/\d+/)?.[0] || '0');
        expect(second).toBeLessThanOrEqual(first);
        
        // Add OR condition
        await page.locator('[data-testid="add-inter-group-logic"]').click();
        await page.selectOption('[data-testid="inter-group-logic-1"]', 'OR');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-2"]', 'salary');
        await page.selectOption('[data-testid="condition-operator-2"]', 'greaterThan');
        await page.fill('[data-testid="condition-value-2"]', '80000');
        
        // Preview should update with broader filter
        await testHelper.waitForElement('[data-testid="preview-updated"]', 1000);
        const thirdCount = await page.locator('[data-testid="preview-count"]').textContent();
        
        // Third count should be greater than second (broader filter)
        const third = parseInt(thirdCount?.match(/\d+/)?.[0] || '0');
        expect(third).toBeGreaterThanOrEqual(second);
      });

      await test.step('Test preview performance monitoring', async () => {
        // Test preview with large result set
        await page.locator('[data-testid="clear-advanced-filter"]').click();
        
        // Create broad filter that matches many records
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-1"]', 'salary');
        await page.selectOption('[data-testid="condition-operator-1"]', 'greaterThan');
        
        const startTime = Date.now();
        await page.fill('[data-testid="condition-value-1"]', '1000'); // Very broad filter
        
        await testHelper.waitForElement('[data-testid="preview-updated"]', 2000);
        const previewTime = Date.now() - startTime;
        
        // Even with large result set, preview should be fast
        expect(previewTime).toBeLessThan(1500);
        
        // Verify performance warning if needed
        const performanceWarning = page.locator('[data-testid="preview-performance-warning"]');
        const warningVisible = await performanceWarning.isVisible();
        
        if (warningVisible) {
          const warningText = await performanceWarning.textContent();
          expect(warningText).toContain('large result set');
        }
      });

      await test.step('Test preview customization options', async () => {
        // Customize preview display
        await page.locator('[data-testid="preview-settings"]').click();
        
        // Enable statistical preview
        await page.locator('[data-testid="show-preview-stats"]').check();
        
        // Select preview columns
        await page.locator('[data-testid="preview-columns"]').click();
        await page.locator('[data-testid="preview-column-name"]').check();
        await page.locator('[data-testid="preview-column-salary"]').check();
        await page.locator('[data-testid="preview-column-department"]').check();
        
        await page.locator('[data-testid="apply-preview-settings"]').click();
        
        // Verify customized preview
        const previewGrid = page.locator('[data-testid="preview-grid"]');
        const columns = previewGrid.locator('[data-testid^="preview-column-header-"]');
        expect(await columns.count()).toBe(3);
        
        // Verify statistics panel
        const statsPanel = page.locator('[data-testid="preview-statistics"]');
        await expect(statsPanel).toBeVisible();
        
        const statItems = statsPanel.locator('[data-testid^="stat-"]');
        expect(await statItems.count()).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Performance Optimization', () => {
    
    test('should handle large datasets efficiently', async () => {
      await test.step('Test performance with 100k+ records', async () => {
        await page.goto('/grid-demo?dataset=performance&rows=100000&cols=50');
        await testHelper.waitForElement('[data-testid="grid-container"]', 15000);
        
        // Enable performance monitoring
        await page.locator('[data-testid="enable-performance-monitor"]').click();
        
        const startTime = Date.now();
        
        // Apply complex multi-filter
        await page.locator('[data-testid="multi-filter-builder"]').click();
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-1"]', 'revenue');
        await page.selectOption('[data-testid="condition-operator-1"]', 'greaterThan');
        await page.fill('[data-testid="condition-value-1"]', '50000');
        
        await page.locator('[data-testid="add-logical-operator"]').click();
        await page.selectOption('[data-testid="logical-operator-1"]', 'AND');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.selectOption('[data-testid="condition-field-2"]', 'department');
        await page.selectOption('[data-testid="condition-operator-2"]', 'in');
        await page.fill('[data-testid="condition-value-2"]', 'Engineering,Sales,Marketing');
        
        await page.locator('[data-testid="apply-multi-filter"]').click();
        await testHelper.waitForElement('[data-testid="filter-results"]', 10000);
        
        const filterTime = Date.now() - startTime;
        expect(filterTime).toBeLessThan(8000); // Should complete within 8 seconds
        
        // Verify results
        const resultCount = await gridHelper.getVisibleRowCount();
        expect(resultCount).toBeGreaterThan(0);
        expect(resultCount).toBeLessThan(100000);
        
        // Check performance metrics
        const perfMetrics = page.locator('[data-testid="performance-metrics"]');
        const metricsText = await perfMetrics.textContent();
        expect(metricsText).toContain('Filter execution time:');
        expect(metricsText).toContain('Memory usage:');
      });

      await test.step('Test filter indexing and optimization', async () => {
        // Enable advanced indexing
        await page.locator('[data-testid="filter-optimization-settings"]').click();
        await page.locator('[data-testid="enable-column-indexing"]').check();
        await page.locator('[data-testid="enable-query-caching"]').check();
        await page.locator('[data-testid="apply-optimization-settings"]').click();
        
        // Apply same filter multiple times to test caching
        const cachedQueries = [
          { field: 'salary', operator: 'between', value: '40000,80000' },
          { field: 'department', operator: 'equals', value: 'Engineering' },
          { field: 'status', operator: 'in', value: 'Active,Pending' }
        ];

        for (const query of cachedQueries) {
          // First execution (should build cache)
          const startTime1 = Date.now();
          await page.locator('[data-testid="quick-filter-field"]').selectOption(query.field);
          await page.locator('[data-testid="quick-filter-operator"]').selectOption(query.operator);
          await page.fill('[data-testid="quick-filter-value"]', query.value);
          await page.locator('[data-testid="apply-quick-filter"]').click();
          
          await testHelper.waitForElement('[data-testid="filter-results"]', 5000);
          const firstExecution = Date.now() - startTime1;
          
          // Second execution (should use cache)
          await page.locator('[data-testid="clear-quick-filter"]').click();
          
          const startTime2 = Date.now();
          await page.locator('[data-testid="quick-filter-field"]').selectOption(query.field);
          await page.locator('[data-testid="quick-filter-operator"]').selectOption(query.operator);
          await page.fill('[data-testid="quick-filter-value"]', query.value);
          await page.locator('[data-testid="apply-quick-filter"]').click();
          
          await testHelper.waitForElement('[data-testid="filter-results"]', 5000);
          const secondExecution = Date.now() - startTime2;
          
          // Second execution should be faster due to caching
          expect(secondExecution).toBeLessThan(firstExecution);
          
          await page.locator('[data-testid="clear-quick-filter"]').click();
        }
      });

      await test.step('Test memory usage optimization', async () => {
        const initialMemory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        
        // Apply and clear multiple complex filters
        for (let i = 0; i < 10; i++) {
          await page.locator('[data-testid="complex-filter-preset-1"]').click();
          await page.locator('[data-testid="apply-preset"]').click();
          await testHelper.waitForElement('[data-testid="filter-results"]', 3000);
          
          await page.locator('[data-testid="clear-all-filters"]').click();
          await page.waitForTimeout(100);
        }
        
        // Force garbage collection if available
        await page.evaluate(() => {
          if ((window as any).gc) {
            (window as any).gc();
          }
        });
        
        const finalMemory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        
        // Memory growth should be minimal
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth
      });
    });

    test('should optimize filter execution strategies', async () => {
      await test.step('Test parallel filter execution', async () => {
        await page.locator('[data-testid="execution-strategy-settings"]').click();
        await page.locator('[data-testid="enable-parallel-execution"]').check();
        await page.locator('[data-testid="parallel-thread-count"]').fill('4');
        await page.locator('[data-testid="apply-execution-settings"]').click();
        
        // Apply multiple independent filters
        const independentFilters = [
          { field: 'name', operator: 'contains', value: 'Smith' },
          { field: 'age', operator: 'greaterThan', value: '25' },
          { field: 'salary', operator: 'between', value: '30000,100000' },
          { field: 'department', operator: 'in', value: 'IT,HR,Finance' }
        ];

        const startTime = Date.now();
        
        // Add all filters simultaneously
        for (let i = 0; i < independentFilters.length; i++) {
          await page.locator('[data-testid="add-parallel-filter"]').click();
          await page.selectOption(`[data-testid="parallel-field-${i}"]`, independentFilters[i].field);
          await page.selectOption(`[data-testid="parallel-operator-${i}"]`, independentFilters[i].operator);
          await page.fill(`[data-testid="parallel-value-${i}"]`, independentFilters[i].value);
        }
        
        await page.locator('[data-testid="execute-parallel-filters"]').click();
        await testHelper.waitForElement('[data-testid="parallel-execution-complete"]', 5000);
        
        const parallelTime = Date.now() - startTime;
        
        // Compare with sequential execution
        await page.locator('[data-testid="clear-all-filters"]').click();
        await page.locator('[data-testid="enable-parallel-execution"]').uncheck();
        
        const startTimeSeq = Date.now();
        
        for (let i = 0; i < independentFilters.length; i++) {
          await page.locator('[data-testid="add-sequential-filter"]').click();
          await page.selectOption(`[data-testid="sequential-field-${i}"]`, independentFilters[i].field);
          await page.selectOption(`[data-testid="sequential-operator-${i}"]`, independentFilters[i].operator);
          await page.fill(`[data-testid="sequential-value-${i}"]`, independentFilters[i].value);
          await page.locator('[data-testid="apply-sequential-filter"]').click();
          await page.waitForTimeout(100);
        }
        
        const sequentialTime = Date.now() - startTimeSeq;
        
        // Parallel should be faster for independent filters
        expect(parallelTime).toBeLessThan(sequentialTime);
      });
    });
  });

  test.afterEach(async () => {
    // Capture final performance metrics
    const finalMetrics = await page.evaluate(() => (window as any).multiFilterMetrics);
    
    console.log('Multi-Filter Performance:', {
      builderRenderTime: finalMetrics.builderRenderTime,
      queryProcessingTime: finalMetrics.queryProcessingTime,
      filterExecutionTime: finalMetrics.filterExecutionTime,
      previewUpdateTime: finalMetrics.previewUpdateTime
    });
    
    // Capture comprehensive screenshot
    await page.screenshot({
      path: `e2e/screenshots/multi-filters-${test.info().title.replace(/\s/g, '-').toLowerCase()}.png`,
      fullPage: true
    });
  });
});