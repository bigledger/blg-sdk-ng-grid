import { test, expect, Page } from '@playwright/test';
import { GridHelper } from '../helpers/grid-helper';
import { TestHelpers } from '../helpers/test-helpers';

/**
 * Column Groups Suite - Tests advanced column grouping capabilities
 * 
 * This comprehensive test suite validates BigLedger Grid's advanced column grouping,
 * featuring unlimited nesting (10+ levels), AI-powered auto-grouping, drag-and-drop
 * reorganization, real-time analytics, responsive behavior, and performance with
 * 1000+ columns - significantly exceeding ag-grid's capabilities.
 */
test.describe('Column Groups Suite', () => {
  let page: Page;
  let gridHelper: GridHelper;
  let testHelper: TestHelpers;
  
  // Performance tracking for column operations
  let groupingMetrics: {
    renderTime: number;
    dragDropTime: number;
    analyticsUpdateTime: number;
    memoryUsage: number;
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    gridHelper = new GridHelper(page);
    testHelper = new TestHelpers(page);
    
    // Enable grouping performance monitoring
    await page.addInitScript(() => {
      (window as any).groupingMetrics = {
        renderTime: 0,
        dragDropTime: 0,
        analyticsUpdateTime: 0,
        memoryUsage: 0
      };
    });
  });

  test.beforeEach(async () => {
    await page.goto('/grid-demo?dataset=financial&rows=10000&cols=100&grouping=enabled');
    await testHelper.waitForElement('[data-testid="grid-container"]', 10000);
  });

  test.describe('Unlimited Nesting (10+ Levels)', () => {
    
    test('should support deep column group hierarchies', async () => {
      await test.step('Create 10-level deep group hierarchy', async () => {
        // Enable advanced column grouping
        await page.locator('[data-testid="column-grouping-panel"]').click();
        await page.locator('[data-testid="enable-advanced-grouping"]').click();
        
        const groupLevels = [
          { name: 'Financial Data', description: 'All financial metrics' },
          { name: 'Revenue Metrics', description: 'Revenue-related columns' },
          { name: 'Quarterly Revenue', description: 'Revenue by quarter' },
          { name: 'Q1 Revenue', description: 'First quarter revenue' },
          { name: 'Q1 Monthly', description: 'Monthly breakdown' },
          { name: 'January Revenue', description: 'January specific' },
          { name: 'Product Revenue', description: 'By product category' },
          { name: 'Electronics Revenue', description: 'Electronics category' },
          { name: 'Mobile Devices', description: 'Mobile device sales' },
          { name: 'Smartphones', description: 'Smartphone revenue' }
        ];

        let currentLevel = '[data-testid="column-group-root"]';
        
        for (const { name, description } of groupLevels) {
          await page.locator(currentLevel).click();
          await page.locator('[data-testid="add-child-group"]').click();
          
          await page.fill('[data-testid="group-name-input"]', name);
          await page.fill('[data-testid="group-description-input"]', description);
          await page.locator('[data-testid="create-group-confirm"]').click();
          
          // Wait for group creation
          await testHelper.waitForElement(`[data-testid="column-group-${name.replace(/\s/g, '-').toLowerCase()}"]`, 3000);
          
          currentLevel = `[data-testid="column-group-${name.replace(/\s/g, '-').toLowerCase()}"]`;
        }
        
        // Verify hierarchy depth
        const deepestGroup = page.locator('[data-testid="column-group-smartphones"]');
        const depth = await deepestGroup.getAttribute('data-depth');
        expect(parseInt(depth || '0')).toBe(10);
      });

      await test.step('Test navigation through deep hierarchy', async () => {
        // Expand all levels
        const expandButtons = page.locator('[data-testid^="expand-group-"]');
        const expandCount = await expandButtons.count();
        
        for (let i = 0; i < expandCount; i++) {
          await expandButtons.nth(i).click();
          await page.waitForTimeout(100);
        }
        
        // Verify all levels are expanded
        const expandedGroups = page.locator('[data-testid^="column-group-"][data-expanded="true"]');
        expect(await expandedGroups.count()).toBe(10);
        
        // Test collapse/expand performance
        const startTime = Date.now();
        
        await page.locator('[data-testid="collapse-all-groups"]').click();
        await testHelper.waitForElement('[data-testid="all-groups-collapsed"]', 3000);
        
        const collapseTime = Date.now() - startTime;
        expect(collapseTime).toBeLessThan(1000); // Should be fast even with 10 levels
      });

      await test.step('Test column assignment to deep groups', async () => {
        // Drag columns to the deepest group
        const sourceColumn = page.locator('[data-testid="column-smartphone-revenue"]');
        const targetGroup = page.locator('[data-testid="column-group-smartphones"]');
        
        await sourceColumn.dragTo(targetGroup);
        
        // Verify column is assigned to correct group
        const groupedColumn = targetGroup.locator('[data-testid="grouped-column-smartphone-revenue"]');
        await expect(groupedColumn).toBeVisible();
        
        // Verify group shows column count
        const columnCount = targetGroup.locator('[data-testid="group-column-count"]');
        await expect(columnCount).toContainText('1');
      });
    });

    test('should handle group operations at all levels', async () => {
      await test.step('Test sorting at different group levels', async () => {
        // Apply sorting at different hierarchy levels
        const groupLevels = [
          { group: 'financial-data', columns: 5 },
          { group: 'revenue-metrics', columns: 3 },
          { group: 'quarterly-revenue', columns: 4 }
        ];

        for (const { group, columns } of groupLevels) {
          await page.locator(`[data-testid="column-group-${group}"]`).click();
          await page.locator('[data-testid="sort-group-ascending"]').click();
          
          await page.waitForTimeout(500);
          
          // Verify sorting applied to group columns
          const sortedColumns = page.locator(`[data-testid*="column-header"][data-group="${group}"][data-sorted="asc"]`);
          expect(await sortedColumns.count()).toBe(columns);
        }
      });

      await test.step('Test filtering at group level', async () => {
        await page.locator('[data-testid="column-group-revenue-metrics"]').click();
        await page.locator('[data-testid="filter-group"]').click();
        
        // Apply group-wide filter
        await page.locator('[data-testid="group-filter-operator"]').selectOption('greaterThan');
        await page.fill('[data-testid="group-filter-value"]', '1000');
        await page.locator('[data-testid="apply-group-filter"]').click();
        
        // Verify filter applied to all columns in group
        const filteredResults = await gridHelper.getVisibleRowCount();
        expect(filteredResults).toBeGreaterThan(0);
        expect(filteredResults).toBeLessThan(10000); // Should be filtered
        
        // Verify filter indicator on group
        const groupFilterIndicator = page.locator('[data-testid="group-filter-indicator-revenue-metrics"]');
        await expect(groupFilterIndicator).toBeVisible();
      });
    });
  });

  test.describe('AI-Powered Auto-Grouping', () => {
    
    test('should intelligently group columns using AI', async () => {
      await test.step('Enable AI auto-grouping', async () => {
        await page.locator('[data-testid="ai-grouping-panel"]').click();
        await page.locator('[data-testid="enable-ai-grouping"]').click();
        
        // Configure AI grouping parameters
        await page.locator('[data-testid="ai-grouping-strategy"]').selectOption('semantic');
        await page.locator('[data-testid="ai-confidence-threshold"]').fill('0.8');
        await page.locator('[data-testid="max-groups"]').fill('10');
        
        await page.locator('[data-testid="start-ai-grouping"]').click();
        
        // Wait for AI processing
        await testHelper.waitForElement('[data-testid="ai-grouping-complete"]', 15000);
      });

      await test.step('Verify AI-generated groups are logical', async () => {
        const aiGroups = page.locator('[data-testid^="ai-generated-group-"]');
        const groupCount = await aiGroups.count();
        expect(groupCount).toBeGreaterThan(0);
        
        // Check group names make semantic sense
        const groupNames = await aiGroups.allTextContents();
        expect(groupNames).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/financial|revenue|cost|profit/i),
            expect.stringMatching(/customer|client|account/i),
            expect.stringMatching(/date|time|period/i)
          ])
        );
        
        // Verify columns are grouped logically
        for (let i = 0; i < Math.min(3, groupCount); i++) {
          const group = aiGroups.nth(i);
          const groupedColumns = group.locator('[data-testid^="grouped-column-"]');
          const columnCount = await groupedColumns.count();
          expect(columnCount).toBeGreaterThan(0);
          
          // All columns in a group should have related names
          const columnNames = await groupedColumns.allTextContents();
          const firstColumnKeyword = columnNames[0].split(/[\s_-]/)[0].toLowerCase();
          
          // At least 70% of columns should share similar keywords
          const relatedColumns = columnNames.filter(name => 
            name.toLowerCase().includes(firstColumnKeyword) ||
            firstColumnKeyword.includes(name.split(/[\s_-]/)[0].toLowerCase())
          );
          expect(relatedColumns.length / columnNames.length).toBeGreaterThan(0.7);
        }
      });

      await test.step('Test AI grouping suggestions and refinement', async () => {
        // Get AI suggestions for improvement
        await page.locator('[data-testid="get-ai-suggestions"]').click();
        await testHelper.waitForElement('[data-testid="ai-suggestions-panel"]', 5000);
        
        const suggestions = page.locator('[data-testid^="ai-suggestion-"]');
        const suggestionCount = await suggestions.count();
        expect(suggestionCount).toBeGreaterThan(0);
        
        // Apply a suggestion
        const firstSuggestion = suggestions.first();
        await firstSuggestion.click();
        
        const suggestionText = await firstSuggestion.textContent();
        expect(suggestionText).toMatch(/merge|split|rename|reorganize/i);
        
        await page.locator('[data-testid="apply-suggestion"]').click();
        await page.waitForTimeout(1000);
        
        // Verify suggestion was applied
        const updatedGroups = page.locator('[data-testid^="ai-generated-group-"]');
        await expect(updatedGroups.count()).not.toBe(groupCount);
      });

      await test.step('Test custom AI training', async () => {
        // Provide feedback to improve AI grouping
        await page.locator('[data-testid="ai-training-panel"]').click();
        
        // Mark a group as correct
        await page.locator('[data-testid="ai-generated-group-financial"]').click();
        await page.locator('[data-testid="mark-group-correct"]').click();
        
        // Mark a group as incorrect with suggestion
        await page.locator('[data-testid="ai-generated-group-mixed"]').click();
        await page.locator('[data-testid="mark-group-incorrect"]').click();
        await page.fill('[data-testid="correction-suggestion"]', 'These columns should be split into Date and Status groups');
        await page.locator('[data-testid="submit-correction"]').click();
        
        // Retrain AI with feedback
        await page.locator('[data-testid="retrain-ai"]').click();
        await testHelper.waitForElement('[data-testid="retraining-complete"]', 10000);
        
        // Verify improved grouping
        await page.locator('[data-testid="start-ai-grouping"]').click();
        await testHelper.waitForElement('[data-testid="ai-grouping-complete"]', 15000);
        
        // Should have better results after training
        const improvedGroups = page.locator('[data-testid^="ai-generated-group-"]');
        const improvedCount = await improvedGroups.count();
        expect(improvedCount).toBeGreaterThanOrEqual(groupCount);
      });
    });

    test('should support domain-specific AI grouping models', async () => {
      await test.step('Test financial data grouping model', async () => {
        await page.locator('[data-testid="ai-grouping-model"]').selectOption('financial');
        await page.locator('[data-testid="start-ai-grouping"]').click();
        
        await testHelper.waitForElement('[data-testid="ai-grouping-complete"]', 15000);
        
        // Verify financial-specific groups
        const groups = page.locator('[data-testid^="ai-generated-group-"]');
        const groupNames = await groups.allTextContents();
        
        expect(groupNames).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/revenue|income/i),
            expect.stringMatching(/expense|cost/i),
            expect.stringMatching(/asset|liability/i),
            expect.stringMatching(/ratio|metric/i)
          ])
        );
      });

      await test.step('Test e-commerce data grouping model', async () => {
        await page.goto('/grid-demo?dataset=ecommerce&rows=5000&cols=80');
        await testHelper.waitForElement('[data-testid="grid-container"]', 10000);
        
        await page.locator('[data-testid="ai-grouping-panel"]').click();
        await page.locator('[data-testid="ai-grouping-model"]').selectOption('ecommerce');
        await page.locator('[data-testid="start-ai-grouping"]').click();
        
        await testHelper.waitForElement('[data-testid="ai-grouping-complete"]', 15000);
        
        const ecommerceGroups = page.locator('[data-testid^="ai-generated-group-"]');
        const ecommerceGroupNames = await ecommerceGroups.allTextContents();
        
        expect(ecommerceGroupNames).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/product|item/i),
            expect.stringMatching(/customer|buyer/i),
            expect.stringMatching(/order|purchase/i),
            expect.stringMatching(/shipping|delivery/i)
          ])
        );
      });
    });
  });

  test.describe('Drag-and-Drop Reorganization', () => {
    
    test('should support complex drag-and-drop operations', async () => {
      await test.step('Drag columns between groups', async () => {
        // Create initial groups
        await page.locator('[data-testid="create-group"]').click();
        await page.fill('[data-testid="group-name"]', 'Source Group');
        await page.locator('[data-testid="confirm-create-group"]').click();
        
        await page.locator('[data-testid="create-group"]').click();
        await page.fill('[data-testid="group-name"]', 'Target Group');
        await page.locator('[data-testid="confirm-create-group"]').click();
        
        // Add columns to source group
        const columns = page.locator('[data-testid^="column-header-"]');
        for (let i = 0; i < 3; i++) {
          const column = columns.nth(i);
          const sourceGroup = page.locator('[data-testid="column-group-source-group"]');
          await column.dragTo(sourceGroup);
          await page.waitForTimeout(200);
        }
        
        // Verify columns in source group
        const sourceGroupColumns = page.locator('[data-testid="column-group-source-group"] [data-testid^="grouped-column-"]');
        expect(await sourceGroupColumns.count()).toBe(3);
        
        // Drag column from source to target group
        const startTime = Date.now();
        const columnToDrag = sourceGroupColumns.first();
        const targetGroup = page.locator('[data-testid="column-group-target-group"]');
        
        await columnToDrag.dragTo(targetGroup);
        const dragTime = Date.now() - startTime;
        
        expect(dragTime).toBeLessThan(1000); // Should be responsive
        
        // Verify column moved
        expect(await sourceGroupColumns.count()).toBe(2);
        const targetGroupColumns = page.locator('[data-testid="column-group-target-group"] [data-testid^="grouped-column-"]');
        expect(await targetGroupColumns.count()).toBe(1);
      });

      await test.step('Drag groups to reorder hierarchy', async () => {
        // Create nested group structure
        const groupStructure = [
          { parent: 'root', name: 'Parent A' },
          { parent: 'parent-a', name: 'Child A1' },
          { parent: 'parent-a', name: 'Child A2' },
          { parent: 'root', name: 'Parent B' }
        ];

        for (const { parent, name } of groupStructure) {
          const parentSelector = parent === 'root' 
            ? '[data-testid="column-group-root"]' 
            : `[data-testid="column-group-${parent}"]`;
          
          await page.locator(parentSelector).click();
          await page.locator('[data-testid="add-child-group"]').click();
          await page.fill('[data-testid="group-name"]', name);
          await page.locator('[data-testid="confirm-create-group"]').click();
        }
        
        // Drag Child A1 to Parent B
        const childA1 = page.locator('[data-testid="column-group-child-a1"]');
        const parentB = page.locator('[data-testid="column-group-parent-b"]');
        
        await childA1.dragTo(parentB);
        
        // Verify hierarchy changed
        const childA1Parent = await childA1.getAttribute('data-parent-group');
        expect(childA1Parent).toBe('parent-b');
        
        // Verify visual hierarchy updated
        const parentBChildren = parentB.locator('[data-testid^="column-group-child-"]');
        expect(await parentBChildren.count()).toBe(1);
      });

      await test.step('Test drag-and-drop with visual feedback', async () => {
        const columnToDrag = page.locator('[data-testid="column-header-revenue"]');
        const targetGroup = page.locator('[data-testid="column-group-financial"]');
        
        // Start drag
        await columnToDrag.hover();
        await page.mouse.down();
        
        // Verify drag preview appears
        const dragPreview = page.locator('[data-testid="column-drag-preview"]');
        await expect(dragPreview).toBeVisible();
        
        // Move over target with visual feedback
        await targetGroup.hover();
        
        // Verify drop zone highlighting
        await expect(targetGroup).toHaveClass(/drop-zone-active/);
        
        // Complete drag
        await page.mouse.up();
        
        // Verify visual feedback cleared
        await expect(dragPreview).not.toBeVisible();
        await expect(targetGroup).not.toHaveClass(/drop-zone-active/);
      });
    });

    test('should support multi-selection drag operations', async () => {
      await test.step('Select multiple columns and drag together', async () => {
        // Select multiple columns
        const columns = page.locator('[data-testid^="column-header-"]');
        
        await columns.nth(0).click();
        await page.keyboard.down('Control');
        await columns.nth(2).click();
        await columns.nth(4).click();
        await page.keyboard.up('Control');
        
        // Verify multiple selection
        const selectedColumns = page.locator('[data-testid^="column-header-"][data-selected="true"]');
        expect(await selectedColumns.count()).toBe(3);
        
        // Drag selection to group
        const targetGroup = page.locator('[data-testid="column-group-analytics"]');
        await selectedColumns.first().dragTo(targetGroup);
        
        // Verify all selected columns moved
        const groupedColumns = targetGroup.locator('[data-testid^="grouped-column-"]');
        expect(await groupedColumns.count()).toBe(3);
      });
    });
  });

  test.describe('Real-Time Analytics', () => {
    
    test('should provide live analytics for grouped columns', async () => {
      await test.step('Enable real-time analytics', async () => {
        await page.locator('[data-testid="group-analytics-panel"]').click();
        await page.locator('[data-testid="enable-real-time-analytics"]').click();
        
        // Configure analytics preferences
        await page.locator('[data-testid="analytics-update-interval"]').fill('1000'); // 1 second
        await page.locator('[data-testid="analytics-metrics"]').selectOption(['sum', 'avg', 'min', 'max', 'count']);
        await page.locator('[data-testid="apply-analytics-config"]').click();
      });

      await test.step('Verify analytics display for groups', async () => {
        const revenueGroup = page.locator('[data-testid="column-group-revenue"]');
        
        // Verify analytics panel appears
        const analyticsPanel = revenueGroup.locator('[data-testid="group-analytics-panel"]');
        await expect(analyticsPanel).toBeVisible();
        
        // Verify metrics are calculated
        const metrics = ['sum', 'avg', 'min', 'max', 'count'];
        for (const metric of metrics) {
          const metricValue = analyticsPanel.locator(`[data-testid="metric-${metric}"]`);
          await expect(metricValue).toBeVisible();
          
          const value = await metricValue.textContent();
          expect(value).toMatch(/[\d,.$]+/); // Should contain numeric value
        }
      });

      await test.step('Test real-time updates when data changes', async () => {
        const revenueGroup = page.locator('[data-testid="column-group-revenue"]');
        const analyticsPanel = revenueGroup.locator('[data-testid="group-analytics-panel"]');
        
        // Get initial sum value
        const initialSum = await analyticsPanel.locator('[data-testid="metric-sum"]').textContent();
        
        // Modify data to trigger update
        await page.locator('[data-testid="grid-cell-0-revenue"]').click();
        await page.keyboard.type('999999');
        await page.keyboard.press('Enter');
        
        // Wait for analytics update
        await page.waitForTimeout(1500); // Wait for update interval + processing
        
        // Verify sum updated
        const updatedSum = await analyticsPanel.locator('[data-testid="metric-sum"]').textContent();
        expect(updatedSum).not.toBe(initialSum);
        
        // Verify update was fast
        const updateStartTime = Date.now();
        await testHelper.waitForElement('[data-testid="analytics-update-complete"]', 2000);
        const updateTime = Date.now() - updateStartTime;
        expect(updateTime).toBeLessThan(1000);
      });

      await test.step('Test analytics for nested groups', async () => {
        // Create nested revenue structure
        await page.locator('[data-testid="column-group-revenue"]').click();
        await page.locator('[data-testid="add-child-group"]').click();
        await page.fill('[data-testid="group-name"]', 'Q1 Revenue');
        await page.locator('[data-testid="confirm-create-group"]').click();
        
        const q1Group = page.locator('[data-testid="column-group-q1-revenue"]');
        const parentGroup = page.locator('[data-testid="column-group-revenue"]');
        
        // Verify parent group shows aggregated analytics
        const parentAnalytics = parentGroup.locator('[data-testid="group-analytics-summary"]');
        const childAnalytics = q1Group.locator('[data-testid="group-analytics-panel"]');
        
        await expect(parentAnalytics).toContainText('Includes 1 subgroup');
        
        // Verify parent sum >= child sum (hierarchical aggregation)
        const parentSum = parseFloat((await parentAnalytics.locator('[data-testid="metric-sum"]').textContent())?.replace(/[,$]/g, '') || '0');
        const childSum = parseFloat((await childAnalytics.locator('[data-testid="metric-sum"]').textContent())?.replace(/[,$]/g, '') || '0');
        
        expect(parentSum).toBeGreaterThanOrEqual(childSum);
      });

      await test.step('Test analytics visualization charts', async () => {
        await page.locator('[data-testid="enable-analytics-charts"]').click();
        
        const revenueGroup = page.locator('[data-testid="column-group-revenue"]');
        
        // Verify mini charts appear
        const miniChart = revenueGroup.locator('[data-testid="group-analytics-chart"]');
        await expect(miniChart).toBeVisible();
        
        // Test different chart types
        const chartTypes = ['bar', 'line', 'pie', 'sparkline'];
        
        for (const chartType of chartTypes) {
          await revenueGroup.locator('[data-testid="chart-type-selector"]').selectOption(chartType);
          await page.waitForTimeout(300);
          
          const chart = revenueGroup.locator(`[data-testid="analytics-chart-${chartType}"]`);
          await expect(chart).toBeVisible();
          
          // Verify chart has content
          const chartBox = await chart.boundingBox();
          expect(chartBox?.width).toBeGreaterThan(0);
          expect(chartBox?.height).toBeGreaterThan(0);
        }
      });
    });

    test('should support custom analytics functions', async () => {
      await test.step('Create custom analytics formula', async () => {
        await page.locator('[data-testid="custom-analytics"]').click();
        await page.locator('[data-testid="add-custom-metric"]').click();
        
        await page.fill('[data-testid="metric-name"]', 'Profit Margin');
        await page.fill('[data-testid="metric-formula"]', '(SUM(revenue) - SUM(costs)) / SUM(revenue) * 100');
        await page.fill('[data-testid="metric-format"]', '{value}%');
        await page.locator('[data-testid="save-custom-metric"]').click();
        
        // Verify custom metric appears
        const revenueGroup = page.locator('[data-testid="column-group-revenue"]');
        const customMetric = revenueGroup.locator('[data-testid="metric-profit-margin"]');
        await expect(customMetric).toBeVisible();
        
        // Verify formula calculation
        const metricValue = await customMetric.textContent();
        expect(metricValue).toMatch(/\d+\.\d+%/);
      });
    });
  });

  test.describe('Responsive Behavior', () => {
    
    test('should adapt column groups to different screen sizes', async () => {
      await test.step('Test desktop layout', async () => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // Verify full group hierarchy is visible
        const groupHeaders = page.locator('[data-testid^="column-group-header-"]');
        const desktopGroupCount = await groupHeaders.count();
        expect(desktopGroupCount).toBeGreaterThan(5);
        
        // Verify group labels are full text
        const firstGroup = groupHeaders.first();
        const groupText = await firstGroup.textContent();
        expect(groupText?.length || 0).toBeGreaterThan(5);
      });

      await test.step('Test tablet layout', async () => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500); // Allow responsive adjustment
        
        // Verify groups are compressed
        const compactGroups = page.locator('[data-testid^="column-group-compact-"]');
        expect(await compactGroups.count()).toBeGreaterThan(0);
        
        // Verify group overflow handling
        const overflowButton = page.locator('[data-testid="group-overflow-menu"]');
        await expect(overflowButton).toBeVisible();
        
        // Test overflow menu functionality
        await overflowButton.click();
        const overflowMenu = page.locator('[data-testid="group-overflow-panel"]');
        await expect(overflowMenu).toBeVisible();
        
        const hiddenGroups = overflowMenu.locator('[data-testid^="hidden-group-"]');
        expect(await hiddenGroups.count()).toBeGreaterThan(0);
      });

      await test.step('Test mobile layout', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        // Verify mobile group interface
        const mobileGroupPanel = page.locator('[data-testid="mobile-group-panel"]');
        await expect(mobileGroupPanel).toBeVisible();
        
        // Test group navigation on mobile
        await page.locator('[data-testid="mobile-group-navigator"]').click();
        
        const groupList = page.locator('[data-testid="mobile-group-list"]');
        await expect(groupList).toBeVisible();
        
        // Test hierarchical navigation
        const parentGroup = page.locator('[data-testid="mobile-group-item-financial"]');
        await parentGroup.click();
        
        const subGroups = page.locator('[data-testid^="mobile-subgroup-"]');
        expect(await subGroups.count()).toBeGreaterThan(0);
      });

      await test.step('Test responsive group operations', async () => {
        // Test that drag-and-drop adapts to screen size
        await page.setViewportSize({ width: 480, height: 800 });
        
        // On mobile, drag should trigger modal interface
        const column = page.locator('[data-testid="column-header-revenue"]');
        await column.click({ button: 'right' });
        
        const contextMenu = page.locator('[data-testid="mobile-column-menu"]');
        await expect(contextMenu).toBeVisible();
        
        await contextMenu.locator('[data-testid="move-to-group"]').click();
        
        const groupSelector = page.locator('[data-testid="mobile-group-selector"]');
        await expect(groupSelector).toBeVisible();
        
        // Should show hierarchical group selection
        const groupOptions = groupSelector.locator('[data-testid^="group-option-"]');
        expect(await groupOptions.count()).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Performance with 1000+ Columns', () => {
    
    test('should handle massive column sets efficiently', async () => {
      await test.step('Load grid with 1000+ columns', async () => {
        await page.goto('/grid-demo?dataset=massive-columns&rows=5000&cols=1000');
        
        const startTime = Date.now();
        await testHelper.waitForElement('[data-testid="grid-container"]', 20000);
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
        
        // Verify column count
        const columns = page.locator('[data-testid^="column-header-"]');
        expect(await columns.count()).toBeGreaterThanOrEqual(50); // Virtual columns
      });

      await test.step('Test grouping performance with 1000+ columns', async () => {
        const startTime = Date.now();
        
        // Enable AI auto-grouping on massive dataset
        await page.locator('[data-testid="ai-grouping-panel"]').click();
        await page.locator('[data-testid="ai-grouping-strategy"]').selectOption('performance');
        await page.locator('[data-testid="max-groups"]').fill('20'); // Reasonable limit
        await page.locator('[data-testid="start-ai-grouping"]').click();
        
        await testHelper.waitForElement('[data-testid="ai-grouping-complete"]', 30000);
        const groupingTime = Date.now() - startTime;
        
        expect(groupingTime).toBeLessThan(25000); // Should complete within 25 seconds
        
        // Verify groups were created
        const groups = page.locator('[data-testid^="ai-generated-group-"]');
        const groupCount = await groups.count();
        expect(groupCount).toBeGreaterThan(5);
        expect(groupCount).toBeLessThanOrEqual(20);
      });

      await test.step('Test column virtualization with groups', async () => {
        // Test scrolling through massive column set
        const columnContainer = page.locator('[data-testid="column-header-container"]');
        
        // Scroll horizontally through columns
        for (let i = 0; i < 10; i++) {
          await columnContainer.evaluate(el => el.scrollLeft += 500);
          await page.waitForTimeout(100);
        }
        
        // Verify virtual scrolling is working (not all columns rendered)
        const renderedColumns = page.locator('[data-testid^="column-header-"]:visible');
        const renderedCount = await renderedColumns.count();
        expect(renderedCount).toBeLessThan(100); // Should be virtualized
        
        // Verify groups are maintained during scrolling
        const visibleGroups = page.locator('[data-testid^="column-group-header-"]:visible');
        expect(await visibleGroups.count()).toBeGreaterThan(0);
      });

      await test.step('Monitor memory usage', async () => {
        const memoryUsage = await page.evaluate(() => {
          return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
        });
        
        // Should handle 1000+ columns without excessive memory usage
        expect(memoryUsage).toBeLessThan(1024 * 1024 * 1024); // Under 1GB
      });
    });

    test('should maintain performance during group operations', async () => {
      await test.step('Test rapid group creation and deletion', async () => {
        const operations = 50;
        const startTime = Date.now();
        
        for (let i = 0; i < operations; i++) {
          // Create group
          await page.locator('[data-testid="quick-create-group"]').click();
          await page.fill('[data-testid="quick-group-name"]', `Test Group ${i}`);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(10);
          
          // Delete group if we've created enough
          if (i >= 25) {
            const groupToDelete = page.locator(`[data-testid="column-group-test-group-${i-25}"]`);
            await groupToDelete.click({ button: 'right' });
            await page.locator('[data-testid="delete-group"]').click();
            await page.locator('[data-testid="confirm-delete"]').click();
          }
        }
        
        const operationsTime = Date.now() - startTime;
        expect(operationsTime).toBeLessThan(5000); // Should be fast
        
        // Verify final state is consistent
        const finalGroups = page.locator('[data-testid^="column-group-test-group-"]');
        expect(await finalGroups.count()).toBe(25);
      });
    });
  });

  test.describe('Advanced Features', () => {
    
    test('should support group templates and presets', async () => {
      await test.step('Create group template', async () => {
        // Create a complex group structure
        await page.locator('[data-testid="create-group"]').click();
        await page.fill('[data-testid="group-name"]', 'Financial Template');
        await page.locator('[data-testid="confirm-create-group"]').click();
        
        // Add subgroups
        const templateGroup = page.locator('[data-testid="column-group-financial-template"]');
        await templateGroup.click();
        
        const subGroups = ['Revenue', 'Expenses', 'Profit Metrics'];
        for (const subGroupName of subGroups) {
          await page.locator('[data-testid="add-child-group"]').click();
          await page.fill('[data-testid="group-name"]', subGroupName);
          await page.locator('[data-testid="confirm-create-group"]').click();
        }
        
        // Save as template
        await templateGroup.click({ button: 'right' });
        await page.locator('[data-testid="save-as-template"]').click();
        await page.fill('[data-testid="template-name"]', 'Standard Financial Analysis');
        await page.fill('[data-testid="template-description"]', 'Common financial reporting structure');
        await page.locator('[data-testid="save-template"]').click();
        
        const templateSuccess = page.locator('[data-testid="template-save-success"]');
        await expect(templateSuccess).toBeVisible();
      });

      await test.step('Apply group template to new grid', async () => {
        // Clear current groups
        await page.locator('[data-testid="clear-all-groups"]').click();
        await page.locator('[data-testid="confirm-clear"]').click();
        
        // Apply template
        await page.locator('[data-testid="apply-template"]').click();
        await page.locator('[data-testid="template-standard-financial-analysis"]').click();
        await page.locator('[data-testid="apply-selected-template"]').click();
        
        // Verify template structure was recreated
        const recreatedGroups = page.locator('[data-testid^="column-group-"]');
        expect(await recreatedGroups.count()).toBe(4); // Parent + 3 children
        
        // Verify hierarchy
        const parentGroup = page.locator('[data-testid="column-group-financial-template"]');
        const childGroups = parentGroup.locator('[data-testid^="column-group-"]');
        expect(await childGroups.count()).toBe(3);
      });
    });

    test('should support group-level permissions and access control', async () => {
      await test.step('Configure group permissions', async () => {
        const sensitiveGroup = page.locator('[data-testid="column-group-confidential"]');
        await sensitiveGroup.click({ button: 'right' });
        await page.locator('[data-testid="group-permissions"]').click();
        
        // Set permission requirements
        await page.locator('[data-testid="require-authentication"]').check();
        await page.selectOption('[data-testid="permission-level"]', 'admin');
        await page.locator('[data-testid="apply-permissions"]').click();
        
        // Verify permission indicator
        const permissionIcon = sensitiveGroup.locator('[data-testid="group-permission-icon"]');
        await expect(permissionIcon).toBeVisible();
      });

      await test.step('Test access control enforcement', async () => {
        // Simulate non-admin user
        await page.evaluate(() => {
          (window as any).currentUserRole = 'viewer';
        });
        
        const protectedGroup = page.locator('[data-testid="column-group-confidential"]');
        await protectedGroup.click();
        
        // Should show access denied message
        const accessDenied = page.locator('[data-testid="access-denied-message"]');
        await expect(accessDenied).toBeVisible();
        
        // Group content should be hidden
        const groupColumns = protectedGroup.locator('[data-testid^="grouped-column-"]');
        expect(await groupColumns.count()).toBe(0);
      });
    });
  });

  test.afterEach(async () => {
    // Capture performance metrics
    const finalMetrics = await page.evaluate(() => (window as any).groupingMetrics);
    
    console.log('Column Grouping Performance:', {
      renderTime: finalMetrics.renderTime,
      dragDropTime: finalMetrics.dragDropTime,
      analyticsUpdateTime: finalMetrics.analyticsUpdateTime,
      memoryUsage: finalMetrics.memoryUsage
    });
    
    // Screenshot for visual documentation
    await page.screenshot({
      path: `e2e/screenshots/column-groups-${test.info().title.replace(/\s/g, '-').toLowerCase()}.png`,
      fullPage: true
    });
  });
});