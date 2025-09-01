#!/usr/bin/env node

/**
 * Main entry point for running ag-Grid to BigLedger Grid migration tests
 */

import MigrationTestRunner from './migration-test-runner.js';
import { program } from 'commander';

async function main() {
  program
    .name('migration-tests')
    .description('Run ag-Grid to BigLedger Grid migration test suite')
    .version('1.0.0')
    .option('-o, --output <directory>', 'Output directory for reports', './migration-test-results')
    .option('--suite <suite>', 'Run specific test suite only')
    .option('--performance-only', 'Run only performance tests')
    .option('--compatibility-only', 'Run only compatibility tests')
    .option('--json', 'Output results in JSON format only')
    .option('--quiet', 'Suppress console output')
    .parse();

  const options = program.opts();

  console.log('🚀 Starting ag-Grid to BigLedger Grid Migration Tests\n');
  
  if (options.quiet) {
    // Suppress console output for CI/CD environments
    console.log = () => {};
    console.warn = () => {};
  }

  try {
    const runner = new MigrationTestRunner(options.output);
    const report = await runner.runAllTests();

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    }

    // Exit with non-zero code if tests failed
    const successRate = report.overallSummary.successRate;
    const performanceMet = report.performance.meetsThresholds;

    if (successRate < 90 || !performanceMet) {
      console.error('❌ Migration tests indicate issues that need attention');
      process.exit(1);
    }

    console.log('✅ Migration tests completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('💥 Migration test execution failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main().catch(error => {
  console.error('Main execution failed:', error);
  process.exit(1);
});