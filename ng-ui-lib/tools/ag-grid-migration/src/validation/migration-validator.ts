import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { MigrationError } from '../types/migration.types';

export class MigrationValidator {
  async validateProject(projectPath: string): Promise<boolean> {
    const validationResults = await Promise.allSettled([
      this.validateTypeScriptCompilation(projectPath),
      this.validateAngularBuild(projectPath),
      this.validateImportResolution(projectPath),
      this.validateTemplateBindings(projectPath)
    ]);

    const errors = validationResults
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      console.log(chalk.red('\n❌ Validation Errors:'));
      errors.forEach(error => {
        console.log(chalk.red(`  • ${error.message || error}`));
      });
      return false;
    }

    console.log(chalk.green('✅ All validations passed'));
    return true;
  }

  async validateTypeScriptCompilation(projectPath: string): Promise<void> {
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    
    if (!await fs.pathExists(tsconfigPath)) {
      throw new Error('tsconfig.json not found');
    }

    return new Promise((resolve, reject) => {
      const tsc = spawn('npx', ['tsc', '--noEmit', '--project', tsconfigPath], {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errors = '';

      tsc.stdout.on('data', (data) => {
        output += data.toString();
      });

      tsc.stderr.on('data', (data) => {
        errors += data.toString();
      });

      tsc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`TypeScript compilation failed:\n${errors || output}`));
        }
      });

      tsc.on('error', (error) => {
        reject(new Error(`Failed to run TypeScript compiler: ${error.message}`));
      });
    });
  }

  async validateAngularBuild(projectPath: string): Promise<void> {
    const angularJsonPath = path.join(projectPath, 'angular.json');
    
    if (!await fs.pathExists(angularJsonPath)) {
      console.log(chalk.yellow('⚠ Skipping Angular build validation - angular.json not found'));
      return;
    }

    return new Promise((resolve, reject) => {
      const ngBuild = spawn('npx', ['ng', 'build', '--configuration=production', '--aot'], {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errors = '';

      ngBuild.stdout.on('data', (data) => {
        output += data.toString();
      });

      ngBuild.stderr.on('data', (data) => {
        errors += data.toString();
      });

      ngBuild.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          // Try to extract meaningful error information
          const errorLines = (errors || output).split('\n').filter(line => 
            line.includes('error') || line.includes('ERROR') || line.includes('Error')
          );
          
          reject(new Error(`Angular build failed:\n${errorLines.slice(0, 10).join('\n')}`));
        }
      });

      ngBuild.on('error', (error) => {
        reject(new Error(`Failed to run Angular build: ${error.message}`));
      });
    });
  }

  async validateImportResolution(projectPath: string): Promise<void> {
    const errors: MigrationError[] = [];
    
    // Find all TypeScript files
    const tsFiles = await this.findTypeScriptFiles(projectPath);
    
    for (const filePath of tsFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const importErrors = this.validateImportsInFile(filePath, content);
        errors.push(...importErrors);
      } catch (error) {
        errors.push({
          filePath,
          line: 0,
          column: 0,
          message: `Failed to read file: ${error}`,
          severity: 'error'
        });
      }
    }

    if (errors.length > 0) {
      const errorMessages = errors.map(err => 
        `${path.relative(projectPath, err.filePath)}:${err.line} - ${err.message}`
      );
      throw new Error(`Import resolution errors:\n${errorMessages.slice(0, 10).join('\n')}`);
    }
  }

  async validateTemplateBindings(projectPath: string): Promise<void> {
    const errors: MigrationError[] = [];
    
    // Find all HTML template files
    const htmlFiles = await this.findHtmlFiles(projectPath);
    
    for (const filePath of htmlFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const templateErrors = this.validateTemplateBindingsInFile(filePath, content);
        errors.push(...templateErrors);
      } catch (error) {
        errors.push({
          filePath,
          line: 0,
          column: 0,
          message: `Failed to read template file: ${error}`,
          severity: 'error'
        });
      }
    }

    if (errors.length > 0) {
      const errorMessages = errors.map(err => 
        `${path.relative(projectPath, err.filePath)}:${err.line} - ${err.message}`
      );
      throw new Error(`Template binding errors:\n${errorMessages.slice(0, 10).join('\n')}`);
    }
  }

  private validateImportsInFile(filePath: string, content: string): MigrationError[] {
    const errors: MigrationError[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for remaining ag-Grid imports
      const agGridImportRegex = /from\s+['"].*ag-grid.*['"]/;
      if (agGridImportRegex.test(line)) {
        errors.push({
          filePath,
          line: lineNumber,
          column: 0,
          message: 'Remaining ag-Grid import detected - migration may be incomplete',
          severity: 'warning'
        });
      }

      // Check for ng-ui imports that might not exist
      const nguiImportRegex = /from\s+['"]@ng-ui\/(\w+)['"]/;
      const nguiMatch = nguiImportRegex.exec(line);
      if (nguiMatch) {
        const module = nguiMatch[1];
        const validModules = ['core', 'grid', 'theme', 'export', 'cell', 'column', 'row', 'data'];
        
        if (!validModules.includes(module)) {
          errors.push({
            filePath,
            line: lineNumber,
            column: 0,
            message: `Invalid ng-ui module: @ng-ui/${module}`,
            severity: 'error'
          });
        }
      }

      // Check for broken import paths
      const importRegex = /import.*from\s+['"]([^'"]+)['"]/;
      const importMatch = importRegex.exec(line);
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Check for common migration mistakes
        if (importPath.includes('ag-grid-angular') || importPath.includes('AgGridAngular')) {
          errors.push({
            filePath,
            line: lineNumber,
            column: 0,
            message: 'Found unmigrated ag-Grid import',
            severity: 'error'
          });
        }
      }
    });

    return errors;
  }

  private validateTemplateBindingsInFile(filePath: string, content: string): MigrationError[] {
    const errors: MigrationError[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for remaining ag-grid-angular components
      if (line.includes('<ag-grid-angular') || line.includes('ag-grid-angular')) {
        errors.push({
          filePath,
          line: lineNumber,
          column: 0,
          message: 'Remaining ag-grid-angular component found - migration incomplete',
          severity: 'error'
        });
      }

      // Check for ag-Grid CSS classes
      const agCssRegex = /class=['"][^'"]*ag-theme-[^'"]*['"]/;
      if (agCssRegex.test(line)) {
        errors.push({
          filePath,
          line: lineNumber,
          column: 0,
          message: 'ag-Grid theme CSS class found - should be migrated to ng-ui theme',
          severity: 'warning'
        });
      }

      // Check for potentially broken ng-ui bindings
      const nguiComponentRegex = /<ngui-grid[^>]*>/;
      if (nguiComponentRegex.test(line)) {
        // Validate common attribute bindings
        const requiredBindings = ['[data]', '[columns]'];
        const hasDataBinding = line.includes('[data]') || line.includes('data="');
        const hasColumnsBinding = line.includes('[columns]') || line.includes('columns="');
        
        if (!hasDataBinding) {
          errors.push({
            filePath,
            line: lineNumber,
            column: 0,
            message: 'ng-ui grid component missing required [data] binding',
            severity: 'error'
          });
        }
        
        if (!hasColumnsBinding) {
          errors.push({
            filePath,
            line: lineNumber,
            column: 0,
            message: 'ng-ui grid component missing required [columns] binding',
            severity: 'error'
          });
        }
      }

      // Check for unsupported event bindings
      const unsupportedEvents = [
        '(rangeSelectionChanged)',
        '(chartCreated)',
        '(masterDetailOpened)',
        '(pivotModeChanged)'
      ];
      
      unsupportedEvents.forEach(event => {
        if (line.includes(event)) {
          errors.push({
            filePath,
            line: lineNumber,
            column: 0,
            message: `Unsupported event binding: ${event} - not available in ng-ui`,
            severity: 'error'
          });
        }
      });
    });

    return errors;
  }

  private async findTypeScriptFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const findFiles = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, dist, and other build directories
          if (!['node_modules', 'dist', '.git', '.angular'].includes(entry.name)) {
            await findFiles(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    };
    
    await findFiles(projectPath);
    return files;
  }

  private async findHtmlFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const findFiles = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', '.git', '.angular'].includes(entry.name)) {
            await findFiles(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          files.push(fullPath);
        }
      }
    };
    
    await findFiles(projectPath);
    return files;
  }

  async validateDependencies(projectPath: string): Promise<boolean> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!await fs.pathExists(packageJsonPath)) {
      console.log(chalk.yellow('⚠ package.json not found - cannot validate dependencies'));
      return false;
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for remaining ag-Grid dependencies
    const agGridDeps = Object.keys(dependencies).filter(dep => 
      dep.includes('ag-grid') || dep.includes('@ag-grid')
    );
    
    if (agGridDeps.length > 0) {
      console.log(chalk.yellow(`⚠ Found remaining ag-Grid dependencies: ${agGridDeps.join(', ')}`));
      console.log(chalk.yellow('  Consider removing these from package.json'));
    }

    // Check for ng-ui dependencies
    const nguiDeps = Object.keys(dependencies).filter(dep => dep.includes('@ng-ui'));
    
    if (nguiDeps.length === 0) {
      console.log(chalk.yellow('⚠ No @ng-ui dependencies found'));
      console.log(chalk.yellow('  Make sure to install ng-ui packages'));
      return false;
    }

    console.log(chalk.green(`✅ Found ng-ui dependencies: ${nguiDeps.join(', ')}`));
    return true;
  }
}