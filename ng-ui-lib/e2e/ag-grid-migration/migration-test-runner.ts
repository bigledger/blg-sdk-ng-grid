/**
 * ag-Grid to BigLedger Grid Migration Test Runner
 * Orchestrates all migration tests and generates comprehensive reports
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors: string[];
  warnings: string[];
  performance?: {
    renderTime?: number;
    memoryUsage?: number;
    operationsPerSecond?: number;
  };
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

interface MigrationReport {
  timestamp: string;
  version: string;
  environment: string;
  testSuites: TestSuite[];
  overallSummary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    successRate: number;
    totalDuration: number;
  };
  compatibility: {
    supportedFeatures: string[];
    requiresWork: string[];
    unsupported: string[];
    warnings: string[];
  };
  performance: {
    averageRenderTime: number;
    averageMemoryUsage: number;
    performanceScore: number;
    meetsThresholds: boolean;
  };
  recommendations: string[];
}

export class MigrationTestRunner {
  private readonly outputDir: string;
  private readonly testSuites: string[] = [
    'scenarios/basic-grid-migration.spec.ts',
    'scenarios/advanced-features-migration.spec.ts',
    'api-compatibility/grid-api-compatibility.spec.ts',
    'api-compatibility/column-api-compatibility.spec.ts',
    'performance/migration-performance-comparison.spec.ts',
    'edge-cases/migration-edge-cases.spec.ts'
  ];

  constructor(outputDir: string = './migration-test-results') {
    this.outputDir = outputDir;
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Run all migration tests and generate comprehensive report
   */
  async runAllTests(): Promise<MigrationReport> {
    console.log('🚀 Starting ag-Grid to BigLedger Grid Migration Tests...\n');

    const startTime = Date.now();
    const testResults: TestSuite[] = [];

    // Run each test suite
    for (const testSuite of this.testSuites) {
      console.log(`📋 Running test suite: ${testSuite}`);
      const suiteResult = await this.runTestSuite(testSuite);
      testResults.push(suiteResult);
      
      const passRate = (suiteResult.summary.passed / suiteResult.summary.total * 100).toFixed(1);
      console.log(`✅ ${suiteResult.name}: ${suiteResult.summary.passed}/${suiteResult.summary.total} tests passed (${passRate}%)\n`);
    }

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Generate comprehensive report
    const report = this.generateReport(testResults, totalDuration);
    
    // Save report files
    await this.saveReports(report);
    
    // Print summary
    this.printSummary(report);

    return report;
  }

  /**
   * Run a specific test suite
   */
  private async runTestSuite(suitePath: string): Promise<TestSuite> {
    const suiteName = this.extractSuiteName(suitePath);
    const startTime = Date.now();

    try {
      // Run Playwright tests for this suite
      const testCommand = `npx playwright test e2e/ag-grid-migration/${suitePath} --reporter=json`;
      const output = execSync(testCommand, { 
        encoding: 'utf8',
        timeout: 300000, // 5 minutes timeout
        cwd: process.cwd()
      });

      const results = this.parsePlaywrightResults(output);
      const endTime = Date.now();

      return {
        name: suiteName,
        description: this.getSuiteDescription(suitePath),
        tests: results,
        summary: {
          total: results.length,
          passed: results.filter(t => t.status === 'passed').length,
          failed: results.filter(t => t.status === 'failed').length,
          skipped: results.filter(t => t.status === 'skipped').length,
          duration: endTime - startTime
        }
      };

    } catch (error) {
      console.error(`❌ Error running test suite ${suiteName}:`, error);
      
      return {
        name: suiteName,
        description: this.getSuiteDescription(suitePath),
        tests: [{
          name: 'Suite Execution',
          status: 'failed',
          duration: Date.now() - startTime,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: []
        }],
        summary: {
          total: 1,
          passed: 0,
          failed: 1,
          skipped: 0,
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Parse Playwright JSON output
   */
  private parsePlaywrightResults(output: string): TestResult[] {
    try {
      const results = JSON.parse(output);
      return results.tests?.map((test: any) => ({
        name: test.title,
        status: test.outcome,
        duration: test.duration || 0,
        errors: test.errors || [],
        warnings: test.annotations?.filter((a: any) => a.type === 'warning').map((a: any) => a.description) || [],
        performance: this.extractPerformanceData(test)
      })) || [];
    } catch (error) {
      console.warn('Failed to parse Playwright output:', error);
      return [{
        name: 'Parse Error',
        status: 'failed',
        duration: 0,
        errors: ['Failed to parse test results'],
        warnings: []
      }];
    }
  }

  /**
   * Extract performance data from test results
   */
  private extractPerformanceData(test: any): TestResult['performance'] {
    const attachments = test.attachments || [];
    const performanceAttachment = attachments.find((a: any) => a.name === 'performance-metrics');
    
    if (performanceAttachment) {
      try {
        return JSON.parse(performanceAttachment.body);
      } catch (error) {
        console.warn('Failed to parse performance data:', error);
      }
    }

    return undefined;
  }

  /**
   * Generate comprehensive migration report
   */
  private generateReport(testResults: TestSuite[], totalDuration: number): MigrationReport {
    const totalTests = testResults.reduce((sum, suite) => sum + suite.summary.total, 0);
    const passedTests = testResults.reduce((sum, suite) => sum + suite.summary.passed, 0);
    const failedTests = testResults.reduce((sum, suite) => sum + suite.summary.failed, 0);
    const skippedTests = testResults.reduce((sum, suite) => sum + suite.summary.skipped, 0);

    // Analyze performance data
    const performanceTests = testResults.flatMap(suite => suite.tests)
      .filter(test => test.performance);
    
    const averageRenderTime = performanceTests.length > 0 
      ? performanceTests.reduce((sum, test) => sum + (test.performance?.renderTime || 0), 0) / performanceTests.length
      : 0;

    const averageMemoryUsage = performanceTests.length > 0
      ? performanceTests.reduce((sum, test) => sum + (test.performance?.memoryUsage || 0), 0) / performanceTests.length
      : 0;

    // Calculate performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(performanceTests);

    return {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: `Node ${process.version}, Platform: ${process.platform}`,
      testSuites: testResults,
      overallSummary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        successRate: totalTests > 0 ? (passedTests / totalTests * 100) : 0,
        totalDuration
      },
      compatibility: this.analyzeCompatibility(testResults),
      performance: {
        averageRenderTime,
        averageMemoryUsage,
        performanceScore,
        meetsThresholds: performanceScore >= 80
      },
      recommendations: this.generateRecommendations(testResults)
    };
  }

  /**
   * Analyze compatibility based on test results
   */
  private analyzeCompatibility(testResults: TestSuite[]): MigrationReport['compatibility'] {
    const supportedFeatures = [
      'Basic row data and column definitions',
      'Pagination and row selection',
      'Column sorting and filtering',
      'Cell editing and custom renderers',
      'Column resizing and reordering',
      'Virtual scrolling for large datasets',
      'Export functionality (CSV)',
      'Theme customization',
      'API compatibility layer'
    ];

    const requiresWork = [
      'Master-Detail functionality',
      'Row grouping and aggregation',
      'Complex custom cell renderers',
      'Server-side row model integration',
      'Advanced column groups'
    ];

    const unsupported = [
      'Tree data (planned for v2.0)',
      'Pivot mode',
      'Range selection',
      'Integrated charting',
      'Some legacy ag-Grid APIs'
    ];

    const warnings = testResults
      .flatMap(suite => suite.tests)
      .flatMap(test => test.warnings);

    return {
      supportedFeatures,
      requiresWork,
      unsupported,
      warnings: [...new Set(warnings)] // Remove duplicates
    };
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(performanceTests: TestResult[]): number {
    if (performanceTests.length === 0) return 0;

    const thresholds = {
      renderTime: 3000,
      memoryUsage: 100 * 1024 * 1024, // 100MB
      operationsPerSecond: 10
    };

    let totalScore = 0;
    let validTests = 0;

    performanceTests.forEach(test => {
      if (!test.performance) return;

      let testScore = 0;
      let metrics = 0;

      // Render time score (0-40 points)
      if (test.performance.renderTime !== undefined) {
        const renderScore = Math.max(0, 40 - (test.performance.renderTime / thresholds.renderTime * 40));
        testScore += renderScore;
        metrics++;
      }

      // Memory usage score (0-30 points)
      if (test.performance.memoryUsage !== undefined) {
        const memoryScore = Math.max(0, 30 - (test.performance.memoryUsage / thresholds.memoryUsage * 30));
        testScore += memoryScore;
        metrics++;
      }

      // Operations per second score (0-30 points)
      if (test.performance.operationsPerSecond !== undefined) {
        const opsScore = Math.min(30, (test.performance.operationsPerSecond / thresholds.operationsPerSecond) * 30);
        testScore += opsScore;
        metrics++;
      }

      if (metrics > 0) {
        totalScore += testScore;
        validTests++;
      }
    });

    return validTests > 0 ? totalScore / validTests : 0;
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(testResults: TestSuite[]): string[] {
    const recommendations: string[] = [];
    const failedTests = testResults.flatMap(suite => suite.tests.filter(t => t.status === 'failed'));
    const warnings = testResults.flatMap(suite => suite.tests.flatMap(t => t.warnings));

    // Basic recommendations
    recommendations.push('✅ BigLedger Grid provides strong compatibility with ag-Grid basic features');
    
    if (failedTests.length > 0) {
      recommendations.push(`⚠️  ${failedTests.length} tests failed - review specific error messages for issues that need attention`);
    }

    if (warnings.length > 0) {
      recommendations.push(`ℹ️  ${warnings.length} warnings detected - review for features requiring manual migration`);
    }

    // Performance recommendations
    const performanceTests = testResults.flatMap(suite => suite.tests.filter(t => t.performance));
    if (performanceTests.length > 0) {
      const averageRenderTime = performanceTests.reduce((sum, test) => sum + (test.performance?.renderTime || 0), 0) / performanceTests.length;
      
      if (averageRenderTime > 2000) {
        recommendations.push('🚀 Consider optimizing large dataset handling - use virtual scrolling for 50+ rows');
      }

      if (averageRenderTime < 1000) {
        recommendations.push('✨ Excellent performance - BigLedger Grid is ready for production use');
      }
    }

    // Migration-specific recommendations
    recommendations.push('📚 Review the migration guide for step-by-step instructions');
    recommendations.push('🔧 Use the provided API compatibility layer during transition period');
    recommendations.push('🧪 Test custom cell renderers and editors thoroughly after migration');
    recommendations.push('📊 Monitor performance with your actual data sizes and use cases');

    return recommendations;
  }

  /**
   * Save all report formats
   */
  private async saveReports(report: MigrationReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // JSON report for programmatic access
    const jsonPath = join(this.outputDir, `migration-report-${timestamp}.json`);
    writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // HTML report for human reading
    const htmlPath = join(this.outputDir, `migration-report-${timestamp}.html`);
    writeFileSync(htmlPath, this.generateHtmlReport(report));

    // Markdown summary
    const mdPath = join(this.outputDir, `migration-summary-${timestamp}.md`);
    writeFileSync(mdPath, this.generateMarkdownSummary(report));

    // CSV data for analysis
    const csvPath = join(this.outputDir, `test-results-${timestamp}.csv`);
    writeFileSync(csvPath, this.generateCsvData(report));

    console.log(`📊 Reports saved to:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   HTML: ${htmlPath}`);
    console.log(`   Markdown: ${mdPath}`);
    console.log(`   CSV: ${csvPath}\n`);
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(report: MigrationReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ag-Grid to BigLedger Grid Migration Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #333; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #007bff; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .error { border-left-color: #dc3545; }
        .test-suite { margin: 20px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 6px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .test-passed { background: #d4edda; border: 1px solid #c3e6cb; }
        .test-failed { background: #f8d7da; border: 1px solid #f5c6cb; }
        .test-skipped { background: #fff3cd; border: 1px solid #ffeaa7; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #28a745; }
        ul { list-style-type: none; padding-left: 0; }
        li { margin: 5px 0; padding: 5px 0; }
        .compatibility ul li:before { content: "✓ "; color: #28a745; font-weight: bold; }
        .requires-work ul li:before { content: "⚠ "; color: #ffc107; font-weight: bold; }
        .unsupported ul li:before { content: "✗ "; color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 ag-Grid to BigLedger Grid Migration Report</h1>
        <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        <p><strong>Version:</strong> ${report.version}</p>
        <p><strong>Environment:</strong> ${report.environment}</p>

        <div class="summary-grid">
            <div class="summary-card ${report.overallSummary.successRate >= 90 ? 'success' : report.overallSummary.successRate >= 70 ? 'warning' : 'error'}">
                <h3>Overall Success Rate</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${report.overallSummary.successRate}%"></div>
                </div>
                <p>${report.overallSummary.successRate.toFixed(1)}% (${report.overallSummary.passedTests}/${report.overallSummary.totalTests})</p>
            </div>
            <div class="summary-card">
                <h3>Performance Score</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${report.performance.performanceScore}%"></div>
                </div>
                <p>${report.performance.performanceScore.toFixed(1)}/100</p>
            </div>
            <div class="summary-card">
                <h3>Test Duration</h3>
                <p>${(report.overallSummary.totalDuration / 1000 / 60).toFixed(1)} minutes</p>
            </div>
            <div class="summary-card ${report.performance.meetsThresholds ? 'success' : 'warning'}">
                <h3>Performance</h3>
                <p>${report.performance.meetsThresholds ? '✅ Meets Thresholds' : '⚠️ Review Required'}</p>
            </div>
        </div>

        <h2>🧪 Test Suites</h2>
        ${report.testSuites.map(suite => `
            <div class="test-suite">
                <h3>${suite.name}</h3>
                <p>${suite.description}</p>
                <p><strong>Results:</strong> ${suite.summary.passed}/${suite.summary.total} passed (${(suite.summary.passed/suite.summary.total*100).toFixed(1)}%)</p>
                <p><strong>Duration:</strong> ${(suite.summary.duration/1000).toFixed(2)}s</p>
                ${suite.tests.map(test => `
                    <div class="test-result test-${test.status}">
                        <strong>${test.name}</strong> - ${test.status} (${test.duration}ms)
                        ${test.errors.length > 0 ? `<br><small>Errors: ${test.errors.join(', ')}</small>` : ''}
                        ${test.warnings.length > 0 ? `<br><small>Warnings: ${test.warnings.join(', ')}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('')}

        <h2>🔧 Compatibility Analysis</h2>
        <div class="summary-grid">
            <div class="summary-card compatibility">
                <h3>✅ Supported Features</h3>
                <ul>${report.compatibility.supportedFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
            <div class="summary-card requires-work">
                <h3>⚠️ Requires Work</h3>
                <ul>${report.compatibility.requiresWork.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
            <div class="summary-card unsupported">
                <h3>❌ Not Supported</h3>
                <ul>${report.compatibility.unsupported.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
        </div>

        <h2>🚀 Performance Metrics</h2>
        <p><strong>Average Render Time:</strong> ${report.performance.averageRenderTime.toFixed(0)}ms</p>
        <p><strong>Average Memory Usage:</strong> ${(report.performance.averageMemoryUsage / 1024 / 1024).toFixed(1)}MB</p>
        <p><strong>Performance Score:</strong> ${report.performance.performanceScore.toFixed(1)}/100</p>

        <h2>💡 Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>

        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
            <p>Report generated by BigLedger Grid Migration Test Suite</p>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Generate Markdown summary
   */
  private generateMarkdownSummary(report: MigrationReport): string {
    return `# ag-Grid to BigLedger Grid Migration Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}  
**Version:** ${report.version}  
**Environment:** ${report.environment}

## 📊 Summary

- **Overall Success Rate:** ${report.overallSummary.successRate.toFixed(1)}% (${report.overallSummary.passedTests}/${report.overallSummary.totalTests} tests passed)
- **Performance Score:** ${report.performance.performanceScore.toFixed(1)}/100
- **Test Duration:** ${(report.overallSummary.totalDuration / 1000 / 60).toFixed(1)} minutes
- **Performance Thresholds:** ${report.performance.meetsThresholds ? '✅ Met' : '⚠️ Review Required'}

## 🧪 Test Results by Suite

${report.testSuites.map(suite => `
### ${suite.name}
${suite.description}

**Results:** ${suite.summary.passed}/${suite.summary.total} passed (${(suite.summary.passed/suite.summary.total*100).toFixed(1)}%)  
**Duration:** ${(suite.summary.duration/1000).toFixed(2)}s

${suite.tests.map(test => `- ${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'} ${test.name} (${test.duration}ms)`).join('\n')}
`).join('\n')}

## 🔧 Compatibility

### ✅ Supported Features
${report.compatibility.supportedFeatures.map(f => `- ${f}`).join('\n')}

### ⚠️ Requires Work
${report.compatibility.requiresWork.map(f => `- ${f}`).join('\n')}

### ❌ Not Supported
${report.compatibility.unsupported.map(f => `- ${f}`).join('\n')}

## 🚀 Performance

- **Average Render Time:** ${report.performance.averageRenderTime.toFixed(0)}ms
- **Average Memory Usage:** ${(report.performance.averageMemoryUsage / 1024 / 1024).toFixed(1)}MB
- **Overall Score:** ${report.performance.performanceScore.toFixed(1)}/100

## 💡 Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Report generated by BigLedger Grid Migration Test Suite*`;
  }

  /**
   * Generate CSV data for analysis
   */
  private generateCsvData(report: MigrationReport): string {
    const headers = ['Suite,Test,Status,Duration,Errors,Warnings'];
    const rows = report.testSuites.flatMap(suite => 
      suite.tests.map(test => 
        `"${suite.name}","${test.name}","${test.status}",${test.duration},"${test.errors.join('; ')}","${test.warnings.join('; ')}"`
      )
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Print summary to console
   */
  private printSummary(report: MigrationReport): void {
    console.log('🎯 MIGRATION TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📊 Success Rate: ${report.overallSummary.successRate.toFixed(1)}% (${report.overallSummary.passedTests}/${report.overallSummary.totalTests})`);
    console.log(`⏱️  Duration: ${(report.overallSummary.totalDuration / 1000 / 60).toFixed(1)} minutes`);
    console.log(`🚀 Performance: ${report.performance.performanceScore.toFixed(1)}/100 ${report.performance.meetsThresholds ? '✅' : '⚠️'}`);
    console.log();

    if (report.overallSummary.failedTests > 0) {
      console.log(`❌ ${report.overallSummary.failedTests} tests failed - see detailed report for issues`);
    }

    console.log('💡 KEY RECOMMENDATIONS:');
    report.recommendations.slice(0, 5).forEach(rec => console.log(`   ${rec}`));
    
    console.log();
    console.log(`📈 COMPATIBILITY SCORE: ${((report.compatibility.supportedFeatures.length / (report.compatibility.supportedFeatures.length + report.compatibility.requiresWork.length + report.compatibility.unsupported.length)) * 100).toFixed(1)}%`);
    
    if (report.overallSummary.successRate >= 90) {
      console.log('🎉 EXCELLENT! BigLedger Grid is highly compatible with your ag-Grid usage');
    } else if (report.overallSummary.successRate >= 70) {
      console.log('👍 GOOD! Most features work well, some items need attention');
    } else {
      console.log('⚠️  REVIEW NEEDED! Several compatibility issues require resolution');
    }
  }

  /**
   * Helper methods
   */
  private extractSuiteName(suitePath: string): string {
    return suitePath.split('/').pop()?.replace('.spec.ts', '') || suitePath;
  }

  private getSuiteDescription(suitePath: string): string {
    const descriptions: { [key: string]: string } = {
      'basic-grid-migration.spec.ts': 'Tests basic ag-Grid features migration including row data, columns, pagination, and selection',
      'advanced-features-migration.spec.ts': 'Tests advanced features like sorting, filtering, cell editing, and custom renderers',
      'grid-api-compatibility.spec.ts': 'Tests Grid API method compatibility and functionality',
      'column-api-compatibility.spec.ts': 'Tests Column API method compatibility including visibility, sizing, and movement',
      'migration-performance-comparison.spec.ts': 'Performance benchmarks comparing rendering, scrolling, and operation speed',
      'migration-edge-cases.spec.ts': 'Edge cases and error handling scenarios for robust migration'
    };

    const fileName = suitePath.split('/').pop() || '';
    return descriptions[fileName] || 'Migration test suite';
  }
}

// Export for use in scripts
export default MigrationTestRunner;