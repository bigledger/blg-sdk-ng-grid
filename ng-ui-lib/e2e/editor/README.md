# BLG Editor E2E Testing Infrastructure

This directory contains comprehensive end-to-end testing infrastructure for the BLG Editor using Playwright. The test suite covers all aspects of editor functionality, accessibility, and visual consistency.

## 🧪 Test Coverage

### Core Test Suites

1. **Basic Editing** (`basic-editing.spec.ts`)
   - Text input and manipulation
   - Cursor positioning and movement
   - Text selection (keyboard and mouse)
   - Copy, cut, paste operations
   - Undo/redo functionality

2. **Text Formatting** (`formatting.spec.ts`)
   - Bold, italic, underline, strikethrough
   - Code formatting and inline styles
   - Heading levels (H1, H2, H3)
   - Blockquotes and text styling
   - Format combinations and toggles

3. **Toolbar Functionality** (`toolbar.spec.ts`)
   - Button interactions and states
   - Active/inactive button indicators
   - Keyboard navigation of toolbar
   - Dropdown and modal triggering
   - Responsive toolbar behavior

4. **Table Operations** (`tables.spec.ts`)
   - Table creation with various dimensions
   - Cell navigation (Tab, Shift+Tab, arrows)
   - Content editing within cells
   - Row/column manipulation
   - Table formatting and styling

5. **Media Handling** (`media.spec.ts`)
   - Image upload and insertion
   - Video embedding (YouTube, Vimeo, direct)
   - Link creation and validation
   - File type validation
   - Alt text and accessibility attributes

6. **Keyboard Shortcuts** (`keyboard.spec.ts`)
   - All standard editor shortcuts (Ctrl+B, Ctrl+I, etc.)
   - Navigation shortcuts (Ctrl+Home, Ctrl+End)
   - Selection shortcuts (Shift+Arrow, Ctrl+A)
   - Platform-specific modifier keys
   - Accessibility keyboard support

7. **Accessibility** (`accessibility.spec.ts`)
   - WCAG 2.1 AA compliance testing
   - Screen reader compatibility
   - Keyboard navigation completeness
   - ARIA labels and roles
   - Focus management and indicators

8. **Mobile Responsiveness** (`mobile.spec.ts`)
   - Touch interactions (tap, long press, swipe)
   - Virtual keyboard handling
   - Responsive layout adaptation
   - Cross-device consistency
   - Mobile-specific features

9. **Visual Regression** (`visual-regression.spec.ts`)
   - Screenshot comparisons across browsers
   - Theme consistency testing
   - Responsive design verification
   - UI state consistency
   - Cross-browser visual parity

## 🛠️ Test Infrastructure

### Utilities (`utils/`)

- **`editor-helpers.ts`** - Core helper functions for editor operations
- **`test-data-generator.ts`** - Generates test data for various scenarios
- **`custom-assertions.ts`** - Custom Playwright assertions for editor testing
- **`visual-testing.ts`** - Visual regression testing utilities

### Page Objects (`page-objects/`)

- **`editor-page.ts`** - Page Object Model for editor interactions

## 🚀 Running Tests

### Quick Start

```bash
# Run all editor tests
npm run test:editor

# Run specific test suite
npm run test:editor:basic
npm run test:editor:formatting
npm run test:editor:accessibility

# Run with browser UI visible
npm run test:editor:headed

# Run in debug mode
npm run test:editor:debug
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run test:editor` | Run all editor tests |
| `npm run test:editor:basic` | Basic editing functionality |
| `npm run test:editor:formatting` | Text formatting tests |
| `npm run test:editor:toolbar` | Toolbar interaction tests |
| `npm run test:editor:tables` | Table functionality tests |
| `npm run test:editor:media` | Media handling tests |
| `npm run test:editor:keyboard` | Keyboard shortcut tests |
| `npm run test:editor:accessibility` | Accessibility compliance tests |
| `npm run test:editor:mobile` | Mobile responsiveness tests |
| `npm run test:editor:visual` | Visual regression tests |
| `npm run test:editor:headed` | Run with browser UI visible |
| `npm run test:editor:debug` | Run in debug mode |

### Advanced Options

```bash
# Run on specific browser
node scripts/test-editor.js --browser firefox

# Run with custom parallel workers
node scripts/test-editor.js --parallel 4

# Run visual tests only
node scripts/test-editor.js --visual

# Disable video recording
node scripts/test-editor.js --no-video

# Run with custom timeout
node scripts/test-editor.js --timeout 60000
```

## 📊 Test Reporting

### Generated Reports

1. **HTML Report** - Interactive Playwright report with test details
2. **JUnit XML** - For CI/CD integration
3. **JSON Results** - Machine-readable test results
4. **Visual Diff Report** - Screenshot comparison results
5. **Custom Editor Report** - Comprehensive editor-specific summary

### Report Locations

```
test-results/
├── playwright-report/          # Interactive HTML report
├── editor-test-report.html     # Custom editor summary
├── junit-results.xml           # JUnit XML format
├── test-results.json          # JSON results
├── screenshots/               # Failure screenshots
└── videos/                   # Failure videos
```

### CI/CD Integration

```yaml
# Example GitHub Actions integration
- name: Run Editor Tests
  run: npm run ci:test:editor

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: editor-test-results
    path: |
      test-results/
      playwright-report/
```

## 🔧 Configuration

### Playwright Configuration

Key settings in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  
  use: {
    baseURL: 'http://localhost:4200',
    permissions: ['clipboard-read', 'clipboard-write'],
    reducedMotion: 'reduce',
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ]
});
```

### Test Environment Setup

1. **Demo Application**: Tests expect the editor demo to be running on `http://localhost:4200`
2. **Test Data**: Mock data and assets are generated automatically
3. **Browser State**: Each test starts with a clean browser state
4. **Accessibility Tools**: @axe-core/playwright is integrated for a11y testing

## 📝 Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';

test.describe('Feature Name', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
  });

  test('should perform expected behavior', async () => {
    await editorPage.typeText('Test content');
    await editorPage.selectAll();
    await editorPage.applyBold();
    
    const content = await editorPage.getHtmlContent();
    expect(content).toContain('<strong>Test content</strong>');
  });
});
```

### Using Test Utilities

```typescript
import { EditorHelpers } from './utils/editor-helpers';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

// Generate test data
const testText = EditorTestData.generateText({ words: 10 });

// Use custom assertions
await EditorAssertions.toHaveFormatting(
  editorPage.editorContent, 
  'bold', 
  'expected text'
);

// Visual testing
await visualUtils.screenshotEditor('test-state');
```

### Best Practices

1. **Use Page Objects** - Interact with editor through the EditorPage class
2. **Wait for Stability** - Ensure elements are visible before interaction
3. **Test Data Generation** - Use EditorTestData for consistent test data
4. **Custom Assertions** - Use EditorAssertions for editor-specific validations
5. **Error Handling** - Test both success and failure scenarios
6. **Cross-Browser** - Ensure tests work across all supported browsers
7. **Accessibility** - Include accessibility checks in feature tests

## 🐛 Debugging Tests

### Debug Mode

```bash
npm run test:editor:debug
```

This opens Playwright Inspector where you can:
- Step through tests line by line
- Inspect element selectors
- View browser state at any point
- Modify and re-run test steps

### Common Issues

1. **Timing Issues**: Use proper waits instead of fixed timeouts
2. **Element Not Found**: Verify selectors and wait for visibility
3. **Flaky Tests**: Check for race conditions and external dependencies
4. **Cross-Browser Differences**: Test on all browsers during development

### Useful Debug Commands

```typescript
// Pause test execution
await page.pause();

// Take debug screenshot
await page.screenshot({ path: 'debug.png' });

// Log element state
console.log(await element.getAttribute('data-state'));

// Inspect computed styles
const styles = await element.evaluate(el => getComputedStyle(el));
```

## 📈 Performance Testing

### Performance Assertions

```typescript
// Test large content handling
await EditorAssertions.toHandleLargeContent(
  page, 
  editorPage.editorContent, 
  largeContent
);

// Measure operation timing
const startTime = Date.now();
await someOperation();
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(1000);
```

### Memory Testing

Tests include memory leak detection and performance benchmarks for:
- Large document handling
- Rapid text input
- Complex formatting operations
- Table operations with many cells

## 🎨 Visual Testing

### Screenshot Guidelines

1. **Disable Animations** - Use `animations: 'disabled'` for consistent screenshots
2. **Mask Dynamic Content** - Hide timestamps, random IDs, etc.
3. **Threshold Settings** - Use appropriate comparison thresholds
4. **Cross-Platform** - Consider font rendering differences

### Visual Test Categories

- **Baseline Screenshots** - Empty states and basic content
- **Formatted Content** - All formatting options and combinations
- **Interactive States** - Hover, focus, selection states
- **Responsive Views** - Mobile, tablet, desktop layouts
- **Theme Variations** - Light, dark, high contrast themes
- **Error States** - Validation errors and failure states

## 🤝 Contributing

### Adding New Test Suites

1. Create new spec file in appropriate directory
2. Follow existing naming conventions
3. Include comprehensive test coverage
4. Add visual regression tests for UI changes
5. Update this README with new test descriptions
6. Add new npm scripts if needed

### Test Review Checklist

- [ ] Tests cover happy path and edge cases
- [ ] Accessibility considerations included
- [ ] Cross-browser compatibility verified
- [ ] Visual regression tests added for UI changes
- [ ] Performance implications considered
- [ ] Error scenarios tested
- [ ] Documentation updated

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [BLG Editor Component Documentation](../../docs/components/editor.md)
- [Testing Best Practices](../../docs/testing/best-practices.md)

---

## 📊 Test Statistics

Current test coverage includes:

- **500+ test cases** across 9 comprehensive test suites
- **Cross-browser testing** on Chromium, Firefox, and WebKit
- **Mobile device testing** on iOS and Android viewports
- **Accessibility testing** with automated a11y audits
- **Visual regression testing** with 200+ screenshot comparisons
- **Performance testing** with benchmarks for large content handling

This infrastructure ensures the BLG Editor maintains high quality, accessibility, and cross-platform compatibility.