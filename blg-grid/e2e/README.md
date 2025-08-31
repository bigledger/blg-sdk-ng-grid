# BLG Grid - Playwright Test Infrastructure

This directory contains a comprehensive end-to-end testing suite for the BLG Angular Grid Library using Playwright.

## 📁 Directory Structure

```
e2e/
├── accessibility/          # Accessibility compliance tests
├── data/                   # Test data management
│   ├── data-factory.ts    # Test data generation
│   ├── test-data-manager.ts # Data management utilities
│   └── types.ts           # Type definitions
├── fixtures/              # Test fixtures and setup
├── helpers/               # Test helper utilities
│   ├── grid-helper.ts     # Grid-specific operations
│   └── test-helpers.ts    # General test utilities
├── pages/                 # Page Object Models
│   └── grid-page.ts       # Main grid page object
├── performance/           # Performance benchmark tests
├── tests/                 # Core test suites
│   ├── grid-rendering.spec.ts
│   ├── virtual-scrolling.spec.ts
│   ├── sorting.spec.ts
│   ├── filtering.spec.ts
│   ├── row-selection.spec.ts
│   ├── column-operations.spec.ts
│   └── keyboard-navigation.spec.ts
├── visual/                # Visual regression tests
├── config/                # Test configuration
├── global-setup.ts        # Global test setup
└── global-teardown.ts     # Global test cleanup
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Angular CLI (for running the demo application)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests with UI mode
npm run test:e2e:ui

# Run specific test categories
npm run test:accessibility
npm run test:performance
npm run test:visual

# Debug tests
npm run test:e2e:debug
```

### Test Development

```bash
# Generate tests with Playwright codegen
npm run playwright:codegen

# Update visual regression baselines
npm run test:visual

# View test reports
npm run playwright:report
```

## 📋 Test Categories

### 1. Grid Rendering & Initialization
- **File**: `tests/grid-rendering.spec.ts`
- **Coverage**: Basic grid structure, data loading, empty states, theming
- **Key Tests**:
  - Grid container structure validation
  - Data loading with different datasets
  - Empty state handling
  - Theme switching
  - Performance measurements

### 2. Virtual Scrolling
- **File**: `tests/virtual-scrolling.spec.ts`
- **Coverage**: Large dataset handling, scroll performance, memory efficiency
- **Key Tests**:
  - Virtual scrolling with large datasets
  - Scroll position maintenance
  - Memory usage optimization
  - Keyboard navigation with virtual scrolling

### 3. Sorting Functionality
- **File**: `tests/sorting.spec.ts`
- **Coverage**: Single/multi-column sorting, data type handling
- **Key Tests**:
  - Single column sorting (all data types)
  - Multi-column sorting with Ctrl+Click
  - Sort indicators and state management
  - Performance with large datasets

### 4. Filtering System
- **File**: `tests/filtering.spec.ts`
- **Coverage**: All filter types, multiple filters, filter performance
- **Key Tests**:
  - Text filters (contains, equals, starts with, etc.)
  - Numeric and date filters
  - Boolean filtering
  - Multiple filter combinations
  - Filter clearing and state management

### 5. Row Selection
- **File**: `tests/row-selection.spec.ts`
- **Coverage**: Single, multiple, and checkbox selection modes
- **Key Tests**:
  - Single row selection
  - Multiple row selection with keyboard modifiers
  - Checkbox selection mode
  - Selection persistence during operations

### 6. Column Operations
- **File**: `tests/column-operations.spec.ts`
- **Coverage**: Resize, reorder, hide/show, pinning
- **Key Tests**:
  - Column resizing with drag handles
  - Column reordering via drag & drop
  - Column visibility management
  - Column pinning (if supported)

### 7. Keyboard Navigation
- **File**: `tests/keyboard-navigation.spec.ts`
- **Coverage**: Full keyboard accessibility
- **Key Tests**:
  - Arrow key navigation
  - Tab navigation
  - Home/End/Page Up/Down keys
  - Keyboard shortcuts and actions

### 8. Accessibility Compliance
- **File**: `accessibility/accessibility.spec.ts`
- **Coverage**: WCAG 2.1 compliance, screen reader support
- **Key Tests**:
  - Automated accessibility scanning
  - Keyboard navigation patterns
  - ARIA attributes and roles
  - Screen reader announcements
  - Focus management

### 9. Performance Benchmarks
- **File**: `performance/performance.spec.ts`
- **Coverage**: Rendering, scrolling, operation performance
- **Key Tests**:
  - Initial render time measurements
  - Scroll performance metrics
  - Sort/filter operation timing
  - Memory usage analysis

### 10. Visual Regression
- **File**: `visual/visual-regression.spec.ts`
- **Coverage**: UI consistency across changes
- **Key Tests**:
  - Grid layout screenshots
  - Theme variations
  - Responsive design
  - Component states

## 🧪 Test Data Management

### Data Factory
The `DataFactory` class generates realistic test data:

```typescript
// Generate different dataset sizes
const smallDataset = DataFactory.createSmallDataset(); // 50 rows
const mediumDataset = DataFactory.createMediumDataset(); // 500 rows
const largeDataset = DataFactory.createLargeDataset(); // 5000 rows
const performanceDataset = DataFactory.createPerformanceDataset(); // 10000 rows
```

### Available Datasets
- **small**: 50 rows, basic testing
- **medium**: 500 rows, standard functionality
- **large**: 5000 rows, virtual scrolling
- **performance**: 10000 rows, performance testing
- **mixed**: Various data types with null values
- **empty**: No data, edge case testing

## 🛠 Helper Utilities

### GridHelper
Provides grid-specific operations:

```typescript
const gridHelper = new GridHelper(page);

// Navigation
await gridHelper.scrollToRow(100);
await gridHelper.navigateWithKeyboard('ArrowDown');

// Operations
await gridHelper.sortColumn('firstName', 'asc');
await gridHelper.applyTextFilter('email', 'contains', '@example.com');
await gridHelper.selectRow(5);

// Validation
await gridHelper.validateGridStructure();
const rowCount = await gridHelper.getRowCount();
```

### TestHelpers
General testing utilities:

```typescript
const testHelper = new TestHelpers(page);

// Waiting
await testHelper.waitForElement('[data-testid="grid-loaded"]');
await testHelper.waitForText('.status', 'Ready');

// Interaction
await testHelper.clickAndWait('.button', '.modal');
await testHelper.dragAndDrop('.item', '.target');

// Validation
await testHelper.expectElementToBeVisible('.success-message');
```

## 📊 Performance Monitoring

### Automated Benchmarks
Performance tests run automatically and measure:
- Initial render time
- Scroll performance
- Sort operation timing
- Filter operation timing
- Memory usage patterns

### Thresholds
```typescript
const PERFORMANCE_THRESHOLDS = {
  renderTime: 3000,    // 3 seconds max
  sortTime: 2000,      // 2 seconds max
  filterTime: 2000,    // 2 seconds max
  scrollTime: 500,     // 500ms max
  memoryIncrease: 100  // 100% max increase
};
```

## 🔧 Configuration

### Playwright Configuration
Key settings in `playwright.config.ts`:

```typescript
{
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['junit'], ['json']],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
}
```

### Test Environment
- **Browser**: Chromium, Firefox, WebKit support
- **Viewports**: Desktop, tablet, mobile testing
- **Base URL**: http://localhost:4200 (configurable)

## 🔍 Debugging Tests

### Visual Debugging
```bash
# Run with headed browser
npm run test:e2e:headed

# Use Playwright UI mode
npm run test:e2e:ui

# Debug specific test
npx playwright test --debug grid-rendering.spec.ts
```

### Debug Helpers
```typescript
// Take screenshots for debugging
await gridHelper.takeGridScreenshot('debug-state');

// Wait for manual inspection
await page.pause();

// Log performance metrics
const metrics = await testHelper.getPerformanceMetrics();
console.log('Performance:', metrics);
```

## 📈 CI/CD Integration

### GitHub Actions
The test suite includes comprehensive CI/CD workflows:

1. **Main Test Workflow** (`.github/workflows/playwright-tests.yml`)
   - Runs on PR and push to main branches
   - Tests across Node.js versions
   - Parallel execution for speed

2. **Performance Monitoring** (`.github/workflows/performance-monitoring.yml`)
   - Weekly automated benchmarks
   - Performance regression detection
   - Historical performance tracking

### Test Reports
- HTML reports with screenshots and videos
- JUnit XML for CI integration
- JSON results for custom processing
- Performance metrics tracking

## 🏆 Best Practices

### Writing Tests
1. **Use Page Objects**: Keep tests maintainable with page object pattern
2. **Data-Driven**: Use test data factory for consistent data
3. **Wait Strategies**: Use explicit waits, avoid arbitrary timeouts
4. **Assertions**: Use meaningful assertions with good error messages
5. **Cleanup**: Ensure proper test isolation and cleanup

### Performance Testing
1. **Baseline Measurements**: Establish performance baselines
2. **Real-World Data**: Use realistic dataset sizes
3. **Memory Monitoring**: Watch for memory leaks
4. **Regression Detection**: Fail fast on performance regressions

### Accessibility Testing
1. **Automated Scanning**: Use axe-core for automated checks
2. **Manual Testing**: Include keyboard navigation tests
3. **Screen Reader**: Test with screen reader announcements
4. **WCAG Compliance**: Target WCAG 2.1 AA standards

## 🐛 Troubleshooting

### Common Issues

1. **Test Timeouts**
   ```bash
   # Increase timeout in playwright.config.ts
   timeout: 60000 // 60 seconds
   ```

2. **Flaky Tests**
   ```typescript
   // Use proper wait conditions
   await page.waitForSelector('[data-testid="grid-loaded"]');
   await page.waitForLoadState('networkidle');
   ```

3. **Visual Regression Failures**
   ```bash
   # Update baselines
   npm run test:visual
   ```

4. **Performance Variance**
   - Run tests multiple times for averages
   - Use consistent testing environment
   - Monitor system resources during tests

### Debug Information
```bash
# Enable debug logging
DEBUG=pw:api npm run test:e2e

# Generate detailed trace
npx playwright test --trace on
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Metrics](https://web.dev/metrics/)

## 🤝 Contributing

When adding new tests:

1. Follow the existing test structure
2. Use appropriate test data from DataFactory
3. Include performance considerations
4. Add accessibility checks where relevant
5. Update this documentation for new test categories

---

**Happy Testing!** 🎭🧪