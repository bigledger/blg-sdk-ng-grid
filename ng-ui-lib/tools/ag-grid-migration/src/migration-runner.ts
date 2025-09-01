import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { AgGridScanner } from './scanner/ag-grid-scanner';
import { ImportTransformer } from './transformers/import-transformer';
import { ComponentTransformer } from './transformers/component-transformer';
import { ConfigTransformer } from './transformers/config-transformer';
import { CssTransformer } from './transformers/css-transformer';
import { MigrationReportGenerator } from './report/migration-report-generator';
import { MigrationValidator } from './validation/migration-validator';
import {
  MigrationOptions,
  AnalysisOptions,
  MigrationResult,
  AgGridUsage,
  Transformation
} from './types/migration.types';

export class MigrationRunner {
  private scanner: AgGridScanner;
  private importTransformer: ImportTransformer;
  private componentTransformer: ComponentTransformer;
  private configTransformer: ConfigTransformer;
  private cssTransformer: CssTransformer;
  private reportGenerator: MigrationReportGenerator;
  private validator: MigrationValidator;

  constructor() {
    this.scanner = new AgGridScanner();
    this.importTransformer = new ImportTransformer();
    this.componentTransformer = new ComponentTransformer();
    this.configTransformer = new ConfigTransformer();
    this.cssTransformer = new CssTransformer();
    this.reportGenerator = new MigrationReportGenerator();
    this.validator = new MigrationValidator();
  }

  async analyze(options: AnalysisOptions): Promise<void> {
    const spinner = ora('Scanning project for ag-Grid usage...').start();
    
    try {
      // Verify project path exists
      if (!await fs.pathExists(options.projectPath)) {
        throw new Error(`Project path does not exist: ${options.projectPath}`);
      }

      // Scan for ag-Grid usage
      const usageResults = await this.scanner.scanProject(options.projectPath);
      
      if (usageResults.length === 0) {
        spinner.succeed('No ag-Grid usage detected in project');
        console.log(chalk.yellow('No migration needed - project does not use ag-Grid'));
        return;
      }

      spinner.succeed(`Found ag-Grid usage in ${usageResults.length} files`);

      // Generate compatibility report
      const reportSpinner = ora('Generating compatibility report...').start();
      
      const reportPath = options.reportPath || 
        path.join(options.projectPath, 'ag-grid-migration-report.html');
      
      await this.reportGenerator.generateReport(
        usageResults, 
        reportPath, 
        options.jsonOutput
      );
      
      reportSpinner.succeed(`Report generated: ${reportPath}`);

    } catch (error) {
      spinner.fail('Analysis failed');
      throw error;
    }
  }

  async migrate(options: MigrationOptions): Promise<MigrationResult> {
    console.log(chalk.blue.bold('\n🔄 Starting ag-Grid to ng-ui Migration\n'));

    // Pre-migration validation
    await this.validateProject(options.projectPath);

    // Scan for usage
    const spinner = ora('Scanning project for ag-Grid usage...').start();
    const usageResults = await this.scanner.scanProject(options.projectPath);
    spinner.succeed(`Found ag-Grid usage in ${usageResults.length} files`);

    if (usageResults.length === 0) {
      console.log(chalk.yellow('No ag-Grid usage found - nothing to migrate'));
      return {
        success: true,
        filesProcessed: 0,
        filesModified: 0,
        errors: [],
        warnings: [],
        transformations: []
      };
    }

    // Interactive mode confirmation
    if (options.interactive && !options.force) {
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: `Found ag-Grid usage in ${usageResults.length} files. Continue with migration?`,
        default: true
      }]);

      if (!proceed) {
        console.log(chalk.yellow('Migration cancelled by user'));
        return {
          success: false,
          filesProcessed: 0,
          filesModified: 0,
          errors: [],
          warnings: [],
          transformations: []
        };
      }
    }

    // Create backup
    let backupPath: string | undefined;
    if (options.createBackup) {
      backupPath = await this.createBackup(options.projectPath);
      console.log(chalk.green(`✓ Backup created: ${backupPath}`));
    }

    // Generate transformations
    const transformSpinner = ora('Generating transformations...').start();
    const allTransformations = await this.generateTransformations(usageResults);
    transformSpinner.succeed(`Generated ${allTransformations.length} transformations`);

    // Apply transformations (or dry run)
    const applySpinner = ora(
      options.dryRun ? 'Previewing changes...' : 'Applying transformations...'
    ).start();

    const result = await this.applyTransformations(
      allTransformations, 
      options.dryRun || false
    );

    applySpinner.succeed(
      options.dryRun 
        ? 'Dry run completed - no changes made' 
        : `Migration completed - ${result.filesModified} files modified`
    );

    // Update package.json dependencies
    if (!options.dryRun) {
      await this.updatePackageJson(options.projectPath);
    }

    return {
      ...result,
      backupPath
    };
  }

  async validate(projectPath: string): Promise<void> {
    const spinner = ora('Validating migrated code...').start();
    
    try {
      const isValid = await this.validator.validateProject(projectPath);
      
      if (isValid) {
        spinner.succeed('Validation passed - migrated code is valid');
      } else {
        spinner.fail('Validation failed - manual fixes required');
        console.log(chalk.yellow('Check compilation errors and fix any issues'));
      }
    } catch (error) {
      spinner.fail('Validation failed');
      throw error;
    }
  }

  async rollback(projectPath: string, backupPath?: string): Promise<void> {
    const spinner = ora('Rolling back migration...').start();
    
    try {
      if (!backupPath) {
        // Find the most recent backup
        const backupsDir = path.join(projectPath, '.migration-backups');
        if (await fs.pathExists(backupsDir)) {
          const backups = await fs.readdir(backupsDir);
          if (backups.length > 0) {
            backups.sort().reverse();
            backupPath = path.join(backupsDir, backups[0]);
          }
        }
      }

      if (!backupPath || !await fs.pathExists(backupPath)) {
        throw new Error('No backup found to restore from');
      }

      // Restore from backup
      await fs.copy(backupPath, projectPath, { overwrite: true });
      
      spinner.succeed('Rollback completed successfully');
      console.log(chalk.green(`Restored from backup: ${backupPath}`));
      
    } catch (error) {
      spinner.fail('Rollback failed');
      throw error;
    }
  }

  async wizard(projectPath: string): Promise<void> {
    console.log(chalk.blue.bold('\n🧙 ag-Grid Migration Wizard\n'));

    // Step 1: Analyze project
    const analyzeSpinner = ora('Analyzing project...').start();
    const usageResults = await this.scanner.scanProject(projectPath);
    analyzeSpinner.succeed(`Found ag-Grid usage in ${usageResults.length} files`);

    if (usageResults.length === 0) {
      console.log(chalk.yellow('No ag-Grid usage found in project'));
      return;
    }

    // Step 2: Show compatibility report
    await this.reportGenerator.generateReport(usageResults);

    // Step 3: Migration options
    const migrationAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'createBackup',
        message: 'Create backup before migration?',
        default: true
      },
      {
        type: 'confirm',
        name: 'dryRun',
        message: 'Preview changes without applying them (dry run)?',
        default: false
      },
      {
        type: 'list',
        name: 'scope',
        message: 'Select migration scope:',
        choices: [
          { name: 'Full migration (all files)', value: 'full' },
          { name: 'Selective migration (choose files)', value: 'selective' },
          { name: 'Configuration only', value: 'config' },
          { name: 'Templates only', value: 'templates' }
        ],
        default: 'full'
      }
    ]);

    // Step 4: File selection (if selective)
    let selectedFiles = usageResults;
    if (migrationAnswers.scope === 'selective') {
      const fileChoices = usageResults.map(usage => ({
        name: `${path.relative(projectPath, usage.filePath)} (${
          usage.imports.length + usage.components.length
        } items)`,
        value: usage.filePath,
        checked: true
      }));

      const fileAnswers = await inquirer.prompt([{
        type: 'checkbox',
        name: 'files',
        message: 'Select files to migrate:',
        choices: fileChoices
      }]);

      selectedFiles = usageResults.filter(usage => 
        fileAnswers.files.includes(usage.filePath)
      );
    }

    // Step 5: Execute migration
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: `Ready to migrate ${selectedFiles.length} files. Proceed?`,
      default: true
    }]);

    if (proceed) {
      await this.migrate({
        projectPath,
        createBackup: migrationAnswers.createBackup,
        dryRun: migrationAnswers.dryRun,
        force: true
      });
    } else {
      console.log(chalk.yellow('Migration cancelled'));
    }
  }

  private async validateProject(projectPath: string): Promise<void> {
    // Check if it's an Angular project
    const packageJsonPath = path.join(projectPath, 'package.json');
    const angularJsonPath = path.join(projectPath, 'angular.json');

    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('package.json not found - not a valid Node.js project');
    }

    if (!await fs.pathExists(angularJsonPath)) {
      console.log(chalk.yellow('⚠ angular.json not found - may not be an Angular project'));
    }

    // Check for TypeScript
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    if (!await fs.pathExists(tsconfigPath)) {
      console.log(chalk.yellow('⚠ tsconfig.json not found - TypeScript configuration may be needed'));
    }
  }

  private async createBackup(projectPath: string): Promise<string> {
    const backupsDir = path.join(projectPath, '.migration-backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupsDir, `backup-${timestamp}`);

    await fs.ensureDir(backupsDir);
    await fs.copy(projectPath, backupPath, {
      filter: (src) => {
        const relativePath = path.relative(projectPath, src);
        return !relativePath.startsWith('node_modules') &&
               !relativePath.startsWith('dist') &&
               !relativePath.startsWith('.git') &&
               !relativePath.startsWith('.migration-backups');
      }
    });

    return backupPath;
  }

  private async generateTransformations(usageResults: AgGridUsage[]): Promise<Transformation[]> {
    const transformations: Transformation[] = [];

    for (const usage of usageResults) {
      // Transform imports
      for (const imp of usage.imports) {
        const importTransforms = this.importTransformer.transformImportStatement(
          usage.filePath, imp.line, imp.column, imp.originalText, imp.module, imp.imports
        );
        transformations.push(...importTransforms);
      }

      // Transform components
      for (const component of usage.components) {
        const componentTransforms = this.componentTransformer.transformComponent(
          usage.filePath, component.line, component.column, component.originalText,
          component.selector, component.attributes
        );
        transformations.push(...componentTransforms);
      }

      // Transform configurations
      for (const config of usage.configurations) {
        const configTransforms = this.configTransformer.transformGridConfig(
          usage.filePath, config.line, config.column, config.originalText, 
          { [config.property]: config.value }
        );
        transformations.push(...configTransforms);
      }

      // Transform CSS classes
      if (usage.cssClasses.length > 0) {
        const cssTransforms = this.cssTransformer.transformCssClasses(
          usage.filePath, 1, 0, usage.cssClasses.join(' '), usage.cssClasses
        );
        transformations.push(...cssTransforms);
      }
    }

    return transformations;
  }

  private async applyTransformations(
    transformations: Transformation[], 
    dryRun: boolean
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      filesProcessed: 0,
      filesModified: 0,
      errors: [],
      warnings: [],
      transformations
    };

    // Group transformations by file
    const fileTransformations = new Map<string, Transformation[]>();
    for (const transformation of transformations) {
      const existing = fileTransformations.get(transformation.filePath) || [];
      existing.push(transformation);
      fileTransformations.set(transformation.filePath, existing);
    }

    // Apply transformations file by file
    for (const [filePath, transforms] of fileTransformations.entries()) {
      try {
        result.filesProcessed++;

        if (dryRun) {
          console.log(chalk.blue(`\nPreview changes for: ${path.basename(filePath)}`));
          for (const transform of transforms) {
            console.log(chalk.gray(`  Line ${transform.line}: ${transform.description}`));
            console.log(chalk.red(`  - ${transform.oldText}`));
            console.log(chalk.green(`  + ${transform.newText}`));
          }
        } else {
          await this.applyFileTransformations(filePath, transforms);
          result.filesModified++;
        }

      } catch (error) {
        result.success = false;
        result.errors.push({
          filePath,
          line: 0,
          column: 0,
          message: `Failed to transform file: ${error}`,
          severity: 'error'
        });
      }
    }

    return result;
  }

  private async applyFileTransformations(filePath: string, transforms: Transformation[]): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Sort transforms by line number (descending) to avoid line number shifts
    const sortedTransforms = transforms.sort((a, b) => b.line - a.line);

    for (const transform of sortedTransforms) {
      if (transform.line > 0 && transform.line <= lines.length) {
        const line = lines[transform.line - 1];
        const newLine = line.replace(transform.oldText, transform.newText);
        lines[transform.line - 1] = newLine;
      }
    }

    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
  }

  private async updatePackageJson(projectPath: string): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // Remove ag-Grid dependencies
      const agGridDeps = [
        'ag-grid-angular',
        'ag-grid-community',
        'ag-grid-enterprise',
        '@ag-grid-community/core',
        '@ag-grid-community/angular',
        '@ag-grid-enterprise/all-modules'
      ];

      let modified = false;

      ['dependencies', 'devDependencies'].forEach(depType => {
        if (packageJson[depType]) {
          agGridDeps.forEach(dep => {
            if (packageJson[depType][dep]) {
              delete packageJson[depType][dep];
              modified = true;
            }
          });
        }
      });

      // Add ng-ui dependencies
      if (!packageJson.dependencies) packageJson.dependencies = {};
      
      if (!packageJson.dependencies['@ng-ui/grid']) {
        packageJson.dependencies['@ng-ui/grid'] = '^1.0.0';
        packageJson.dependencies['@ng-ui/core'] = '^1.0.0';
        modified = true;
      }

      if (modified) {
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        console.log(chalk.green('✓ Updated package.json dependencies'));
        console.log(chalk.yellow('  Run "npm install" to install new dependencies'));
      }
    }
  }
}