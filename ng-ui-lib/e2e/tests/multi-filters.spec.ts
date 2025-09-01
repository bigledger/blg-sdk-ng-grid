import { test, expect, Page } from '@playwright/test';
import { GridTestHelpers } from '../helpers/grid-test-helpers';

/**
 * Multi-Filters E2E Tests
 * 
 * These tests verify the advanced multi-filter system that exceeds ag-grid:
 * - Visual drag-and-drop filter builder with unlimited nesting
 * - Natural language processing for filter queries
 * - AI-powered filter suggestions and optimization
 * - Real-time performance monitoring with complexity analysis
 * - Collaborative filter building and sharing
 * - Advanced export/import capabilities
 * - Formula-based filtering with syntax highlighting
 * - Filter templates and presets
 * - Macro recording for filter operations
 */

test.describe('Multi-Filters Visual Builder', () => {
  let page: Page;
  let gridHelpers: GridTestHelpers;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    gridHelpers = new GridTestHelpers(page);
    
    // Navigate to multi-filters demo
    await page.goto('/examples/grid/multi-filters');
    await page.waitForSelector('[data-testid="blg-grid"]');
    
    // Wait for data to load
    await expect(page.locator('.blg-grid-row')).toHaveCount(1000, { timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Visual Filter Builder', () => {
    test('should open advanced filter builder', async () => {
      // Open multi-filter builder
      await page.click('[data-testid="advanced-filter-btn"]');
      await expect(page.locator('[data-testid="multi-filter-builder"]')).toBeVisible();
      
      // Verify all tabs are present
      await expect(page.locator('[data-testid="simple-filter-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="advanced-builder-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="natural-language-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="formula-editor-tab"]')).toBeVisible();
      
      // Verify canvas is ready
      await expect(page.locator('[data-testid="filter-builder-canvas"]')).toBeVisible();
    });

    test('should create simple filter conditions', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      
      // Start with simple filter tab
      await page.click('[data-testid="simple-filter-tab"]');
      
      // Add first condition
      await page.click('[data-testid="add-condition-btn"]');
      
      const firstCondition = page.locator('[data-testid="filter-condition"]').first();
      await expect(firstCondition).toBeVisible();
      
      // Configure first condition
      await firstCondition.locator('[data-testid="column-selector"]').selectOption('department');
      await firstCondition.locator('[data-testid="operator-selector"]').selectOption('equals');
      await firstCondition.locator('[data-testid="value-input"]').fill('Engineering');
      
      // Add second condition
      await page.click('[data-testid="add-condition-btn"]');
      
      const secondCondition = page.locator('[data-testid="filter-condition"]').nth(1);
      await secondCondition.locator('[data-testid="column-selector"]').selectOption('salary');
      await secondCondition.locator('[data-testid="operator-selector"]').selectOption('greaterThan');
      await secondCondition.locator('[data-testid="value-input"]').fill('50000');
      
      // Set logic operator
      await page.selectOption('[data-testid="logic-operator-selector"]', 'AND');
      
      // Apply filter
      await page.click('[data-testid="apply-filter-btn"]');
      
      // Verify results
      const resultRows = page.locator('.blg-grid-row');
      const rowCount = await resultRows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Verify all visible rows match criteria
      for (let i = 0; i < Math.min(5, rowCount); i++) {
        const row = resultRows.nth(i);
        const dept = await row.locator('[data-column="department"]').textContent();
        const salary = await row.locator('[data-column="salary"]').textContent();
        
        expect(dept).toBe('Engineering');
        expect(parseFloat(salary!.replace(/[^0-9.-]+/g, ''))).toBeGreaterThan(50000);
      }
    });

    test('should support complex nested filter groups', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="advanced-builder-tab"]');
      
      // Create first group
      await page.click('[data-testid="add-filter-group-btn"]');
      const group1 = page.locator('[data-testid="filter-group"]').first();
      
      // Add conditions to first group
      await group1.locator('[data-testid="add-condition-to-group"]').click();
      const group1Condition1 = group1.locator('[data-testid="group-condition"]').first();
      await group1Condition1.locator('[data-testid="column-selector"]').selectOption('department');
      await group1Condition1.locator('[data-testid="operator-selector"]').selectOption('equals');
      await group1Condition1.locator('[data-testid="value-input"]').fill('Engineering');
      
      await group1.locator('[data-testid="add-condition-to-group"]').click();
      const group1Condition2 = group1.locator('[data-testid="group-condition"]').nth(1);
      await group1Condition2.locator('[data-testid="column-selector"]').selectOption('department');
      await group1Condition2.locator('[data-testid="operator-selector"]').selectOption('equals');
      await group1Condition2.locator('[data-testid="value-input"]').fill('Product');
      
      // Set OR logic for first group
      await group1.locator('[data-testid="group-logic-selector"]').selectOption('OR');
      
      // Create second group
      await page.click('[data-testid="add-filter-group-btn"]');
      const group2 = page.locator('[data-testid="filter-group"]').nth(1);
      
      // Add conditions to second group
      await group2.locator('[data-testid="add-condition-to-group"]').click();
      const group2Condition = group2.locator('[data-testid="group-condition"]').first();
      await group2Condition.locator('[data-testid="column-selector"]').selectOption('salary');
      await group2Condition.locator('[data-testid="operator-selector"]').selectOption('greaterThan');
      await group2Condition.locator('[data-testid="value-input"]').fill('75000');
      
      // Set AND logic between groups
      await page.selectOption('[data-testid="groups-logic-selector"]', 'AND');
      
      // Apply complex filter
      await page.click('[data-testid="apply-complex-filter-btn"]');
      
      // Verify complex logic is applied
      const resultRows = page.locator('.blg-grid-row');
      const rowCount = await resultRows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Verify first few rows match: (Engineering OR Product) AND salary > 75000
      for (let i = 0; i < Math.min(3, rowCount); i++) {
        const row = resultRows.nth(i);
        const dept = await row.locator('[data-column="department"]').textContent();
        const salary = await row.locator('[data-column="salary"]').textContent();
        
        expect(['Engineering', 'Product']).toContain(dept);
        expect(parseFloat(salary!.replace(/[^0-9.-]+/g, ''))).toBeGreaterThan(75000);
      }
    });

    test('should support drag-and-drop filter building', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="advanced-builder-tab"]');
      
      // Drag column from palette to canvas
      const columnPalette = page.locator('[data-testid="column-palette"]');
      const departmentColumn = columnPalette.locator('[data-testid="draggable-column"][data-column="department"]');
      const canvas = page.locator('[data-testid="filter-builder-canvas"]');
      
      await departmentColumn.dragTo(canvas);
      
      // Verify filter node was created
      const filterNode = page.locator('[data-testid="filter-node"]').first();
      await expect(filterNode).toBeVisible();
      await expect(filterNode).toContainText('department');
      
      // Configure the dropped filter
      await filterNode.locator('[data-testid="node-config-btn"]').click();
      await page.selectOption('[data-testid="node-operator"]', 'contains');
      await page.fill('[data-testid="node-value"]', 'Manager');
      await page.click('[data-testid="save-node-config"]');
      
      // Drag another column and connect them
      const salaryColumn = columnPalette.locator('[data-testid="draggable-column"][data-column="salary"]');
      await salaryColumn.dragTo(canvas);
      
      const salaryNode = page.locator('[data-testid="filter-node"]').nth(1);
      
      // Connect nodes with logic operator
      const connection = await page.locator('[data-testid="connection-handle"]').first().boundingBox();
      const target = await salaryNode.boundingBox();
      
      await page.mouse.move(connection!.x + connection!.width/2, connection!.y + connection!.height/2);
      await page.mouse.down();
      await page.mouse.move(target!.x + target!.width/2, target!.y + target!.height/2);
      await page.mouse.up();
      
      // Verify connection was created
      await expect(page.locator('[data-testid="filter-connection"]')).toBeVisible();
      
      // Set connection logic
      await page.locator('[data-testid="filter-connection"]').click();
      await page.selectOption('[data-testid="connection-logic"]', 'AND');
      
      // Apply visual filter
      await page.click('[data-testid="apply-visual-filter-btn"]');
      
      // Verify filter works
      const resultRows = page.locator('.blg-grid-row');
      expect(await resultRows.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Natural Language Processing', () => {
    test('should process natural language filter queries', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="natural-language-tab"]');
      
      // Enter natural language query
      const nlInput = page.locator('[data-testid="natural-language-input"]');
      await nlInput.fill('Show me all engineers with salary greater than 60000 who joined after 2020');
      
      await page.click('[data-testid="process-nl-query-btn"]');
      
      // Wait for NLP processing
      await expect(page.locator('[data-testid="nl-processing-indicator"]')).toBeVisible();
      await page.waitForSelector('[data-testid="nl-processing-complete"]', { timeout: 10000 });
      
      // Verify parsed query is displayed
      await expect(page.locator('[data-testid="parsed-query-result"]')).toBeVisible();
      
      // Check confidence score
      const confidence = page.locator('[data-testid="confidence-score"]');
      const confidenceText = await confidence.textContent();
      const confidenceValue = parseFloat(confidenceText!.replace(/[^\d.]/g, ''));
      expect(confidenceValue).toBeGreaterThan(0.7); // Should have good confidence
      
      // Verify parsed conditions
      const conditions = page.locator('[data-testid="parsed-condition"]');
      expect(await conditions.count()).toBe(3); // Should identify 3 conditions
      
      // Check individual conditions
      const condition1 = conditions.nth(0);
      await expect(condition1).toContainText('department');
      await expect(condition1).toContainText('engineering');
      
      const condition2 = conditions.nth(1);
      await expect(condition2).toContainText('salary');
      await expect(condition2).toContainText('60000');
      
      const condition3 = conditions.nth(2);
      await expect(condition3).toContainText('hire');
      await expect(condition3).toContainText('2020');
      
      // Apply NL query
      await page.click('[data-testid="apply-nl-query-btn"]');
      
      // Verify results match the query
      const resultRows = page.locator('.blg-grid-row');
      expect(await resultRows.count()).toBeGreaterThan(0);
    });

    test('should provide query suggestions and corrections', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="natural-language-tab"]');
      
      const nlInput = page.locator('[data-testid="natural-language-input"]');
      
      // Type partial query to trigger suggestions
      await nlInput.fill('Show me employees in');
      
      // Wait for suggestions
      await page.waitForSelector('[data-testid="nl-suggestions"]', { timeout: 5000 });
      const suggestions = page.locator('[data-testid="suggestion-item"]');
      expect(await suggestions.count()).toBeGreaterThan(0);
      
      // Verify suggestions are relevant
      const firstSuggestion = suggestions.first();
      const suggestionText = await firstSuggestion.textContent();
      expect(suggestionText!.toLowerCase()).toContain('department');
      
      // Click suggestion to apply it
      await firstSuggestion.click();
      
      // Verify input was updated
      const updatedValue = await nlInput.inputValue();
      expect(updatedValue).toContain(suggestionText);
      
      // Test query correction
      await nlInput.fill('Find all employes with slary over 50k'); // Intentional typos
      await page.click('[data-testid="process-nl-query-btn"]');
      
      // Should show correction suggestions
      await expect(page.locator('[data-testid="correction-suggestions"]')).toBeVisible();
      
      const corrections = page.locator('[data-testid="correction-item"]');
      expect(await corrections.count()).toBeGreaterThan(0);
      
      // Apply correction
      await corrections.first().click();
      
      // Verify correction was applied
      const correctedValue = await nlInput.inputValue();
      expect(correctedValue).toContain('employees');
      expect(correctedValue).toContain('salary');
    });

    test('should handle complex natural language queries', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="natural-language-tab"]');
      
      // Complex query with multiple conditions and logic
      const complexQuery = 'Find all senior engineers or managers in product department with salary between 80000 and 120000 who have been with company for more than 2 years';
      
      await page.fill('[data-testid="natural-language-input"]', complexQuery);
      await page.click('[data-testid="process-nl-query-btn"]');
      
      await page.waitForSelector('[data-testid="nl-processing-complete"]', { timeout: 15000 });
      
      // Verify complex parsing
      const parsedStructure = page.locator('[data-testid="parsed-structure"]');
      await expect(parsedStructure).toBeVisible();
      
      // Should identify multiple groups and logic operators
      const groups = page.locator('[data-testid="parsed-group"]');
      expect(await groups.count()).toBeGreaterThan(1);
      
      // Should identify OR logic between "engineers" and "managers"
      await expect(page.locator('[data-testid="detected-logic"][data-operator="OR"]')).toBeVisible();
      
      // Should identify range condition for salary
      await expect(page.locator('[data-testid="range-condition"][data-field="salary"]')).toBeVisible();
      
      // Should identify date-based condition for tenure
      await expect(page.locator('[data-testid="date-condition"][data-field="hire_date"]')).toBeVisible();
      
      // Apply complex query
      await page.click('[data-testid="apply-nl-query-btn"]');
      
      // Verify results
      const resultRows = page.locator('.blg-grid-row');
      expect(await resultRows.count()).toBeGreaterThan(0);
    });

    test('should support voice-to-text for natural language queries', async () => {
      // Check if speech recognition is available
      const hasSpeechSupport = await page.evaluate(() => {
        return 'speechRecognition' in window || 'webkitSpeechRecognition' in window;
      });
      
      test.skip(!hasSpeechSupport, 'Speech recognition not available');
      
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="natural-language-tab"]');
      
      // Click voice input button
      await page.click('[data-testid="voice-input-btn"]');
      
      // Verify microphone indicator is active
      await expect(page.locator('[data-testid="microphone-active-indicator"]')).toBeVisible();
      
      // Simulate speech recognition result
      await page.evaluate(() => {
        const event = new CustomEvent('speechResult', { 
          detail: 'show me all developers with high salaries' 
        });
        document.dispatchEvent(event);
      });
      
      // Verify text was populated
      const nlInput = page.locator('[data-testid="natural-language-input"]');
      await expect(nlInput).toHaveValue('show me all developers with high salaries');
      
      // Process the voice query
      await page.click('[data-testid="process-nl-query-btn"]');
      await page.waitForSelector('[data-testid="nl-processing-complete"]');
      
      // Verify processing worked
      await expect(page.locator('[data-testid="parsed-query-result"]')).toBeVisible();
    });
  });

  test.describe('AI-Powered Suggestions and Optimization', () => {
    test('should provide intelligent filter suggestions', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      
      // Create a suboptimal filter
      await page.click('[data-testid="add-condition-btn"]');
      const condition = page.locator('[data-testid="filter-condition"]').first();
      await condition.locator('[data-testid="column-selector"]').selectOption('name');
      await condition.locator('[data-testid="operator-selector"]').selectOption('equals');
      await condition.locator('[data-testid="value-input"]').fill('a');
      
      await page.click('[data-testid="apply-filter-btn"]');
      
      // Wait for AI analysis
      await page.waitForSelector('[data-testid="ai-suggestion-badge"]', { timeout: 5000 });
      
      // Click to view suggestions
      await page.click('[data-testid="ai-suggestion-badge"]');
      await expect(page.locator('[data-testid="suggestions-panel"]')).toBeVisible();
      
      // Verify suggestion types
      const suggestions = page.locator('[data-testid="suggestion-item"]');
      expect(await suggestions.count()).toBeGreaterThan(0);
      
      const firstSuggestion = suggestions.first();
      await expect(firstSuggestion.locator('[data-testid="suggestion-type"]')).toBeVisible();
      await expect(firstSuggestion.locator('[data-testid="confidence-score"]')).toBeVisible();
      await expect(firstSuggestion.locator('[data-testid="potential-improvement"]')).toBeVisible();
      
      // Apply suggestion
      await firstSuggestion.locator('[data-testid="apply-suggestion-btn"]').click();
      
      // Verify suggestion was applied
      await expect(page.locator('[data-testid="suggestion-applied-notification"]')).toBeVisible();
      
      // Check performance improvement
      const performanceMetrics = page.locator('[data-testid="performance-metrics"]');
      const newEvalTime = await performanceMetrics.locator('[data-testid="evaluation-time"]').textContent();
      expect(parseFloat(newEvalTime!)).toBeLessThan(1000); // Should be improved
    });

    test('should optimize filter performance automatically', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      
      // Create a complex, potentially slow filter
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="add-condition-btn"]');
        const condition = page.locator('[data-testid="filter-condition"]').nth(i);
        await condition.locator('[data-testid="column-selector"]').selectOption('description');
        await condition.locator('[data-testid="operator-selector"]').selectOption('contains');
        await condition.locator('[data-testid="value-input"]').fill(`text${i}`);
      }
      
      await page.click('[data-testid="apply-filter-btn"]');
      
      // Should trigger performance warning
      await expect(page.locator('[data-testid="performance-warning"]')).toBeVisible();
      
      // Click optimize button
      await page.click('[data-testid="optimize-filter-btn"]');
      
      // Wait for optimization
      await page.waitForSelector('[data-testid="optimization-complete"]', { timeout: 10000 });
      
      // Verify optimization suggestions
      const optimizations = page.locator('[data-testid="optimization-result"]');
      await expect(optimizations).toBeVisible();
      
      // Should show improvements
      const improvements = page.locator('[data-testid="improvement-item"]');
      expect(await improvements.count()).toBeGreaterThan(0);
      
      // Apply optimizations
      await page.click('[data-testid="apply-optimizations-btn"]');
      
      // Verify performance improved
      const newWarning = page.locator('[data-testid="performance-warning"]');
      await expect(newWarning).not.toBeVisible();
    });

    test('should suggest filter templates based on data patterns', async () => {
      // Enable AI template suggestions
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="ai-templates-btn"]');
      
      // Wait for pattern analysis
      await page.waitForSelector('[data-testid="pattern-analysis-complete"]', { timeout: 10000 });
      
      // Verify suggested templates
      const templates = page.locator('[data-testid="suggested-template"]');
      expect(await templates.count()).toBeGreaterThan(0);
      
      // Check template quality
      const firstTemplate = templates.first();
      await expect(firstTemplate.locator('[data-testid="template-name"]')).toBeVisible();
      await expect(firstTemplate.locator('[data-testid="template-description"]')).toBeVisible();
      await expect(firstTemplate.locator('[data-testid="relevance-score"]')).toBeVisible();
      
      const relevanceScore = await firstTemplate.locator('[data-testid="relevance-score"]').textContent();
      expect(parseFloat(relevanceScore!)).toBeGreaterThan(0.6);
      
      // Preview template
      await firstTemplate.locator('[data-testid="preview-template-btn"]').click();
      await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
      
      // Apply template
      await page.click('[data-testid="apply-template-btn"]');
      
      // Verify template was applied
      const appliedConditions = page.locator('[data-testid="filter-condition"]');
      expect(await appliedConditions.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Formula-Based Filtering', () => {
    test('should support formula editor with syntax highlighting', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="formula-editor-tab"]');
      
      // Verify formula editor is loaded
      await expect(page.locator('[data-testid="formula-editor"]')).toBeVisible();
      
      // Type a formula
      const formulaEditor = page.locator('[data-testid="formula-input"]');
      await formulaEditor.fill('department = "Engineering" AND salary > 50000 OR (experience >= 5 AND rating > 4.0)');
      
      // Verify syntax highlighting
      await expect(page.locator('.syntax-keyword')).toHaveCount(2); // AND, OR
      await expect(page.locator('.syntax-operator')).toHaveCount(4); // =, >, >=, >
      await expect(page.locator('.syntax-string')).toHaveCount(1); // "Engineering"
      await expect(page.locator('.syntax-number')).toHaveCount(3); // 50000, 5, 4.0
      
      // Test autocomplete
      await formulaEditor.fill('dep');
      await page.keyboard.press('Control+ ');
      
      // Should show suggestions
      await expect(page.locator('[data-testid="formula-suggestions"]')).toBeVisible();
      const suggestions = page.locator('[data-testid="formula-suggestion"]');
      
      // Should suggest "department"
      const departmentSuggestion = suggestions.filter({ hasText: 'department' });
      await expect(departmentSuggestion).toBeVisible();
      
      // Apply suggestion
      await departmentSuggestion.click();
      expect(await formulaEditor.inputValue()).toContain('department');
    });

    test('should validate formula syntax', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="formula-editor-tab"]');
      
      const formulaEditor = page.locator('[data-testid="formula-input"]');
      
      // Enter invalid formula
      await formulaEditor.fill('department = "Engineering AND salary >'); // Incomplete
      await page.click('[data-testid="validate-formula-btn"]');
      
      // Should show syntax errors
      await expect(page.locator('[data-testid="syntax-errors"]')).toBeVisible();
      const errors = page.locator('[data-testid="syntax-error"]');
      expect(await errors.count()).toBeGreaterThan(0);
      
      // Check error details
      const firstError = errors.first();
      await expect(firstError.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(firstError.locator('[data-testid="error-line"]')).toBeVisible();
      await expect(firstError.locator('[data-testid="error-column"]')).toBeVisible();
      
      // Fix the formula
      await formulaEditor.fill('department = "Engineering" AND salary > 50000');
      await page.click('[data-testid="validate-formula-btn"]');
      
      // Errors should be cleared
      await expect(page.locator('[data-testid="syntax-errors"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="formula-valid-indicator"]')).toBeVisible();
    });

    test('should support advanced formula functions', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="formula-editor-tab"]');
      
      const formulaEditor = page.locator('[data-testid="formula-input"]');
      
      // Test string functions
      await formulaEditor.fill('UPPER(name) CONTAINS "JOHN" AND LENGTH(email) > 10');
      await page.click('[data-testid="validate-formula-btn"]');
      await expect(page.locator('[data-testid="formula-valid-indicator"]')).toBeVisible();
      
      // Test date functions
      await formulaEditor.fill('YEAR(hireDate) >= 2020 AND DATEDIFF(NOW(), hireDate) > 365');
      await page.click('[data-testid="validate-formula-btn"]');
      await expect(page.locator('[data-testid="formula-valid-indicator"]')).toBeVisible();
      
      // Test mathematical functions
      await formulaEditor.fill('ROUND(salary / 12, 2) > 5000 AND MOD(employeeId, 2) = 0');
      await page.click('[data-testid="validate-formula-btn"]');
      await expect(page.locator('[data-testid="formula-valid-indicator"]')).toBeVisible();
      
      // Apply complex formula
      await formulaEditor.fill('(department = "Engineering" AND salary > AVG(salary)) OR (experience >= PERCENTILE(experience, 90))');
      await page.click('[data-testid="apply-formula-btn"]');
      
      // Verify complex formula works
      const resultRows = page.locator('.blg-grid-row');
      expect(await resultRows.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Monitoring and Optimization', () => {
    test('should display real-time performance metrics', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      
      // Enable performance monitoring
      await page.click('[data-testid="performance-monitor-btn"]');
      await expect(page.locator('[data-testid="performance-panel"]')).toBeVisible();
      
      // Create filter and monitor performance
      await page.click('[data-testid="add-condition-btn"]');
      const condition = page.locator('[data-testid="filter-condition"]').first();
      await condition.locator('[data-testid="column-selector"]').selectOption('description');
      await condition.locator('[data-testid="operator-selector"]').selectOption('contains');
      await condition.locator('[data-testid="value-input"]').fill('manager');
      
      await page.click('[data-testid="apply-filter-btn"]');
      
      // Verify performance metrics are updated
      const metrics = page.locator('[data-testid="performance-metrics"]');
      await expect(metrics.locator('[data-testid="evaluation-time"]')).not.toBeEmpty();
      await expect(metrics.locator('[data-testid="memory-usage"]')).not.toBeEmpty();
      await expect(metrics.locator('[data-testid="cache-hit-rate"]')).not.toBeEmpty();
      
      // Verify performance indicators
      const evaluationTime = await metrics.locator('[data-testid="evaluation-time"]').textContent();
      const timeMs = parseFloat(evaluationTime!);
      
      if (timeMs > 1000) {
        await expect(page.locator('[data-testid="performance-warning"]')).toBeVisible();
      } else if (timeMs < 100) {
        await expect(page.locator('[data-testid="performance-excellent"]')).toBeVisible();
      }
    });

    test('should analyze filter complexity', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="advanced-builder-tab"]');
      
      // Create complex nested filter
      await page.click('[data-testid="add-filter-group-btn"]');
      await page.click('[data-testid="add-filter-group-btn"]');
      await page.click('[data-testid="add-filter-group-btn"]');
      
      // Add multiple conditions to each group
      for (let i = 0; i < 3; i++) {
        const group = page.locator('[data-testid="filter-group"]').nth(i);
        for (let j = 0; j < 3; j++) {
          await group.locator('[data-testid="add-condition-to-group"]').click();
        }
      }
      
      // Check complexity analysis
      await expect(page.locator('[data-testid="complexity-meter"]')).toBeVisible();
      
      const complexity = page.locator('[data-testid="complexity-score"]');
      const complexityScore = await complexity.textContent();
      expect(parseFloat(complexityScore!)).toBeGreaterThan(5); // Should be complex
      
      // Should show complexity warnings
      await expect(page.locator('[data-testid="complexity-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="simplification-suggestions"]')).toBeVisible();
      
      // Test simplification
      await page.click('[data-testid="simplify-filter-btn"]');
      await page.waitForSelector('[data-testid="simplification-complete"]');
      
      // Complexity should be reduced
      const newComplexity = await complexity.textContent();
      expect(parseFloat(newComplexity!)).toBeLessThan(parseFloat(complexityScore!));
    });
  });

  test.describe('Collaborative Features', () => {
    test('should support shared filter building', async () => {
      test.skip(!process.env.COLLABORATION_ENABLED, 'Collaboration not enabled');
      
      await page.click('[data-testid="advanced-filter-btn"]');
      
      // Enable collaboration
      await page.click('[data-testid="enable-collaboration-btn"]');
      await expect(page.locator('[data-testid="collaboration-panel"]')).toBeVisible();
      
      // Share filter with team
      await page.click('[data-testid="share-filter-btn"]');
      await page.fill('[data-testid="share-email-input"]', 'colleague@company.com');
      await page.selectOption('[data-testid="permission-level"]', 'edit');
      await page.click('[data-testid="send-invite-btn"]');
      
      // Simulate real-time collaboration
      await page.evaluate(() => {
        const event = new CustomEvent('remoteFilterChange', {
          detail: {
            userId: 'colleague123',
            action: 'addCondition',
            condition: {
              column: 'department',
              operator: 'equals',
              value: 'Sales'
            }
          }
        });
        document.dispatchEvent(event);
      });
      
      // Should show remote changes
      await expect(page.locator('[data-testid="remote-change-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="collaborator-cursor"][data-user="colleague123"]')).toBeVisible();
      
      // Should update filter with remote changes
      const newCondition = page.locator('[data-testid="filter-condition"][data-remote="true"]');
      await expect(newCondition).toBeVisible();
      await expect(newCondition).toContainText('Sales');
    });

    test('should handle collaborative conflicts', async () => {
      test.skip(!process.env.COLLABORATION_ENABLED, 'Collaboration not enabled');
      
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="enable-collaboration-btn"]');
      
      // Simulate conflict scenario
      await page.evaluate(() => {
        const event = new CustomEvent('collaborationConflict', {
          detail: {
            conflictType: 'simultaneous-edit',
            localChange: { column: 'department', value: 'Engineering' },
            remoteChange: { column: 'department', value: 'Product' },
            remoteUser: 'colleague123'
          }
        });
        document.dispatchEvent(event);
      });
      
      // Should show conflict resolution dialog
      await expect(page.locator('[data-testid="conflict-resolution-dialog"]')).toBeVisible();
      
      // Should show both versions
      await expect(page.locator('[data-testid="local-version"]')).toContainText('Engineering');
      await expect(page.locator('[data-testid="remote-version"]')).toContainText('Product');
      
      // Choose resolution
      await page.click('[data-testid="accept-remote-btn"]');
      
      // Should apply remote version
      const resolvedCondition = page.locator('[data-testid="filter-condition"]').first();
      const valueInput = resolvedCondition.locator('[data-testid="value-input"]');
      expect(await valueInput.inputValue()).toBe('Product');
    });
  });

  test.describe('Export and Import', () => {
    test('should export complex filter configurations', async () => {
      await page.click('[data-testid="advanced-filter-btn"]');
      
      // Create complex filter
      await page.click('[data-testid="advanced-builder-tab"]');
      await page.click('[data-testid="add-filter-group-btn"]');
      
      const group = page.locator('[data-testid="filter-group"]').first();
      await group.locator('[data-testid="add-condition-to-group"]').click();
      
      const condition = group.locator('[data-testid="group-condition"]').first();
      await condition.locator('[data-testid="column-selector"]').selectOption('department');
      await condition.locator('[data-testid="operator-selector"]').selectOption('equals');
      await condition.locator('[data-testid="value-input"]').fill('Engineering');
      
      // Export filter
      await page.click('[data-testid="filter-export-btn"]');
      await expect(page.locator('[data-testid="export-dialog"]')).toBeVisible();
      
      await page.selectOption('[data-testid="export-format"]', 'json');
      await page.check('[data-testid="include-performance-data"]');
      await page.check('[data-testid="include-metadata"]');
      
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="download-export-btn"]')
      ]);
      
      expect(download.suggestedFilename()).toMatch(/multi-filter.*\.json$/);
    });

    test('should import and validate filter configurations', async () => {
      const importConfig = {
        version: '2.0',
        type: 'multi-filter',
        groups: [
          {
            id: 'group-1',
            operator: 'AND',
            conditions: [
              {
                column: 'department',
                operator: 'equals',
                value: 'Engineering'
              },
              {
                column: 'salary',
                operator: 'greaterThan',
                value: 75000
              }
            ]
          }
        ],
        metadata: {
          created: new Date().toISOString(),
          author: 'test-user'
        }
      };
      
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="filter-import-btn"]');
      
      await page.setInputFiles('[data-testid="import-file-input"]', {
        name: 'multi-filter-config.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(importConfig))
      });
      
      // Verify import preview
      await expect(page.locator('[data-testid="import-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="preview-group"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="preview-condition"]')).toHaveCount(2);
      
      // Apply import
      await page.click('[data-testid="apply-import-btn"]');
      
      // Verify imported filter is active
      const importedGroup = page.locator('[data-testid="filter-group"]').first();
      const conditions = importedGroup.locator('[data-testid="group-condition"]');
      expect(await conditions.count()).toBe(2);
      
      const firstCondition = conditions.first();
      const columnSelect = firstCondition.locator('[data-testid="column-selector"]');
      expect(await columnSelect.inputValue()).toBe('department');
    });
  });
});