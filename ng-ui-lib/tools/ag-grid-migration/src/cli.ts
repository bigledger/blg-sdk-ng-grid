#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { MigrationRunner } from './migration-runner';
import { MigrationOptions } from './types/migration.types';

const program = new Command();

program
  .name('ng-ui-migrate-ag-grid')
  .description('CLI tool to migrate ag-Grid implementations to BigLedger Grid (ng-ui)')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze project for ag-Grid usage and generate compatibility report')
  .option('-p, --path <path>', 'Project path to analyze', process.cwd())
  .option('-r, --report <path>', 'Output path for analysis report')
  .option('--json', 'Output report in JSON format')
  .action(async (options) => {
    try {
      const runner = new MigrationRunner();
      await runner.analyze({
        projectPath: options.path,
        reportPath: options.report,
        jsonOutput: options.json
      });
    } catch (error) {
      console.error(chalk.red('Analysis failed:'), error);
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Perform automatic migration from ag-Grid to BigLedger Grid')
  .option('-p, --path <path>', 'Project path to migrate', process.cwd())
  .option('--dry-run', 'Preview changes without applying them')
  .option('--backup', 'Create backup before migration', true)
  .option('--interactive', 'Run in interactive mode')
  .option('--force', 'Force migration without confirmation')
  .action(async (options) => {
    try {
      const migrationOptions: MigrationOptions = {
        projectPath: options.path,
        dryRun: options.dryRun,
        createBackup: options.backup,
        interactive: options.interactive,
        force: options.force
      };

      const runner = new MigrationRunner();
      await runner.migrate(migrationOptions);
    } catch (error) {
      console.error(chalk.red('Migration failed:'), error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate migrated code for compilation and compatibility')
  .option('-p, --path <path>', 'Project path to validate', process.cwd())
  .action(async (options) => {
    try {
      const runner = new MigrationRunner();
      await runner.validate(options.path);
    } catch (error) {
      console.error(chalk.red('Validation failed:'), error);
      process.exit(1);
    }
  });

program
  .command('rollback')
  .description('Rollback migration using backup')
  .option('-p, --path <path>', 'Project path to rollback', process.cwd())
  .option('-b, --backup <path>', 'Backup path to restore from')
  .action(async (options) => {
    try {
      const runner = new MigrationRunner();
      await runner.rollback(options.path, options.backup);
    } catch (error) {
      console.error(chalk.red('Rollback failed:'), error);
      process.exit(1);
    }
  });

program
  .command('wizard')
  .description('Run interactive migration wizard')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    try {
      const runner = new MigrationRunner();
      await runner.wizard(options.path);
    } catch (error) {
      console.error(chalk.red('Wizard failed:'), error);
      process.exit(1);
    }
  });

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.blue.bold('🔄 ng-ui ag-Grid Migration Tool\n'));
  program.outputHelp();
  process.exit(0);
}

program.parse();