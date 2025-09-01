# Testing Guide

**Audience: Library Developers and Contributors**

This guide covers testing strategies, requirements, and best practices for the BLG Grid library. Comprehensive testing is crucial for maintaining library stability and ensuring reliable releases.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Types](#test-types)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Visual Regression Testing](#visual-regression-testing)
- [Testing Requirements](#testing-requirements)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Utilities](#testing-utilities)
- [CI/CD Integration](#cicd-integration)

## Testing Philosophy

Our testing approach follows these principles:

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
2. **Behavior-Driven**: Test behavior, not implementation details
3. **Fast Feedback**: Quick test execution for rapid development cycles
4. **Confidence**: High coverage of critical user scenarios
5. **Maintainable**: Tests that are easy to understand and update

## Testing Stack

### Core Testing Technologies

```json
{
  "unitTesting": {
    "framework": "Jest",
    "testingUtility": "@angular/cdk/testing",
    "coverage": "Istanbul",
    "mocking": "Jest mocks"
  },
  "e2eTesting": {
    "framework": "Playwright",
    "browsers": ["Chromium", "Firefox", "WebKit"],
    "utilities": "@playwright/test"
  },
  "visualTesting": {
    "tool": "Playwright visual comparisons",
    "storage": "test-results/visual-diffs"
  },
  "performanceTesting": {
    "tool": "Playwright performance API",
    "metrics": ["rendering", "memory", "network"]
  }
}
```

### Test Environment Setup

All testing is configured through Nx workspace with standardized configurations:

- **Jest configuration**: `jest.config.ts`
- **Playwright configuration**: `playwright.config.ts`
- **Coverage reporting**: Integrated with CI/CD pipeline

## Test Types

### 1. Unit Tests (70% of test suite)
Test individual components, services, and utilities in isolation.

**What to test:**
- Component logic and state management
- Service methods and data transformations
- Utility functions and helper methods
- Error handling and edge cases

### 2. Integration Tests (20% of test suite)  
Test component interactions and service integration.

**What to test:**
- Component communication
- Service dependencies
- Data flow between layers
- Angular dependency injection

### 3. End-to-End Tests (10% of test suite)
Test complete user workflows and scenarios.

**What to test:**
- Critical user journeys
- Cross-browser compatibility
- Accessibility compliance
- Performance under load

## Unit Testing

### Jest Configuration

```typescript
// jest.config.ts
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  coverageReporters: ['html', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    'libs/**/*.ts',
    '!libs/**/*.spec.ts',
    '!libs/**/*.interface.ts',
    '!libs/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Component Testing Example

```typescript
// grid.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { BlgGridComponent } from './grid.component';
import { BlgGridHarness } from './testing/grid.harness';
import { createMockGridConfig } from '../test-utilities/mock-data';

describe('BlgGridComponent', () => {
  let component: BlgGridComponent;
  let fixture: ComponentFixture<BlgGridComponent>;
  let harness: BlgGridHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlgGridComponent],
      providers: [
        // Mock providers
        { provide: GridStateService, useClass: MockGridStateService },
        { provide: DataService, useClass: MockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BlgGridComponent);
    component = fixture.componentInstance;
    
    // Setup component harness
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture, 
      BlgGridHarness
    );
  });

  describe('Grid Initialization', () => {
    it('should create grid with default configuration', async () => {
      // Arrange
      const config = createMockGridConfig();
      component.config.set(config);
      
      // Act
      fixture.detectChanges();
      
      // Assert
      expect(component).toBeTruthy();
      expect(await harness.getColumnCount()).toBe(config.columns.length);
    });

    it('should handle empty data source', async () => {
      // Arrange
      const config = createMockGridConfig({ data: [] });
      component.config.set(config);
      
      // Act  
      fixture.detectChanges();
      
      // Assert
      expect(await harness.getRowCount()).toBe(0);
      expect(await harness.hasNoDataMessage()).toBe(true);
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort data when column header clicked', async () => {
      // Arrange
      const mockData = createMockData(10);
      const config = createMockGridConfig({ data: mockData });
      component.config.set(config);
      fixture.detectChanges();
      
      // Act
      await harness.clickColumnHeader('name');
      
      // Assert
      const firstRowData = await harness.getRowData(0);
      expect(firstRowData.name).toBe('Alice'); // Assuming sorted result
      
      // Verify sort indicator
      expect(await harness.getSortDirection('name')).toBe('asc');
    });

    it('should toggle sort direction on repeated clicks', async () => {
      // Arrange & setup
      const config = createMockGridConfig();
      component.config.set(config);
      fixture.detectChanges();
      
      // Act - First click
      await harness.clickColumnHeader('name');
      expect(await harness.getSortDirection('name')).toBe('asc');
      
      // Act - Second click
      await harness.clickColumnHeader('name');
      expect(await harness.getSortDirection('name')).toBe('desc');
      
      // Act - Third click
      await harness.clickColumnHeader('name');
      expect(await harness.getSortDirection('name')).toBe(null);
    });
  });
});
```

### Service Testing Example

```typescript
// grid-state.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { GridStateService } from './grid-state.service';
import { createMockColumnDefinitions, createMockGridConfig } from '../test-utilities';

describe('GridStateService', () => {
  let service: GridStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridStateService);
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      // Assert initial state
      expect(service.state.columns).toEqual([]);
      expect(service.state.selectedRows.size).toBe(0);
      expect(service.state.sortState).toBeNull();
    });

    it('should update columns and trigger reactivity', () => {
      // Arrange
      const columns = createMockColumnDefinitions();
      const stateChanges: any[] = [];
      
      // Subscribe to state changes
      service.columns$.subscribe(cols => stateChanges.push(cols));
      
      // Act
      service.updateColumns(columns);
      
      // Assert
      expect(service.state.columns).toEqual(columns);
      expect(stateChanges).toHaveLength(2); // Initial + update
    });
  });

  describe('Selection Management', () => {
    it('should toggle row selection correctly', () => {
      // Act
      service.toggleRowSelection(0);
      service.toggleRowSelection(1);
      
      // Assert
      expect(service.state.selectedRows.has(0)).toBe(true);
      expect(service.state.selectedRows.has(1)).toBe(true);
      expect(service.state.selectedRows.size).toBe(2);
      
      // Act - Toggle off
      service.toggleRowSelection(0);
      
      // Assert
      expect(service.state.selectedRows.has(0)).toBe(false);
      expect(service.state.selectedRows.size).toBe(1);
    });

    it('should handle single selection mode', () => {
      // Arrange
      const config = createMockGridConfig({ selectionMode: 'single' });
      service.updateConfig(config);
      
      // Act
      service.toggleRowSelection(0);
      service.toggleRowSelection(1);
      
      // Assert - Should only have second selection
      expect(service.state.selectedRows.has(0)).toBe(false);
      expect(service.state.selectedRows.has(1)).toBe(true);
      expect(service.state.selectedRows.size).toBe(1);
    });
  });
});
```

### Test Harnesses

We use Angular CDK Testing Harnesses for consistent component interaction:

```typescript
// grid.harness.ts
import { ComponentHarness } from '@angular/cdk/testing';

export class BlgGridHarness extends ComponentHarness {
  static hostSelector = 'ng-ui-lib';
  
  private getHeaderCells = this.locatorForAll('.ng-ui-lib-header-cell');
  private getRows = this.locatorForAll('.ng-ui-lib-row');
  
  async getColumnCount(): Promise<number> {
    const headers = await this.getHeaderCells();
    return headers.length;
  }
  
  async getRowCount(): Promise<number> {
    const rows = await this.getRows();
    return rows.length;
  }
  
  async clickColumnHeader(columnId: string): Promise<void> {
    const header = await this.locatorFor(`[data-column="${columnId}"]`)();
    await header.click();
  }
  
  async getSortDirection(columnId: string): Promise<'asc' | 'desc' | null> {
    const sortIndicator = await this.locatorForOptional(
      `[data-column="${columnId}"] .sort-indicator`
    )();
    
    if (!sortIndicator) return null;
    
    const classes = await sortIndicator.getAttribute('class');
    if (classes?.includes('sort-asc')) return 'asc';
    if (classes?.includes('sort-desc')) return 'desc';
    return null;
  }
  
  async getRowData(rowIndex: number): Promise<any> {
    const row = await this.locatorFor(`.ng-ui-lib-row:nth-child(${rowIndex + 1})`)();
    const cells = await row.locatorForAll('.ng-ui-lib-cell')();
    
    const data: any = {};
    for (let i = 0; i < cells.length; i++) {
      const cellText = await cells[i].text();
      data[`column${i}`] = cellText;
    }
    return data;
  }
}
```

## Integration Testing

Integration tests verify component interactions and service integration:

```typescript
// grid-integration.spec.ts
import { TestBed } from '@angular/core/testing';
import { BlgGridModule } from './grid.module';
import { BlgGridComponent } from './grid.component';
import { GridStateService } from './services/grid-state.service';
import { DataService } from './services/data.service';

describe('Grid Integration', () => {
  let gridComponent: BlgGridComponent;
  let gridState: GridStateService;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlgGridModule],
      providers: [
        // Real services for integration testing
        GridStateService,
        DataService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BlgGridComponent);
    gridComponent = fixture.componentInstance;
    gridState = TestBed.inject(GridStateService);
    dataService = TestBed.inject(DataService);
  });

  it('should coordinate sorting between grid and state service', fakeAsync(() => {
    // Arrange
    const testData = createLargeDataset(1000);
    const config = createMockGridConfig({ data: testData });
    gridComponent.config.set(config);
    
    // Act
    gridState.updateSort('name', 'asc', false);
    tick();
    
    // Assert
    const sortedData = dataService.getSortedData();
    expect(sortedData[0].name).toBeLessThan(sortedData[1].name);
    expect(gridState.state.sortState).toContainEqual({
      columnId: 'name',
      direction: 'asc',
      order: 0
    });
  }));
});
```

## End-to-End Testing

E2E tests use Playwright to test complete user workflows:

```typescript
// e2e/grid-e2e.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Grid E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page }) => {
    await page.goto('/grid-demo');
    await page.waitForLoadState('networkidle');
  });

  test('should load grid with data', async ({ page }) => {
    // Wait for grid to be visible
    await expect(page.locator('ng-ui-lib')).toBeVisible();
    
    // Check that data is loaded
    const rowCount = await page.locator('.ng-ui-lib-row').count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Verify column headers
    await expect(page.locator('.ng-ui-lib-header')).toBeVisible();
    const headerCount = await page.locator('.ng-ui-lib-header-cell').count();
    expect(headerCount).toBe(5); // Expected number of columns
  });

  test('should sort data when column clicked', async ({ page }) => {
    // Get first row data before sort
    const firstRowBefore = await page
      .locator('.ng-ui-lib-row')
      .first()
      .locator('.ng-ui-lib-cell')
      .first()
      .textContent();

    // Click column header to sort
    await page.click('[data-column="name"]');
    
    // Wait for sort to complete
    await page.waitForTimeout(100);
    
    // Get first row data after sort
    const firstRowAfter = await page
      .locator('.ng-ui-lib-row')
      .first()
      .locator('.ng-ui-lib-cell')
      .first()
      .textContent();

    // Verify data changed (assuming it wasn't already sorted)
    expect(firstRowBefore).not.toBe(firstRowAfter);
    
    // Verify sort indicator is visible
    await expect(page.locator('[data-column="name"] .sort-indicator')).toBeVisible();
  });

  test('should filter data correctly', async ({ page }) => {
    const initialRowCount = await page.locator('.ng-ui-lib-row').count();
    
    // Open filter for name column
    await page.click('[data-column="name"] .filter-trigger');
    
    // Enter filter text
    await page.fill('.filter-input', 'John');
    await page.press('.filter-input', 'Enter');
    
    // Wait for filter to apply
    await page.waitForTimeout(200);
    
    const filteredRowCount = await page.locator('.ng-ui-lib-row').count();
    
    // Should have fewer rows after filtering
    expect(filteredRowCount).toBeLessThan(initialRowCount);
    
    // All visible rows should contain filter text
    const visibleRows = await page.locator('.ng-ui-lib-row').all();
    for (const row of visibleRows) {
      const nameCell = await row.locator('[data-column="name"]').textContent();
      expect(nameCell).toContain('John');
    }
  });

  test('should handle virtual scrolling correctly', async ({ page }) => {
    // Navigate to large dataset demo
    await page.goto('/grid-demo/large-dataset');
    
    // Initial render should show limited rows (virtual scrolling)
    const initialRowCount = await page.locator('.ng-ui-lib-row').count();
    expect(initialRowCount).toBeLessThan(100); // Should be less than total data
    
    // Scroll to bottom
    await page.locator('.ng-ui-lib-viewport').scrollTo(0, 10000);
    
    // Wait for virtual scroll to render new items
    await page.waitForTimeout(200);
    
    // Should see different data at bottom
    const lastRowText = await page
      .locator('.ng-ui-lib-row')
      .last()
      .textContent();
    
    expect(lastRowText).toBeDefined();
    
    // Scroll back to top
    await page.locator('.ng-ui-lib-viewport').scrollTo(0, 0);
    await page.waitForTimeout(200);
    
    // Should show original top data
    const firstRowText = await page
      .locator('.ng-ui-lib-row')
      .first()
      .textContent();
    
    expect(firstRowText).toBeDefined();
  });
});
```

## Performance Testing

```typescript
// e2e/performance/grid-performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Grid Performance Tests', () => {
  test('should render large dataset within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/grid-demo/performance-test');
    
    const startTime = Date.now();
    
    // Wait for grid to fully load with 10,000 rows
    await page.waitForSelector('.ng-ui-lib-row');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // Should render within 2 seconds
    expect(renderTime).toBeLessThan(2000);
    
    // Check memory usage
    const client = await page.context().newCDPSession(page);
    const metrics = await client.send('Runtime.getHeapUsage');
    
    // Memory usage should be reasonable (less than 100MB)
    expect(metrics.usedSize).toBeLessThan(100 * 1024 * 1024);
  });

  test('should handle scrolling performance', async ({ page }) => {
    await page.goto('/grid-demo/virtual-scroll-test');
    
    // Measure scroll performance
    const scrollContainer = page.locator('.ng-ui-lib-viewport');
    
    const startTime = performance.now();
    
    // Simulate fast scrolling
    for (let i = 0; i < 10; i++) {
      await scrollContainer.scrollTo(0, i * 1000);
      await page.waitForTimeout(16); // 60fps = 16ms per frame
    }
    
    const endTime = performance.now();
    const scrollTime = endTime - startTime;
    
    // Should maintain 60fps during scrolling
    expect(scrollTime).toBeLessThan(200); // 10 scrolls * 16ms + buffer
  });
});
```

## Testing Requirements

### Coverage Requirements

- **Unit Tests**: 80% code coverage minimum
- **Integration Tests**: All major component interactions
- **E2E Tests**: All critical user workflows
- **Performance Tests**: Key performance scenarios

### Required Tests for New Features

1. **Unit tests** for all new functions and methods
2. **Component tests** for new UI components  
3. **Integration tests** for service interactions
4. **E2E tests** for user-facing functionality
5. **Performance tests** for performance-critical features

### Required Tests for Bug Fixes

1. **Regression test** that reproduces the bug
2. **Unit test** covering the fix
3. **Integration test** if multiple components affected

## Running Tests

### Development Commands

```bash
# Unit tests
npm run test                    # Run all unit tests
npm run test:watch              # Run in watch mode
npm run test -- --coverage     # Generate coverage report
npm run test -- --testNamePattern="Grid" # Run specific tests

# E2E tests
npm run test:e2e               # Run all E2E tests
npm run test:e2e:headed        # Run with browser UI
npm run test:e2e:debug         # Run in debug mode
npm run test:e2e:ui            # Interactive test runner

# Specific test suites
npm run test:performance       # Performance tests
npm run test:visual           # Visual regression tests
npm run test:accessibility    # Accessibility tests

# CI pipeline (what gets run in CI)
npm run ci:test               # Full test suite
```

### Debugging Tests

```bash
# Debug unit tests in VS Code
npm run test -- --runInBand --no-cache --watchAll=false

# Debug E2E tests
npm run test:e2e:debug --headed --slowMo=1000

# Generate test reports
npm run test -- --reporters=default --reporters=jest-html-reporter
npm run playwright:report     # View E2E test report
```

## Testing Utilities

### Mock Data Factories

```typescript
// test-utilities/mock-data.ts
export const createMockGridConfig = (overrides?: Partial<GridConfig>) => ({
  columns: createMockColumns(),
  data: createMockData(),
  features: {
    sorting: true,
    filtering: true,
    pagination: true,
    selection: true
  },
  ...overrides
});

export const createMockColumns = (): ColumnDefinition[] => [
  { id: 'id', field: 'id', header: 'ID', width: 80 },
  { id: 'name', field: 'name', header: 'Name', width: 200 },
  { id: 'email', field: 'email', header: 'Email', width: 250 },
  { id: 'role', field: 'role', header: 'Role', width: 150 }
];

export const createMockData = (count = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'User' : 'Guest'
  }));
};

export const createLargeDataset = (count = 10000) => {
  // Generate large dataset for performance testing
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    company: faker.company.name(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    joinDate: faker.date.past()
  }));
};
```

### Custom Test Matchers

```typescript
// test-utilities/custom-matchers.ts
expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${min}-${max}`,
      pass,
    };
  },

  toHaveGridStructure(received: Element) {
    const hasHeader = !!received.querySelector('.ng-ui-lib-header');
    const hasBody = !!received.querySelector('.ng-ui-lib-body');
    const hasRows = received.querySelectorAll('.ng-ui-lib-row').length > 0;
    
    const pass = hasHeader && hasBody && hasRows;
    return {
      message: () =>
        `expected element ${pass ? 'not ' : ''}to have proper grid structure`,
      pass,
    };
  }
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Reporting

- **Coverage reports**: Uploaded to Codecov
- **E2E test results**: HTML reports with screenshots
- **Performance metrics**: Tracked over time
- **Visual diffs**: Stored for regression detection

## Best Practices Summary

1. **Write tests first** for new features (TDD approach)
2. **Test behavior, not implementation** details
3. **Use descriptive test names** that explain the scenario
4. **Keep tests simple and focused** on one aspect
5. **Mock external dependencies** in unit tests
6. **Use real integrations** in integration tests
7. **Test error conditions** and edge cases
8. **Maintain test data factories** for consistency
9. **Run tests frequently** during development
10. **Keep tests fast** and reliable

Following this testing guide ensures high-quality, reliable code that provides confidence for both contributors and users of the BLG Grid library.