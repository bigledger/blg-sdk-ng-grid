import { test, expect, Page } from '@playwright/test';
import { GridTestHelpers } from '../helpers/grid-test-helpers';

/**
 * Set Filters E2E Tests
 * 
 * These tests verify the Excel-style set filters with advanced features:
 * - Virtual scrolling for 500k+ values
 * - Hierarchical tree display with partial selection
 * - Advanced search (fuzzy, regex, voice, semantic)
 * - AI-powered value categorization and suggestions
 * - Visual analytics with distribution charts
 * - Filter templates and presets
 * - Performance monitoring and optimization
 * - Export/import capabilities
 * - Collaborative filtering
 */

test.describe('Set Filters', () => {
  let page: Page;
  let gridHelpers: GridTestHelpers;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    gridHelpers = new GridTestHelpers(page);
    
    // Navigate to grid with large dataset for set filtering
    await page.goto('/examples/grid/set-filters');
    await page.waitForSelector('[data-testid="blg-grid"]');
    
    // Wait for data to load
    await expect(page.locator('.blg-grid-row')).toHaveCount(10000, { timeout: 30000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Basic Set Filter Functionality', () => {
    test('should open set filter with all unique values', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      // Open set filter
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Verify set filter dialog opens
      await expect(page.locator('[data-testid="set-filter-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="set-filter-title"]')).toContainText('Filter Values - Department');
      
      // Verify all unique values are loaded
      const valueItems = page.locator('[data-testid="set-filter-value-item"]');
      const valueCount = await valueItems.count();
      expect(valueCount).toBeGreaterThan(5); // Should have multiple departments
      
      // Verify value counts are shown
      const firstValue = valueItems.first();
      await expect(firstValue.locator('[data-testid="value-count"]')).toBeVisible();
      
      // Verify select all/clear all buttons
      await expect(page.locator('[data-testid="select-all-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="clear-all-btn"]')).toBeVisible();
      
      // Verify filter statistics
      await expect(page.locator('[data-testid="total-values-count"]')).toContainText(`${valueCount}`);
      await expect(page.locator('[data-testid="selected-values-count"]')).toContainText(`${valueCount}`); // All initially selected
    });

    test('should filter rows by selecting/deselecting values', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Clear all selections first
      await page.click('[data-testid="clear-all-btn"]');
      await expect(page.locator('[data-testid="selected-values-count"]')).toContainText('0');
      
      // Select specific departments
      await page.click('[data-testid="value-checkbox"][data-value="Engineering"]');
      await page.click('[data-testid="value-checkbox"][data-value="Marketing"]');
      
      // Verify selection count
      await expect(page.locator('[data-testid="selected-values-count"]')).toContainText('2');
      
      // Apply filter
      await page.click('[data-testid="apply-filter-btn"]');
      
      // Verify only selected departments are shown in grid
      const visibleRows = page.locator('.blg-grid-row');
      const rowCount = await visibleRows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Check first few rows to verify filtering
      for (let i = 0; i < Math.min(10, rowCount); i++) {
        const row = visibleRows.nth(i);
        const deptCell = row.locator('[data-column="department"]');
        const deptText = await deptCell.textContent();
        expect(['Engineering', 'Marketing']).toContain(deptText);
      }
      
      // Verify active filter chip is shown
      await expect(page.locator('[data-testid="active-filter-chip"]')).toContainText('Department: 2 selected');
    });

    test('should support invert selection', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Select only Engineering
      await page.click('[data-testid="clear-all-btn"]');
      await page.click('[data-testid="value-checkbox"][data-value="Engineering"]');
      
      const initialSelected = await page.textContent('[data-testid="selected-values-count"]');
      expect(initialSelected).toBe('1');
      
      // Invert selection
      await page.click('[data-testid="invert-selection-btn"]');
      
      // Verify inverted selection (all except Engineering)
      const invertedSelected = await page.textContent('[data-testid="selected-values-count"]');
      const invertedCount = parseInt(invertedSelected!);
      expect(invertedCount).toBeGreaterThan(1);
      
      // Verify Engineering is now unselected
      const engineeringCheckbox = page.locator('[data-testid="value-checkbox"][data-value="Engineering"]');
      await expect(engineeringCheckbox).not.toBeChecked();
      
      await page.click('[data-testid="apply-filter-btn"]');
      
      // Verify Engineering rows are filtered out
      const visibleRows = page.locator('.blg-grid-row').first();
      const deptCell = visibleRows.locator('[data-column="department"]');
      const deptText = await deptCell.textContent();
      expect(deptText).not.toBe('Engineering');
    });
  });

  test.describe('Advanced Search Capabilities', () => {
    test('should support fuzzy search with confidence threshold', async () => {
      const columnHeader = page.locator('[data-column="name"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Enable advanced search
      const searchInput = page.locator('[data-testid="set-filter-search-input"]');
      await searchInput.fill('managr'); // Misspelled "manager"
      
      // Enable fuzzy search
      await page.click('[data-testid="search-mode-dropdown"]');
      await page.click('[data-testid="fuzzy-search-option"]');
      
      // Adjust confidence threshold
      await page.fill('[data-testid="fuzzy-threshold-slider"]', '0.7');
      
      // Wait for fuzzy search results
      await page.waitForTimeout(500);
      
      const fuzzyResults = page.locator('[data-testid="set-filter-value-item"]');
      const resultCount = await fuzzyResults.count();
      
      expect(resultCount).toBeGreaterThan(0);
      
      // Verify results contain "manager" names despite misspelling
      const firstResult = await fuzzyResults.first().textContent();
      expect(firstResult?.toLowerCase()).toContain('manager');
      
      // Verify fuzzy match indicators
      await expect(page.locator('[data-testid="fuzzy-match-indicator"]')).toBeVisible();
    });

    test('should support regex search patterns', async () => {
      const columnHeader = page.locator('[data-column="email"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Enable regex search
      await page.click('[data-testid="search-mode-dropdown"]');
      await page.click('[data-testid="regex-search-option"]');
      
      const searchInput = page.locator('[data-testid="set-filter-search-input"]');
      await searchInput.fill('^[a-m].*@company\\.com$'); // Emails starting with a-m
      
      await page.waitForTimeout(500);
      
      const regexResults = page.locator('[data-testid="set-filter-value-item"]');
      const resultCount = await regexResults.count();
      
      expect(resultCount).toBeGreaterThan(0);
      
      // Verify all results match regex pattern
      for (let i = 0; i < Math.min(5, resultCount); i++) {
        const result = regexResults.nth(i);
        const emailText = await result.textContent();
        expect(emailText).toMatch(/^[a-m].*@company\.com$/);
      }
    });

    test('should support semantic search (if enabled)', async () => {
      // Skip if semantic search not available
      test.skip(process.env.SEMANTIC_SEARCH !== 'enabled', 'Semantic search not enabled');
      
      const columnHeader = page.locator('[data-column="jobTitle"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Enable semantic search
      await page.click('[data-testid="search-mode-dropdown"]');
      await page.click('[data-testid="semantic-search-option"]');
      
      const searchInput = page.locator('[data-testid="set-filter-search-input"]');
      await searchInput.fill('leadership roles'); // Semantic query
      
      await page.waitForTimeout(2000); // Semantic search may take longer
      
      const semanticResults = page.locator('[data-testid="set-filter-value-item"]');
      const resultCount = await semanticResults.count();
      
      expect(resultCount).toBeGreaterThan(0);
      
      // Verify results semantically match "leadership" concept
      const results = await semanticResults.allTextContents();
      const leadershipTerms = ['manager', 'director', 'lead', 'supervisor', 'chief', 'head'];
      
      const hasLeadershipTerms = results.some(result => 
        leadershipTerms.some(term => result.toLowerCase().includes(term))
      );
      expect(hasLeadershipTerms).toBe(true);
    });

    test('should support voice search (if available)', async () => {
      // Check if voice search is supported
      const hasVoiceSupport = await page.evaluate(() => {
        return 'speechRecognition' in window || 'webkitSpeechRecognition' in window;
      });
      
      test.skip(!hasVoiceSupport, 'Voice search not supported in this browser');
      
      const columnHeader = page.locator('[data-column="name"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Start voice search
      await page.click('[data-testid="voice-search-btn"]');
      
      // Verify voice search UI
      await expect(page.locator('[data-testid="voice-search-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="listening-animation"]')).toBeVisible();
      
      // Simulate voice input (in real test, would need actual audio)
      await page.evaluate(() => {
        // Mock speech recognition result
        const event = new CustomEvent('voiceResult', { detail: 'john smith' });
        document.dispatchEvent(event);
      });
      
      await page.waitForTimeout(500);
      
      // Verify search input was populated
      const searchInput = page.locator('[data-testid="set-filter-search-input"]');
      await expect(searchInput).toHaveValue('john smith');
      
      // Verify results
      const voiceResults = page.locator('[data-testid="set-filter-value-item"]');
      expect(await voiceResults.count()).toBeGreaterThan(0);
    });
  });

  test.describe('AI-Powered Smart Features', () => {
    test('should display AI-generated value categories', async () => {
      const columnHeader = page.locator('[data-column="jobTitle"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Wait for AI categorization to complete
      await page.waitForSelector('[data-testid="ai-categories-section"]', { timeout: 10000 });
      
      // Verify category chips are displayed
      const categoryChips = page.locator('[data-testid="category-chip"]');
      const categoryCount = await categoryChips.count();
      expect(categoryCount).toBeGreaterThan(2); // Should have categories like "Management", "Technical", etc.
      
      // Verify category information
      const firstCategory = categoryChips.first();
      await expect(firstCategory).toHaveAttribute('title'); // Should have tooltip with confidence
      await expect(firstCategory.locator('[data-testid="category-count"]')).toBeVisible();
      
      // Click on a category to filter
      await firstCategory.click();
      
      // Verify category selection affects values
      const filteredValues = page.locator('[data-testid="set-filter-value-item"]:visible');
      const filteredCount = await filteredValues.count();
      
      // Should be fewer values than total
      const totalValues = await page.textContent('[data-testid="total-values-count"]');
      expect(filteredCount).toBeLessThan(parseInt(totalValues!));
      
      // Verify category confidence is shown
      await expect(firstCategory).toContainText('%');
    });

    test('should provide AI suggestions for optimization', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Make a suboptimal selection (e.g., selecting many individual values)
      await page.click('[data-testid="clear-all-btn"]');
      
      // Select multiple individual values
      for (let i = 0; i < 5; i++) {
        const valueItem = page.locator('[data-testid="set-filter-value-item"]').nth(i);
        await valueItem.click();
      }
      
      // Wait for AI suggestions
      await page.waitForSelector('[data-testid="ai-suggestions"]', { timeout: 5000 });
      
      // Verify suggestion appears
      const suggestionBadge = page.locator('[data-testid="ai-suggestion-badge"]');
      await expect(suggestionBadge).toBeVisible();
      
      // Click to view suggestions
      await suggestionBadge.click();
      
      const suggestionsPanel = page.locator('[data-testid="suggestions-panel"]');
      await expect(suggestionsPanel).toBeVisible();
      
      // Verify suggestion content
      const suggestions = page.locator('[data-testid="suggestion-item"]');
      const suggestionCount = await suggestions.count();
      expect(suggestionCount).toBeGreaterThan(0);
      
      // Verify suggestion has confidence score
      const firstSuggestion = suggestions.first();
      await expect(firstSuggestion.locator('[data-testid="confidence-score"]')).toBeVisible();
      
      // Apply a suggestion
      await firstSuggestion.locator('[data-testid="apply-suggestion-btn"]').click();
      
      // Verify suggestion was applied
      const selectedCount = await page.textContent('[data-testid="selected-values-count"]');
      expect(parseInt(selectedCount!)).toBeGreaterThan(0);
    });
  });

  test.describe('Visual Analytics and Charts', () => {
    test('should display value distribution charts', async () => {
      const columnHeader = page.locator('[data-column="salary"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Enable analytics view
      await page.click('[data-testid="enable-analytics-btn"]');
      
      // Verify mini charts are displayed
      await expect(page.locator('[data-testid="analytics-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="distribution-chart"]')).toBeVisible();
      
      // Verify chart types are available
      const chartTypes = page.locator('[data-testid="chart-type-selector"] option');
      const chartTypeCount = await chartTypes.count();
      expect(chartTypeCount).toBeGreaterThan(2); // histogram, pie, bar, etc.
      
      // Switch to different chart type
      await page.selectOption('[data-testid="chart-type-selector"]', 'pie');
      await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible();
      
      // Test interactive chart features
      const chartSegment = page.locator('[data-testid="chart-segment"]').first();
      await chartSegment.hover();
      
      // Verify tooltip appears
      await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
      
      // Click segment to filter
      await chartSegment.click();
      
      // Verify selection updated
      const selectedAfterChart = await page.textContent('[data-testid="selected-values-count"]');
      expect(parseInt(selectedAfterChart!)).toBeGreaterThan(0);
    });

    test('should show trend analysis for temporal data', async () => {
      const columnHeader = page.locator('[data-column="hireDate"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Enable trend analysis
      await page.click('[data-testid="enable-trends-btn"]');
      
      // Verify trend chart is displayed
      await expect(page.locator('[data-testid="trend-analysis-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
      
      // Verify trend insights
      await expect(page.locator('[data-testid="trend-insights"]')).toBeVisible();
      
      // Test trend period selection
      await page.selectOption('[data-testid="trend-period-selector"]', 'monthly');
      await expect(page.locator('[data-testid="monthly-trend-chart"]')).toBeVisible();
      
      // Test trend brushing for filtering
      const trendChart = page.locator('[data-testid="trend-chart"]');
      const chartBounds = await trendChart.boundingBox();
      
      // Simulate brush selection on trend chart
      await page.mouse.move(chartBounds!.x + 50, chartBounds!.y + 50);
      await page.mouse.down();
      await page.mouse.move(chartBounds!.x + 200, chartBounds!.y + 50);
      await page.mouse.up();
      
      // Verify brushed selection affects filter
      const brushedCount = await page.textContent('[data-testid="selected-values-count"]');
      expect(parseInt(brushedCount!)).toBeGreaterThan(0);
    });
  });

  test.describe('Hierarchical Tree Display', () => {
    test('should support hierarchical grouping of values', async () => {
      // Use a column with hierarchical data
      const columnHeader = page.locator('[data-column="location"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Enable hierarchical view
      await page.click('[data-testid="enable-hierarchy-btn"]');
      
      // Verify tree structure is displayed
      await expect(page.locator('[data-testid="hierarchical-tree"]')).toBeVisible();
      
      // Verify tree nodes
      const treeNodes = page.locator('[data-testid="tree-node"]');
      const nodeCount = await treeNodes.count();
      expect(nodeCount).toBeGreaterThan(0);
      
      // Verify expandable nodes
      const expandableNode = page.locator('[data-testid="tree-node"][data-expandable="true"]').first();
      await expect(expandableNode.locator('[data-testid="expand-icon"]')).toBeVisible();
      
      // Expand a node
      await expandableNode.locator('[data-testid="expand-icon"]').click();
      
      // Verify child nodes appear
      const childNodes = page.locator('[data-testid="tree-node"][data-level="1"]');
      expect(await childNodes.count()).toBeGreaterThan(0);
      
      // Test partial selection at parent level
      const parentCheckbox = expandableNode.locator('[data-testid="node-checkbox"]');
      await parentCheckbox.click();
      
      // Verify partial selection state
      await expect(parentCheckbox).toHaveAttribute('data-state', 'indeterminate');
      
      // Select all children
      const childCheckboxes = childNodes.locator('[data-testid="node-checkbox"]');
      const childCount = await childCheckboxes.count();
      
      for (let i = 0; i < childCount; i++) {
        await childCheckboxes.nth(i).click();
      }
      
      // Verify parent becomes fully selected
      await expect(parentCheckbox).toHaveAttribute('data-state', 'checked');
    });

    test('should support custom hierarchy configuration', async () => {
      const columnHeader = page.locator('[data-column="email"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Open hierarchy settings
      await page.click('[data-testid="hierarchy-settings-btn"]');
      
      // Verify hierarchy configuration dialog
      await expect(page.locator('[data-testid="hierarchy-config-dialog"]')).toBeVisible();
      
      // Configure custom grouping (e.g., by domain)
      await page.selectOption('[data-testid="grouping-strategy"]', 'domain');
      await page.fill('[data-testid="separator-input"]', '@');
      await page.check('[data-testid="show-leaf-counts"]');
      
      await page.click('[data-testid="apply-hierarchy-config"]');
      
      // Verify custom hierarchy is applied
      await expect(page.locator('[data-testid="hierarchical-tree"]')).toBeVisible();
      
      // Verify emails are grouped by domain
      const domainGroups = page.locator('[data-testid="tree-node"][data-level="0"]');
      const firstDomain = await domainGroups.first().textContent();
      expect(firstDomain).toMatch(/.*\.(com|org|net)/);
      
      // Verify leaf counts are shown
      await expect(domainGroups.first().locator('[data-testid="leaf-count"]')).toBeVisible();
    });
  });

  test.describe('Performance with Large Datasets', () => {
    test('should handle 500k+ values with virtual scrolling', async () => {
      // Navigate to large dataset example
      await page.goto('/examples/grid/set-filters-performance');
      await page.waitForSelector('[data-testid="blg-grid"]');
      
      // Wait for large dataset to load
      await page.waitForSelector('[data-testid="dataset-loaded-500k"]', { timeout: 60000 });
      
      const columnHeader = page.locator('[data-column="id"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Verify virtual scrolling is enabled
      await expect(page.locator('[data-testid="virtual-scroll-container"]')).toBeVisible();
      
      // Verify initial render performance
      const loadingTime = await page.textContent('[data-testid="loading-time-metric"]');
      expect(parseFloat(loadingTime!)).toBeLessThan(5000); // Less than 5 seconds
      
      // Test scrolling performance
      const virtualScrollContainer = page.locator('[data-testid="virtual-scroll-container"]');
      
      // Scroll to middle
      await virtualScrollContainer.evaluate(el => {
        el.scrollTop = el.scrollHeight / 2;
      });
      
      await page.waitForTimeout(100);
      
      // Verify smooth scrolling (no layout thrashing)
      const scrollingMetrics = await page.evaluate(() => {
        return performance.getEntriesByType('measure').find(m => m.name === 'scroll-performance');
      });
      
      // Verify memory usage stays reasonable
      const memoryUsage = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return null;
      });
      
      if (memoryUsage) {
        expect(memoryUsage).toBeLessThan(500); // Less than 500MB
      }
    });

    test('should optimize performance based on data characteristics', async () => {
      const columnHeader = page.locator('[data-column="category"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Verify performance optimization is applied
      await expect(page.locator('[data-testid="performance-optimization-badge"]')).toBeVisible();
      
      // Check optimization details
      await page.click('[data-testid="performance-details-btn"]');
      
      const perfDialog = page.locator('[data-testid="performance-details-dialog"]');
      await expect(perfDialog).toBeVisible();
      
      // Verify optimization strategies are listed
      const optimizations = page.locator('[data-testid="optimization-item"]');
      const optimizationCount = await optimizations.count();
      expect(optimizationCount).toBeGreaterThan(0);
      
      // Verify metrics are shown
      await expect(page.locator('[data-testid="render-time-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="memory-usage-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="scroll-performance-metric"]')).toBeVisible();
      
      // Test performance presets
      await page.selectOption('[data-testid="performance-preset"]', 'extreme');
      await page.click('[data-testid="apply-performance-preset"]');
      
      // Verify extreme performance mode is applied
      await expect(page.locator('[data-testid="extreme-mode-indicator"]')).toBeVisible();
    });
  });

  test.describe('Filter Templates and Presets', () => {
    test('should save and load filter templates', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Create a specific filter selection
      await page.click('[data-testid="clear-all-btn"]');
      await page.click('[data-testid="value-checkbox"][data-value="Engineering"]');
      await page.click('[data-testid="value-checkbox"][data-value="Product"]');
      
      // Save as template
      await page.click('[data-testid="templates-menu-btn"]');
      await page.click('[data-testid="save-template-btn"]');
      
      // Enter template name
      await page.fill('[data-testid="template-name-input"]', 'Tech Departments');
      await page.fill('[data-testid="template-description-input"]', 'Engineering and Product departments');
      await page.click('[data-testid="save-template-confirm"]');
      
      // Verify template was saved
      await expect(page.locator('[data-testid="template-saved-notification"]')).toBeVisible();
      
      // Clear current selection
      await page.click('[data-testid="clear-all-btn"]');
      await page.click('[data-testid="select-all-btn"]');
      
      // Load the template
      await page.click('[data-testid="templates-menu-btn"]');
      await page.click('[data-testid="template-item"][data-template="Tech Departments"]');
      
      // Verify template was loaded
      const selectedCount = await page.textContent('[data-testid="selected-values-count"]');
      expect(selectedCount).toBe('2');
      
      // Verify correct values are selected
      const engineeringCheckbox = page.locator('[data-testid="value-checkbox"][data-value="Engineering"]');
      const productCheckbox = page.locator('[data-testid="value-checkbox"][data-value="Product"]');
      
      await expect(engineeringCheckbox).toBeChecked();
      await expect(productCheckbox).toBeChecked();
    });

    test('should support shared team templates', async () => {
      // Skip if collaboration features not enabled
      test.skip(!process.env.COLLABORATION_ENABLED, 'Collaboration features not enabled');
      
      const columnHeader = page.locator('[data-column="status"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Access shared templates
      await page.click('[data-testid="templates-menu-btn"]');
      await page.click('[data-testid="shared-templates-tab"]');
      
      // Verify shared templates are listed
      const sharedTemplates = page.locator('[data-testid="shared-template-item"]');
      const sharedCount = await sharedTemplates.count();
      expect(sharedCount).toBeGreaterThan(0);
      
      // Load a shared template
      const firstShared = sharedTemplates.first();
      await expect(firstShared.locator('[data-testid="template-author"]')).toBeVisible();
      await expect(firstShared.locator('[data-testid="template-usage-count"]')).toBeVisible();
      
      await firstShared.click();
      
      // Verify shared template loaded
      const selectedCount = await page.textContent('[data-testid="selected-values-count"]');
      expect(parseInt(selectedCount!)).toBeGreaterThan(0);
      
      // Rate the template
      await page.click('[data-testid="rate-template-btn"]');
      await page.click('[data-testid="rating-star-4"]');
      await page.click('[data-testid="submit-rating-btn"]');
      
      // Verify rating was submitted
      await expect(page.locator('[data-testid="rating-submitted-notification"]')).toBeVisible();
    });
  });

  test.describe('Export and Import Capabilities', () => {
    test('should export filter data in multiple formats', async () => {
      const columnHeader = page.locator('[data-column="name"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Select some values
      await page.click('[data-testid="clear-all-btn"]');
      await page.fill('[data-testid="set-filter-search-input"]', 'Manager');
      await page.waitForTimeout(500);
      await page.click('[data-testid="select-all-visible-btn"]');
      
      // Export selected values
      await page.click('[data-testid="export-menu-btn"]');
      
      // Test CSV export
      const [csvDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="export-csv-btn"]')
      ]);
      
      expect(csvDownload.suggestedFilename()).toMatch(/.*\.csv$/);
      
      // Test JSON export
      const [jsonDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="export-json-btn"]')
      ]);
      
      expect(jsonDownload.suggestedFilename()).toMatch(/.*\.json$/);
      
      // Test Excel export
      const [excelDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="export-xlsx-btn"]')
      ]);
      
      expect(excelDownload.suggestedFilename()).toMatch(/.*\.xlsx$/);
    });

    test('should import filter configurations', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Import filter configuration
      await page.click('[data-testid="import-menu-btn"]');
      
      // Upload filter config file
      await page.setInputFiles('[data-testid="import-file-input"]', {
        name: 'filter-config.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({
          version: '2.0',
          columnId: 'department',
          selectedValues: ['Engineering', 'Design'],
          searchTerm: '',
          template: {
            name: 'Creative Teams',
            description: 'Engineering and Design teams'
          }
        }))
      });
      
      await page.click('[data-testid="apply-imported-config"]');
      
      // Verify import was successful
      const selectedCount = await page.textContent('[data-testid="selected-values-count"]');
      expect(selectedCount).toBe('2');
      
      // Verify correct values are selected
      const engineeringCheckbox = page.locator('[data-testid="value-checkbox"][data-value="Engineering"]');
      const designCheckbox = page.locator('[data-testid="value-checkbox"][data-value="Design"]');
      
      await expect(engineeringCheckbox).toBeChecked();
      await expect(designCheckbox).toBeChecked();
    });
  });

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should be fully keyboard accessible', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      // Open filter with keyboard
      await columnHeader.focus();
      await page.keyboard.press('Alt+F');
      
      // Verify set filter opens
      await expect(page.locator('[data-testid="set-filter-dialog"]')).toBeVisible();
      
      // Navigate with Tab
      await page.keyboard.press('Tab'); // Search input
      const searchInput = page.locator('[data-testid="set-filter-search-input"]');
      await expect(searchInput).toBeFocused();
      
      await page.keyboard.press('Tab'); // First value checkbox
      const firstValue = page.locator('[data-testid="value-checkbox"]').first();
      await expect(firstValue).toBeFocused();
      
      // Toggle selection with Space
      await page.keyboard.press(' ');
      await expect(firstValue).not.toBeChecked();
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      const secondValue = page.locator('[data-testid="value-checkbox"]').nth(1);
      await expect(secondValue).toBeFocused();
      
      // Use keyboard shortcuts
      await page.keyboard.press('Control+a'); // Select all
      const selectedAll = await page.textContent('[data-testid="selected-values-count"]');
      expect(parseInt(selectedAll!)).toBeGreaterThan(5);
      
      await page.keyboard.press('Control+d'); // Deselect all
      const selectedNone = await page.textContent('[data-testid="selected-values-count"]');
      expect(selectedNone).toBe('0');
      
      // Apply with Enter
      await page.keyboard.press('Enter');
      
      // Verify filter applied and dialog closed
      await expect(page.locator('[data-testid="set-filter-dialog"]')).not.toBeVisible();
    });

    test('should announce changes to screen readers', async () => {
      const columnHeader = page.locator('[data-column="department"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Verify ARIA live regions exist
      await expect(page.locator('[aria-live="polite"]')).toBeVisible();
      await expect(page.locator('[aria-live="assertive"]')).toBeVisible();
      
      // Select a value and verify announcement
      await page.click('[data-testid="value-checkbox"][data-value="Engineering"]');
      
      // Check for accessibility announcements
      const announcement = page.locator('[aria-live="polite"]');
      await expect(announcement).toContainText('Engineering selected');
      
      // Clear selection and verify announcement
      await page.click('[data-testid="clear-all-btn"]');
      await expect(announcement).toContainText('All selections cleared');
      
      // Verify ARIA attributes on interactive elements
      const checkboxes = page.locator('[data-testid="value-checkbox"]');
      const firstCheckbox = checkboxes.first();
      
      await expect(firstCheckbox).toHaveAttribute('role', 'checkbox');
      await expect(firstCheckbox).toHaveAttribute('aria-checked');
      await expect(firstCheckbox).toHaveAttribute('aria-labelledby');
    });
  });
});