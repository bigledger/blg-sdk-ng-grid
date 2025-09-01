import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'fast-glob';
import { parse } from '@babel/parser';
import { Node, traverse } from '@babel/core';
import * as t from '@babel/types';
import {
  AgGridUsage,
  AgGridImport,
  AgGridComponent,
  AgGridConfig,
  AgGridEvent,
  AgGridApiCall,
  AgGridAttribute
} from '../types/migration.types';

export class AgGridScanner {
  private readonly AG_GRID_PACKAGES = [
    'ag-grid-angular',
    'ag-grid-community',
    'ag-grid-enterprise',
    '@ag-grid-community/core',
    '@ag-grid-enterprise/all-modules',
    '@ag-grid-community/angular'
  ];

  private readonly AG_GRID_SELECTORS = [
    'ag-grid-angular',
    'AgGridAngular'
  ];

  private readonly AG_GRID_CSS_CLASSES = [
    'ag-theme-',
    'ag-grid',
    'ag-header',
    'ag-row',
    'ag-cell',
    'ag-theme-alpine',
    'ag-theme-balham',
    'ag-theme-material',
    'ag-theme-fresh',
    'ag-theme-dark',
    'ag-theme-blue',
    'ag-theme-bootstrap'
  ];

  async scanProject(projectPath: string): Promise<AgGridUsage[]> {
    const results: AgGridUsage[] = [];
    
    // Find all TypeScript and HTML files
    const tsFiles = await glob('**/*.{ts,js}', {
      cwd: projectPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts', '**/*.d.ts'],
      absolute: true
    });

    const htmlFiles = await glob('**/*.html', {
      cwd: projectPath,
      ignore: ['**/node_modules/**', '**/dist/**'],
      absolute: true
    });

    const cssFiles = await glob('**/*.{css,scss,sass}', {
      cwd: projectPath,
      ignore: ['**/node_modules/**', '**/dist/**'],
      absolute: true
    });

    // Scan TypeScript files
    for (const filePath of tsFiles) {
      const usage = await this.scanTypeScriptFile(filePath);
      if (this.hasAgGridUsage(usage)) {
        results.push(usage);
      }
    }

    // Scan HTML files
    for (const filePath of htmlFiles) {
      const usage = await this.scanHtmlFile(filePath);
      if (this.hasAgGridUsage(usage)) {
        results.push(usage);
      }
    }

    // Scan CSS files
    for (const filePath of cssFiles) {
      const usage = await this.scanCssFile(filePath);
      if (this.hasAgGridUsage(usage)) {
        results.push(usage);
      }
    }

    return results;
  }

  private async scanTypeScriptFile(filePath: string): Promise<AgGridUsage> {
    const content = await fs.readFile(filePath, 'utf-8');
    const usage: AgGridUsage = {
      filePath,
      imports: [],
      components: [],
      configurations: [],
      events: [],
      apiCalls: [],
      cssClasses: []
    };

    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'decorators-legacy']
      });

      traverse(ast, {
        ImportDeclaration: (path) => {
          this.scanImportDeclaration(path.node, usage, content);
        },
        CallExpression: (path) => {
          this.scanCallExpression(path.node, usage, content);
        },
        Property: (path) => {
          this.scanProperty(path.node, usage, content);
        },
        JSXElement: (path) => {
          this.scanJSXElement(path.node, usage, content);
        },
        StringLiteral: (path) => {
          this.scanStringLiteral(path.node, usage, content);
        }
      });
    } catch (error) {
      console.warn(`Failed to parse ${filePath}:`, error);
    }

    return usage;
  }

  private async scanHtmlFile(filePath: string): Promise<AgGridUsage> {
    const content = await fs.readFile(filePath, 'utf-8');
    const usage: AgGridUsage = {
      filePath,
      imports: [],
      components: [],
      configurations: [],
      events: [],
      apiCalls: [],
      cssClasses: []
    };

    // Scan for ag-grid components in HTML
    const componentRegex = /<(ag-grid-angular)[^>]*>/gi;
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const attributes = this.parseHtmlAttributes(match[0]);
      
      usage.components.push({
        line,
        column: this.getColumnNumber(content, match.index),
        selector: match[1],
        attributes,
        originalText: match[0]
      });
    }

    // Scan for CSS classes
    this.scanCssClassesInContent(content, usage);

    return usage;
  }

  private async scanCssFile(filePath: string): Promise<AgGridUsage> {
    const content = await fs.readFile(filePath, 'utf-8');
    const usage: AgGridUsage = {
      filePath,
      imports: [],
      components: [],
      configurations: [],
      events: [],
      apiCalls: [],
      cssClasses: []
    };

    this.scanCssClassesInContent(content, usage);
    return usage;
  }

  private scanImportDeclaration(node: t.ImportDeclaration, usage: AgGridUsage, content: string): void {
    const source = node.source.value;
    if (this.AG_GRID_PACKAGES.some(pkg => source.includes(pkg))) {
      const imports = node.specifiers.map(spec => {
        if (t.isImportDefaultSpecifier(spec)) {
          return spec.local.name;
        } else if (t.isImportSpecifier(spec)) {
          return t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value;
        } else if (t.isImportNamespaceSpecifier(spec)) {
          return `* as ${spec.local.name}`;
        }
        return '';
      }).filter(Boolean);

      const line = node.loc?.start.line || 1;
      usage.imports.push({
        line,
        column: node.loc?.start.column || 0,
        module: source,
        imports,
        originalText: this.getTextAtLocation(content, line, imports.join(', '))
      });
    }
  }

  private scanCallExpression(node: t.CallExpression, usage: AgGridUsage, content: string): void {
    if (t.isMemberExpression(node.callee)) {
      const objectName = t.isIdentifier(node.callee.object) ? node.callee.object.name : '';
      const methodName = t.isIdentifier(node.callee.property) ? node.callee.property.name : '';
      
      // Check for ag-Grid API calls
      if (this.isAgGridApiCall(objectName, methodName)) {
        const line = node.loc?.start.line || 1;
        usage.apiCalls.push({
          line,
          column: node.loc?.start.column || 0,
          method: `${objectName}.${methodName}`,
          arguments: node.arguments.map(arg => this.nodeToString(arg)),
          originalText: this.getTextAtLocation(content, line, `${objectName}.${methodName}`)
        });
      }
    }
  }

  private scanProperty(node: t.Property, usage: AgGridUsage, content: string): void {
    if (t.isIdentifier(node.key)) {
      const propertyName = node.key.name;
      
      // Check for ag-Grid configuration properties
      if (this.isAgGridConfigProperty(propertyName)) {
        const line = node.loc?.start.line || 1;
        usage.configurations.push({
          line,
          column: node.loc?.start.column || 0,
          property: propertyName,
          value: this.nodeToString(node.value),
          type: this.getConfigType(propertyName),
          originalText: this.getTextAtLocation(content, line, propertyName)
        });
      }
    }
  }

  private scanJSXElement(node: t.JSXElement, usage: AgGridUsage, content: string): void {
    if (t.isJSXIdentifier(node.openingElement.name)) {
      const tagName = node.openingElement.name.name;
      
      if (this.AG_GRID_SELECTORS.includes(tagName)) {
        const line = node.loc?.start.line || 1;
        const attributes = node.openingElement.attributes.map(attr => {
          if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
            return {
              name: attr.name.name,
              value: attr.value ? this.nodeToString(attr.value) : '',
              line: attr.loc?.start.line || line,
              column: attr.loc?.start.column || 0
            };
          }
          return null;
        }).filter(Boolean) as AgGridAttribute[];

        usage.components.push({
          line,
          column: node.loc?.start.column || 0,
          selector: tagName,
          attributes,
          originalText: this.getTextAtLocation(content, line, tagName)
        });
      }
    }
  }

  private scanStringLiteral(node: t.StringLiteral, usage: AgGridUsage, content: string): void {
    const value = node.value;
    
    // Check for CSS classes
    this.AG_GRID_CSS_CLASSES.forEach(className => {
      if (value.includes(className)) {
        usage.cssClasses.push(value);
      }
    });
  }

  private scanCssClassesInContent(content: string, usage: AgGridUsage): void {
    this.AG_GRID_CSS_CLASSES.forEach(className => {
      const regex = new RegExp(className + '[\\w-]*', 'g');
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (!usage.cssClasses.includes(match[0])) {
          usage.cssClasses.push(match[0]);
        }
      }
    });
  }

  private parseHtmlAttributes(htmlTag: string): AgGridAttribute[] {
    const attributes: AgGridAttribute[] = [];
    const attributeRegex = /(\w+(?:-\w+)*)(?:="([^"]*)"|\s|>)/g;
    let match;
    
    while ((match = attributeRegex.exec(htmlTag)) !== null) {
      attributes.push({
        name: match[1],
        value: match[2] || '',
        line: 0, // Will be updated by caller
        column: 0 // Will be updated by caller
      });
    }
    
    return attributes;
  }

  private isAgGridApiCall(objectName: string, methodName: string): boolean {
    const commonApiMethods = [
      'setRowData', 'getRowData', 'setColumnDefs', 'getColumnDefs',
      'sizeColumnsToFit', 'autoSizeColumns', 'exportDataAsCsv',
      'exportDataAsExcel', 'selectAll', 'deselectAll', 'getSelectedRows',
      'refreshCells', 'redrawRows', 'setQuickFilter', 'getModel',
      'forEachNode', 'getRenderedNodes', 'startEditingCell', 'stopEditing'
    ];

    return commonApiMethods.includes(methodName) || 
           objectName.includes('grid') || 
           objectName.includes('Api');
  }

  private isAgGridConfigProperty(propertyName: string): boolean {
    const configProperties = [
      'rowData', 'columnDefs', 'defaultColDef', 'gridOptions',
      'enableSorting', 'enableFiltering', 'enableColResize',
      'pagination', 'paginationPageSize', 'rowSelection',
      'suppressRowClickSelection', 'onGridReady', 'onSelectionChanged',
      'onRowClicked', 'onCellClicked', 'onColumnResized',
      'components', 'frameworkComponents', 'context'
    ];

    return configProperties.includes(propertyName);
  }

  private getConfigType(propertyName: string): 'gridOptions' | 'columnDefs' | 'defaultColDef' | 'other' {
    if (propertyName === 'gridOptions') return 'gridOptions';
    if (propertyName === 'columnDefs') return 'columnDefs';
    if (propertyName === 'defaultColDef') return 'defaultColDef';
    return 'other';
  }

  private hasAgGridUsage(usage: AgGridUsage): boolean {
    return usage.imports.length > 0 ||
           usage.components.length > 0 ||
           usage.configurations.length > 0 ||
           usage.events.length > 0 ||
           usage.apiCalls.length > 0 ||
           usage.cssClasses.length > 0;
  }

  private nodeToString(node: t.Node): string {
    if (t.isStringLiteral(node)) return node.value;
    if (t.isNumericLiteral(node)) return node.value.toString();
    if (t.isBooleanLiteral(node)) return node.value.toString();
    if (t.isIdentifier(node)) return node.name;
    if (t.isNullLiteral(node)) return 'null';
    return '[complex expression]';
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getColumnNumber(content: string, index: number): number {
    const lines = content.substring(0, index).split('\n');
    return lines[lines.length - 1].length;
  }

  private getTextAtLocation(content: string, line: number, defaultText: string): string {
    const lines = content.split('\n');
    if (line <= lines.length) {
      return lines[line - 1].trim();
    }
    return defaultText;
  }
}