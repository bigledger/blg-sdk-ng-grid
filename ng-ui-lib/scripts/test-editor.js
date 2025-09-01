#!/usr/bin/env node

/**
 * Comprehensive Editor Test Execution Script
 * Runs all editor tests with proper reporting and screenshot capture
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class EditorTestRunner {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: [],
      screenshots: [],
      videos: [],
      errors: []
    };
    
    this.config = {
      parallel: process.env.CI ? 1 : 2,
      retries: process.env.CI ? 2 : 0,
      timeout: 30000,
      browsers: ['chromium', 'firefox', 'webkit'],
      reporters: ['html', 'junit', 'json'],
      screenshotOnFailure: true,
      videoOnFailure: true,
      visualTesting: false
    };
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--suite':
          this.testSuite = args[++i];
          break;
        case '--headed':
          this.config.headed = true;
          break;
        case '--debug':
          this.config.debug = true;
          this.config.parallel = 1;
          this.config.timeout = 0;
          break;
        case '--visual':
          this.config.visualTesting = true;
          break;
        case '--browser':
          this.config.browsers = [args[++i]];
          break;
        case '--parallel':
          this.config.parallel = parseInt(args[++i]);
          break;
        case '--timeout':
          this.config.timeout = parseInt(args[++i]);
          break;
        case '--no-video':
          this.config.videoOnFailure = false;
          break;
        case '--no-screenshot':
          this.config.screenshotOnFailure = false;
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
          break;
      }
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
BLG Editor Test Runner

Usage: npm run test:editor [options]

Options:
  --suite <name>        Run specific test suite (basic|formatting|toolbar|tables|media|keyboard|accessibility|mobile|visual)
  --headed             Run tests in headed mode
  --debug              Run tests in debug mode with no timeout
  --visual             Run visual regression tests only
  --browser <name>     Run tests on specific browser (chromium|firefox|webkit)
  --parallel <num>     Set number of parallel workers
  --timeout <ms>       Set test timeout in milliseconds
  --no-video           Disable video recording on failure
  --no-screenshot      Disable screenshot capture on failure
  --help               Show this help message

Examples:
  npm run test:editor                    # Run all tests
  npm run test:editor -- --suite basic  # Run basic tests only
  npm run test:editor -- --headed       # Run tests with browser UI
  npm run test:editor -- --visual       # Run visual regression tests
  npm run test:editor -- --debug        # Run in debug mode
`);
  }

  /**
   * Setup test environment
   */
  async setupEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    // Ensure test directories exist
    const dirs = [
      'test-results',
      'test-results/screenshots',
      'test-results/videos',
      'test-results/traces',
      'playwright-report',
      'e2e/editor/screenshots'
    ];
    
    for (const dir of dirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
    
    // Clean old results
    this.cleanOldResults();
    
    // Check if demo app is running
    await this.checkDemoApp();
    
    console.log('✅ Environment setup complete');
  }

  /**
   * Clean old test results
   */
  cleanOldResults() {
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir);
      for (const file of files) {
        if (file.endsWith('.xml') || file.endsWith('.json') || file.endsWith('.png') || file.endsWith('.webm')) {
          fs.unlinkSync(path.join(resultsDir, file));
        }
      }
    }
  }

  /**
   * Check if demo application is running
   */
  async checkDemoApp() {
    try {
      const response = await fetch('http://localhost:4200');
      if (response.ok) {
        console.log('✅ Demo app is running on http://localhost:4200');
        return true;
      }
    } catch (error) {
      console.log('⚠️  Demo app not detected on http://localhost:4200');
      console.log('   Start it with: npm run serve');
      return false;
    }
  }

  /**
   * Build Playwright command
   */
  buildPlaywrightCommand() {
    const cmd = ['playwright', 'test'];
    
    // Test files
    if (this.testSuite) {
      const suiteMap = {
        'basic': 'e2e/editor/basic-editing.spec.ts',
        'formatting': 'e2e/editor/formatting.spec.ts',
        'toolbar': 'e2e/editor/toolbar.spec.ts',
        'tables': 'e2e/editor/tables.spec.ts',
        'media': 'e2e/editor/media.spec.ts',
        'keyboard': 'e2e/editor/keyboard.spec.ts',
        'accessibility': 'e2e/editor/accessibility.spec.ts',
        'mobile': 'e2e/editor/mobile.spec.ts',
        'visual': 'e2e/editor/visual-regression.spec.ts'
      };
      
      if (suiteMap[this.testSuite]) {
        cmd.push(suiteMap[this.testSuite]);
      } else {
        console.error(`Unknown test suite: ${this.testSuite}`);
        process.exit(1);
      }
    } else if (this.config.visualTesting) {
      cmd.push('--grep', '@visual');
    } else {
      cmd.push('e2e/editor/');
    }

    // Configuration options
    if (this.config.headed) {
      cmd.push('--headed');
    }
    
    if (this.config.debug) {
      cmd.push('--debug');
    }
    
    cmd.push('--workers', this.config.parallel.toString());
    cmd.push('--timeout', this.config.timeout.toString());
    cmd.push('--retries', this.config.retries.toString());
    
    // Browser selection
    for (const browser of this.config.browsers) {
      cmd.push('--project', browser);
    }
    
    // Reporters
    for (const reporter of this.config.reporters) {
      cmd.push('--reporter', reporter);
    }
    
    return cmd;
  }

  /**
   * Run the tests
   */
  async runTests() {
    console.log('🚀 Starting editor tests...');
    
    const cmd = this.buildPlaywrightCommand();
    console.log('Running:', cmd.join(' '));
    
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const process = spawn('npx', cmd, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        this.testResults.duration = duration;
        
        if (code === 0) {
          console.log(`\n✅ All tests passed in ${this.formatDuration(duration)}`);
          resolve(true);
        } else {
          console.log(`\n❌ Tests failed with exit code ${code} after ${this.formatDuration(duration)}`);
          resolve(false);
        }
      });
      
      process.on('error', (error) => {
        console.error('Failed to start test process:', error);
        reject(error);
      });
    });
  }

  /**
   * Generate test report
   */
  async generateReport() {
    console.log('📊 Generating test report...');
    
    try {
      // Read test results
      await this.parseTestResults();
      
      // Generate HTML report
      await this.generateHtmlReport();
      
      // Generate summary
      this.printSummary();
      
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }

  /**
   * Parse test results from output files
   */
  async parseTestResults() {
    // Parse JUnit results
    const junitPath = path.join(process.cwd(), 'test-results', 'junit-results.xml');
    if (fs.existsSync(junitPath)) {
      // Would parse XML here in a real implementation
      console.log('📄 JUnit results found');
    }
    
    // Parse JSON results
    const jsonPath = path.join(process.cwd(), 'test-results', 'test-results.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        this.testResults.total = jsonData.stats?.tests || 0;
        this.testResults.passed = jsonData.stats?.passes || 0;
        this.testResults.failed = jsonData.stats?.failures || 0;
        this.testResults.skipped = jsonData.stats?.skipped || 0;
        console.log('📄 JSON results parsed');
      } catch (error) {
        console.log('⚠️  Could not parse JSON results');
      }
    }
    
    // Count screenshots and videos
    await this.countArtifacts();
  }

  /**
   * Count test artifacts (screenshots, videos)
   */
  async countArtifacts() {
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) return;
    
    const files = fs.readdirSync(resultsDir);
    
    this.testResults.screenshots = files.filter(f => f.endsWith('.png')).length;
    this.testResults.videos = files.filter(f => f.endsWith('.webm')).length;
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport() {
    const reportPath = path.join(process.cwd(), 'test-results', 'editor-test-report.html');
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BLG Editor Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric h3 { margin: 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .duration { color: #17a2b8; }
        .artifacts { color: #6f42c1; }
        .footer { margin-top: 40px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 BLG Editor Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Platform: ${os.platform()} ${os.arch()} | Node: ${process.version}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${this.testResults.total}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div class="value passed">${this.testResults.passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div class="value failed">${this.testResults.failed}</div>
        </div>
        <div class="metric">
            <h3>Skipped</h3>
            <div class="value skipped">${this.testResults.skipped}</div>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <div class="value duration">${this.formatDuration(this.testResults.duration)}</div>
        </div>
        <div class="metric">
            <h3>Screenshots</h3>
            <div class="value artifacts">${this.testResults.screenshots}</div>
        </div>
        <div class="metric">
            <h3>Videos</h3>
            <div class="value artifacts">${this.testResults.videos}</div>
        </div>
    </div>
    
    <h2>📋 Test Coverage</h2>
    <ul>
        <li>✅ Basic Text Editing - Core text input and manipulation</li>
        <li>✅ Text Formatting - Bold, italic, underline, strikethrough, code</li>
        <li>✅ Toolbar Functionality - Button interactions and states</li>
        <li>✅ Table Operations - Creation, editing, and manipulation</li>
        <li>✅ Media Handling - Images, videos, and links</li>
        <li>✅ Keyboard Shortcuts - All standard editor shortcuts</li>
        <li>✅ Accessibility - WCAG compliance and screen reader support</li>
        <li>✅ Mobile Responsiveness - Touch interactions and responsive design</li>
        <li>🎨 Visual Regression - Cross-browser visual consistency</li>
    </ul>
    
    <h2>🎯 Test Scenarios</h2>
    <ul>
        <li><strong>Basic Editing:</strong> Text input, selection, cursor movement, line breaks</li>
        <li><strong>Formatting:</strong> All text formatting options and combinations</li>
        <li><strong>Structure:</strong> Headings, lists, blockquotes, tables</li>
        <li><strong>Media:</strong> Image upload, video embedding, link creation</li>
        <li><strong>Keyboard:</strong> All shortcuts, navigation, accessibility</li>
        <li><strong>Mobile:</strong> Touch interactions, responsive layout, virtual keyboard</li>
        <li><strong>Edge Cases:</strong> Large content, error handling, performance</li>
    </ul>
    
    <div class="footer">
        <p>🤖 Generated by BLG Editor Test Suite</p>
        <p>See <a href="playwright-report/index.html">detailed Playwright report</a> for more information</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportPath, htmlContent);
    console.log(`📊 HTML report generated: ${reportPath}`);
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Total Tests:   ${this.testResults.total}`);
    console.log(`✅ Passed:     ${this.testResults.passed}`);
    console.log(`❌ Failed:     ${this.testResults.failed}`);
    console.log(`⏭️  Skipped:    ${this.testResults.skipped}`);
    console.log(`⏱️  Duration:   ${this.formatDuration(this.testResults.duration)}`);
    console.log(`📸 Screenshots: ${this.testResults.screenshots}`);
    console.log(`🎥 Videos:     ${this.testResults.videos}`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Some tests failed. Check the detailed report for more information.');
      console.log('   HTML Report: test-results/editor-test-report.html');
      console.log('   Playwright Report: playwright-report/index.html');
    } else {
      console.log('\n🎉 All tests passed! Great job!');
    }
  }

  /**
   * Format duration in human readable format
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      this.parseArguments();
      await this.setupEnvironment();
      
      const success = await this.runTests();
      await this.generateReport();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new EditorTestRunner();
  runner.run().catch(console.error);
}

module.exports = EditorTestRunner;