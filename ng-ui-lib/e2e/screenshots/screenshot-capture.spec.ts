import { test, expect, Page } from '@playwright/test';

/**
 * Screenshot Capture System for BigLedger Grid Features
 * 
 * This comprehensive screenshot suite captures beautiful, professional screenshots
 * that showcase BigLedger Grid's superiority over ag-grid:
 * 
 * 1. Feature showcase screenshots for marketing and documentation
 * 2. Step-by-step usage screenshots for tutorials
 * 3. Before/after comparisons with ag-grid
 * 4. Mobile responsive views across different devices
 * 5. Dark/light theme variations
 * 6. High-quality screenshots for presentations
 * 7. Interactive state captures (hover, focus, loading, etc.)
 * 8. Performance comparison visualizations
 */

test.describe('BigLedger Grid Screenshots', () => {
  
  test.describe('Enhanced Filtering System Screenshots', () => {
    test('should capture enhanced text filtering capabilities', async ({ page }) => {
      await page.goto('/examples/grid/filtering');
      await page.waitForLoadState('networkidle');
      
      // Capture main filtering interface
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/01-main-interface.png',
        fullPage: true,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Show advanced text operators
      await page.click('[data-column="name"] .column-header');
      await page.hover('[data-testid="filter-menu-trigger"]');
      await page.click('[data-testid="filter-menu-trigger"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/02-text-operators-menu.png',
        clip: { x: 200, y: 100, width: 400, height: 600 }
      });
      
      // Demo fuzzy matching
      await page.selectOption('[data-testid="text-operator-select"]', 'fuzzy');
      await page.fill('[data-testid="text-filter-input"]', 'Jhon'); // Misspelled
      await page.fill('[data-testid="fuzzy-confidence-slider"]', '0.8');
      
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/03-fuzzy-matching.png',
        clip: { x: 200, y: 100, width: 500, height: 700 }
      });
      
      // Show performance metrics
      await page.click('[data-testid="enable-performance-monitoring"]');
      await page.click('[data-testid="apply-filter"]');
      await page.waitForSelector('[data-testid="performance-metrics"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/04-performance-metrics.png',
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
    });

    test('should capture date range filtering with calendar', async ({ page }) => {
      await page.goto('/examples/grid/filtering');
      
      // Open date filter
      await page.click('[data-column="createdDate"] .column-header');
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.selectOption('[data-testid="date-operator-select"]', 'between');
      
      // Open calendar picker
      await page.click('[data-testid="start-date-picker-trigger"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/05-date-calendar-picker.png',
        clip: { x: 200, y: 100, width: 600, height: 500 }
      });
      
      // Show relative date options
      await page.selectOption('[data-testid="date-operator-select"]', 'relative');
      
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/06-relative-date-options.png',
        clip: { x: 200, y: 100, width: 500, height: 400 }
      });
    });

    test('should capture number range filtering with sliders', async ({ page }) => {
      await page.goto('/examples/grid/filtering');
      
      // Open number range filter
      await page.click('[data-column="salary"] .column-header');
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.selectOption('[data-testid="number-operator-select"]', 'between');
      
      // Show range slider
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/07-number-range-slider.png',
        clip: { x: 200, y: 100, width: 600, height: 400 }
      });
      
      // Show statistical operators
      await page.selectOption('[data-testid="number-operator-select"]', 'topPercent');
      
      await page.screenshot({
        path: 'e2e/screenshots/enhanced-filtering/08-statistical-operators.png',
        clip: { x: 200, y: 100, width: 500, height: 350 }
      });
    });
  });

  test.describe('Set Filters Screenshots', () => {
    test('should capture Excel-style set filter interface', async ({ page }) => {
      await page.goto('/examples/grid/set-filters');
      await page.waitForLoadState('networkidle');
      
      // Open set filter
      await page.click('[data-column="department"] .column-header');
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Main set filter interface
      await page.screenshot({
        path: 'e2e/screenshots/set-filters/01-main-interface.png',
        clip: { x: 300, y: 100, width: 800, height: 700 }
      });
      
      // Enable analytics view with charts
      await page.click('[data-testid="enable-analytics-btn"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/set-filters/02-analytics-charts.png',
        clip: { x: 300, y: 100, width: 800, height: 700 }
      });
      
      // Show hierarchical tree view
      await page.click('[data-testid="enable-hierarchy-btn"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/set-filters/03-hierarchical-tree.png',
        clip: { x: 300, y: 100, width: 800, height: 700 }
      });
    });

    test('should capture AI-powered smart features', async ({ page }) => {
      await page.goto('/examples/grid/set-filters');
      
      await page.click('[data-column="jobTitle"] .column-header');
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Wait for AI categorization
      await page.waitForSelector('[data-testid="ai-categories-section"]', { timeout: 10000 });
      
      // AI-generated categories
      await page.screenshot({
        path: 'e2e/screenshots/set-filters/04-ai-categories.png',
        clip: { x: 300, y: 100, width: 800, height: 700 }
      });
      
      // AI suggestions panel
      await page.click('[data-testid="ai-suggestion-badge"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/set-filters/05-ai-suggestions.png',
        clip: { x: 200, y: 100, width: 1000, height: 600 }
      });
    });

    test('should capture performance with large datasets', async ({ page }) => {
      await page.goto('/examples/grid/set-filters-performance');
      await page.waitForSelector('[data-testid="dataset-loaded-500k"]', { timeout: 60000 });
      
      await page.click('[data-column="id"] .column-header');
      await page.click('[data-testid="set-filter-trigger"]');
      
      // Virtual scrolling with 500k+ values
      await page.screenshot({
        path: 'e2e/screenshots/set-filters/06-virtual-scrolling-performance.png',
        clip: { x: 300, y: 100, width: 800, height: 700 }
      });
      
      // Performance optimization panel
      await page.click('[data-testid="performance-details-btn"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/set-filters/07-performance-optimization.png',
        clip: { x: 200, y: 100, width: 1000, height: 600 }
      });
    });
  });

  test.describe('Multi-Filters Visual Builder Screenshots', () => {
    test('should capture drag-and-drop visual builder', async ({ page }) => {
      await page.goto('/examples/grid/multi-filters');
      
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="advanced-builder-tab"]');
      
      // Main visual builder interface
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/01-visual-builder.png',
        fullPage: true
      });
      
      // Create complex nested groups
      await page.click('[data-testid="add-filter-group-btn"]');
      await page.click('[data-testid="add-filter-group-btn"]');
      
      // Add conditions to groups
      const group1 = page.locator('[data-testid="filter-group"]').first();
      await group1.locator('[data-testid="add-condition-to-group"]').click();
      await group1.locator('[data-testid="add-condition-to-group"]').click();
      
      // Complex nested structure
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/02-complex-nesting.png',
        fullPage: true
      });
    });

    test('should capture natural language processing', async ({ page }) => {
      await page.goto('/examples/grid/multi-filters');
      
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="natural-language-tab"]');
      
      // Natural language interface
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/03-natural-language-interface.png',
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Enter complex query
      await page.fill('[data-testid="natural-language-input"]', 'Find all senior engineers or managers in product department with salary between 80000 and 120000 who have been with company for more than 2 years');
      await page.click('[data-testid="process-nl-query-btn"]');
      
      await page.waitForSelector('[data-testid="nl-processing-complete"]', { timeout: 15000 });
      
      // Parsed query results
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/04-parsed-natural-query.png',
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
    });

    test('should capture formula editor', async ({ page }) => {
      await page.goto('/examples/grid/multi-filters');
      
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="formula-editor-tab"]');
      
      // Formula editor with syntax highlighting
      const complexFormula = '(department = "Engineering" AND salary > AVG(salary)) OR (experience >= PERCENTILE(experience, 90) AND rating > 4.5)';
      await page.fill('[data-testid="formula-input"]', complexFormula);
      
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/05-formula-editor.png',
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Show autocomplete suggestions
      await page.fill('[data-testid="formula-input"]', 'dep');
      await page.keyboard.press('Control+ ');
      
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/06-formula-autocomplete.png',
        clip: { x: 200, y: 200, width: 800, height: 400 }
      });
    });

    test('should capture AI suggestions and optimization', async ({ page }) => {
      await page.goto('/examples/grid/multi-filters');
      
      await page.click('[data-testid="advanced-filter-btn"]');
      
      // Create suboptimal filter to trigger AI suggestions
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="add-condition-btn"]');
        const condition = page.locator('[data-testid="filter-condition"]').nth(i);
        await condition.locator('[data-testid="column-selector"]').selectOption('description');
        await condition.locator('[data-testid="operator-selector"]').selectOption('contains');
        await condition.locator('[data-testid="value-input"]').fill(`text${i}`);
      }
      
      await page.click('[data-testid="apply-filter-btn"]');
      await page.waitForSelector('[data-testid="ai-suggestion-badge"]');
      
      // AI suggestions panel
      await page.click('[data-testid="ai-suggestion-badge"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/07-ai-suggestions.png',
        fullPage: true
      });
      
      // Performance optimization
      await page.click('[data-testid="optimize-filter-btn"]');
      await page.waitForSelector('[data-testid="optimization-complete"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/multi-filters/08-performance-optimization.png',
        fullPage: true
      });
    });
  });

  test.describe('Column Groups Screenshots', () => {
    test('should capture nested column groups', async ({ page }) => {
      await page.goto('/examples/grid/column-groups');
      await page.waitForLoadState('networkidle');
      
      // Main column groups interface
      await page.screenshot({
        path: 'e2e/screenshots/column-groups/01-nested-groups.png',
        fullPage: true
      });
      
      // Expanded group with statistics
      const group = page.locator('[data-testid="column-group"][data-expandable="true"]').first();
      await group.locator('[data-testid="expand-collapse-btn"]').click();
      
      await page.screenshot({
        path: 'e2e/screenshots/column-groups/02-expanded-with-stats.png',
        fullPage: true
      });
    });

    test('should capture AI-powered grouping', async ({ page }) => {
      await page.goto('/examples/grid/column-groups');
      
      // Enable AI grouping
      await page.click('[data-testid="ai-grouping-toggle"]');
      await page.waitForSelector('[data-testid="ai-analysis-complete"]');
      
      // AI suggestions
      await page.screenshot({
        path: 'e2e/screenshots/column-groups/03-ai-grouping-suggestions.png',
        fullPage: true
      });
      
      // AI analysis panel
      await page.click('[data-testid="ai-analysis-panel-btn"]');
      await page.click('[data-testid="analyze-relationships-btn"]');
      await page.waitForSelector('[data-testid="relationship-analysis-complete"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/column-groups/04-ai-relationship-analysis.png',
        fullPage: true
      });
    });

    test('should capture drag-and-drop functionality', async ({ page }) => {
      await page.goto('/examples/grid/column-groups');
      
      // Start drag operation
      const sourceColumn = page.locator('[data-testid="draggable-column"]').first();
      await sourceColumn.hover();
      await page.mouse.down();
      
      // Show drag preview and drop zones
      await page.screenshot({
        path: 'e2e/screenshots/column-groups/05-drag-drop-preview.png',
        fullPage: true
      });
      
      await page.mouse.up();
    });

    test('should capture animations and effects', async ({ page }) => {
      await page.goto('/examples/grid/column-groups');
      
      // Hover effects
      const group = page.locator('[data-testid="column-group"]').first();
      await group.hover();
      
      await page.screenshot({
        path: 'e2e/screenshots/column-groups/06-hover-effects.png',
        clip: { x: 0, y: 0, width: 1920, height: 400 }
      });
      
      // Focus effects
      await group.focus();
      
      await page.screenshot({
        path: 'e2e/screenshots/column-groups/07-focus-effects.png',
        clip: { x: 0, y: 0, width: 1920, height: 400 }
      });
    });
  });

  test.describe('Keyboard Navigation Screenshots', () => {
    test('should capture navigation modes', async ({ page }) => {
      await page.goto('/examples/grid/keyboard-navigation');
      await page.click('[data-testid="blg-grid"]');
      
      // Standard navigation with focus indicator
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/01-standard-navigation.png',
        fullPage: true
      });
      
      // Enable knight mode
      await page.keyboard.press('Alt+Shift+k');
      
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/02-knight-mode.png',
        fullPage: true
      });
      
      // Vi/Vim mode
      await page.keyboard.press('Alt+Shift+v');
      
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/03-vim-mode.png',
        fullPage: true
      });
      
      // WASD gaming mode
      await page.click('[data-testid="navigation-mode-selector"]');
      await page.click('[data-testid="wasd-mode-option"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/04-wasd-mode.png',
        fullPage: true
      });
    });

    test('should capture macro recording', async ({ page }) => {
      await page.goto('/examples/grid/keyboard-navigation');
      await page.click('[data-testid="blg-grid"]');
      
      // Start macro recording
      await page.keyboard.press('F3');
      
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/05-macro-recording.png',
        fullPage: true
      });
      
      // Macro management
      await page.keyboard.press('F3'); // Stop recording
      await page.keyboard.press('Alt+F3'); // Open macro manager
      
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/06-macro-management.png',
        clip: { x: 200, y: 100, width: 800, height: 600 }
      });
    });

    test('should capture accessibility features', async ({ page }) => {
      await page.goto('/examples/grid/keyboard-navigation');
      await page.click('[data-testid="blg-grid"]');
      
      // Keyboard help
      await page.keyboard.press('F1');
      
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/07-keyboard-help.png',
        fullPage: true
      });
      
      // Navigation breadcrumbs
      await page.keyboard.press('Escape'); // Close help
      await page.keyboard.press('Alt+b'); // Enable breadcrumbs
      
      // Navigate around to create breadcrumb trail
      await page.keyboard.press('Control+End');
      await page.keyboard.press('Control+Home');
      await page.keyboard.press('PageDown');
      
      await page.screenshot({
        path: 'e2e/screenshots/keyboard-navigation/08-navigation-breadcrumbs.png',
        fullPage: true
      });
    });
  });

  test.describe('Responsive Design Screenshots', () => {
    test('should capture mobile views', async ({ page }) => {
      // Mobile portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/examples/grid/responsive');
      
      await page.screenshot({
        path: 'e2e/screenshots/responsive/01-mobile-portrait.png',
        fullPage: true
      });
      
      // Mobile landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      
      await page.screenshot({
        path: 'e2e/screenshots/responsive/02-mobile-landscape.png',
        fullPage: true
      });
      
      // Tablet portrait
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      await page.screenshot({
        path: 'e2e/screenshots/responsive/03-tablet-portrait.png',
        fullPage: true
      });
      
      // Tablet landscape
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.reload();
      
      await page.screenshot({
        path: 'e2e/screenshots/responsive/04-tablet-landscape.png',
        fullPage: true
      });
    });

    test('should capture responsive filtering on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/examples/grid/filtering');
      
      // Mobile filter menu
      await page.click('[data-testid="mobile-filter-btn"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/responsive/05-mobile-filter-menu.png',
        fullPage: true
      });
      
      // Mobile set filter
      await page.click('[data-testid="mobile-set-filter-btn"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/responsive/06-mobile-set-filter.png',
        fullPage: true
      });
    });
  });

  test.describe('Theme Variations Screenshots', () => {
    test('should capture light theme', async ({ page }) => {
      await page.goto('/examples/grid/theming?theme=light');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/themes/01-light-theme.png',
        fullPage: true
      });
    });

    test('should capture dark theme', async ({ page }) => {
      await page.goto('/examples/grid/theming?theme=dark');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/themes/02-dark-theme.png',
        fullPage: true
      });
    });

    test('should capture high contrast theme', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/examples/grid/theming?theme=high-contrast');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/themes/03-high-contrast-theme.png',
        fullPage: true
      });
    });

    test('should capture corporate themes', async ({ page }) => {
      // Corporate blue
      await page.goto('/examples/grid/theming?theme=corporate-blue');
      await page.screenshot({
        path: 'e2e/screenshots/themes/04-corporate-blue.png',
        fullPage: true
      });
      
      // Corporate green
      await page.goto('/examples/grid/theming?theme=corporate-green');
      await page.screenshot({
        path: 'e2e/screenshots/themes/05-corporate-green.png',
        fullPage: true
      });
    });
  });

  test.describe('Performance Comparison Screenshots', () => {
    test('should capture performance benchmarks', async ({ page }) => {
      await page.goto('/examples/grid/performance-comparison');
      await page.waitForLoadState('networkidle');
      
      // Performance dashboard
      await page.screenshot({
        path: 'e2e/screenshots/performance/01-performance-dashboard.png',
        fullPage: true
      });
      
      // Start benchmark
      await page.click('[data-testid="start-benchmark-btn"]');
      await page.waitForSelector('[data-testid="benchmark-complete"]', { timeout: 30000 });
      
      // Results comparison
      await page.screenshot({
        path: 'e2e/screenshots/performance/02-benchmark-results.png',
        fullPage: true
      });
      
      // Memory usage comparison
      await page.click('[data-testid="memory-usage-tab"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/performance/03-memory-usage.png',
        fullPage: true
      });
      
      // Rendering performance
      await page.click('[data-testid="rendering-performance-tab"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/performance/04-rendering-performance.png',
        fullPage: true
      });
    });

    test('should capture large dataset handling', async ({ page }) => {
      await page.goto('/examples/grid/large-dataset');
      
      // Load 100k rows
      await page.click('[data-testid="load-100k-rows"]');
      await page.waitForSelector('[data-testid="dataset-loaded"]', { timeout: 30000 });
      
      await page.screenshot({
        path: 'e2e/screenshots/performance/05-100k-rows-loaded.png',
        fullPage: true
      });
      
      // Load 500k rows
      await page.click('[data-testid="load-500k-rows"]');
      await page.waitForSelector('[data-testid="dataset-loaded"]', { timeout: 60000 });
      
      await page.screenshot({
        path: 'e2e/screenshots/performance/06-500k-rows-loaded.png',
        fullPage: true
      });
      
      // Virtual scrolling in action
      await page.mouse.wheel(0, 5000);
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: 'e2e/screenshots/performance/07-virtual-scrolling.png',
        fullPage: true
      });
    });
  });

  test.describe('Marketing and Presentation Screenshots', () => {
    test('should capture hero screenshots for marketing', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/examples/grid/showcase');
      await page.waitForLoadState('networkidle');
      
      // Hero shot - main grid with all features visible
      await page.screenshot({
        path: 'e2e/screenshots/marketing/01-hero-shot.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Feature comparison layout
      await page.click('[data-testid="comparison-mode-btn"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/marketing/02-feature-comparison.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Interactive demo state
      await page.click('[data-testid="interactive-demo-btn"]');
      await page.waitForTimeout(2000); // Allow animations to complete
      
      await page.screenshot({
        path: 'e2e/screenshots/marketing/03-interactive-demo.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
    });

    test('should capture feature highlights for presentations', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // AI-powered features highlight
      await page.goto('/examples/grid/ai-features');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/presentation/01-ai-features-highlight.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Performance excellence
      await page.goto('/examples/grid/performance-excellence');
      
      await page.screenshot({
        path: 'e2e/screenshots/presentation/02-performance-excellence.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Developer experience
      await page.goto('/examples/grid/developer-experience');
      
      await page.screenshot({
        path: 'e2e/screenshots/presentation/03-developer-experience.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Enterprise ready
      await page.goto('/examples/grid/enterprise-ready');
      
      await page.screenshot({
        path: 'e2e/screenshots/presentation/04-enterprise-ready.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
    });

    test('should capture before/after ag-grid comparison', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // ag-grid simulation (limited features)
      await page.goto('/examples/comparison/ag-grid-simulation');
      
      await page.screenshot({
        path: 'e2e/screenshots/comparison/01-ag-grid-before.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // BigLedger Grid (enhanced features)
      await page.goto('/examples/comparison/bigleger-grid-enhanced');
      
      await page.screenshot({
        path: 'e2e/screenshots/comparison/02-bigleger-grid-after.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Side-by-side comparison
      await page.goto('/examples/comparison/side-by-side');
      
      await page.screenshot({
        path: 'e2e/screenshots/comparison/03-side-by-side-comparison.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Feature matrix comparison
      await page.click('[data-testid="feature-matrix-tab"]');
      
      await page.screenshot({
        path: 'e2e/screenshots/comparison/04-feature-matrix.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
    });
  });
});