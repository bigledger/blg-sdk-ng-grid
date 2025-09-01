import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import {
  AgGridUsage,
  CompatibilityReport,
  FeatureCompatibility,
  ManualChange,
  EstimatedEffort
} from '../types/migration.types';

export class MigrationReportGenerator {
  private readonly FEATURE_SUPPORT_MAP = new Map<string, 'supported' | 'partial' | 'unsupported'>([
    // Core Features - Fully Supported
    ['rowData', 'supported'],
    ['columnDefs', 'supported'],
    ['gridOptions', 'supported'],
    ['sorting', 'supported'],
    ['filtering', 'supported'],
    ['pagination', 'supported'],
    ['selection', 'supported'],
    ['cellRendering', 'supported'],
    ['cellEditing', 'supported'],
    ['columnResizing', 'supported'],
    ['exportCSV', 'supported'],
    ['exportExcel', 'supported'],
    
    // Partially Supported Features
    ['customFilters', 'partial'],
    ['customRenderers', 'partial'],
    ['customEditors', 'partial'],
    ['grouping', 'partial'],
    ['aggregation', 'partial'],
    ['virtualScrolling', 'partial'],
    ['contextMenu', 'partial'],
    ['tooltips', 'partial'],
    
    // Unsupported Features (Enterprise or not yet implemented)
    ['rangeSelection', 'unsupported'],
    ['charts', 'unsupported'],
    ['masterDetail', 'unsupported'],
    ['treeData', 'unsupported'],
    ['pivotMode', 'unsupported'],
    ['statusBar', 'unsupported'],
    ['sideBar', 'unsupported'],
    ['toolPanel', 'unsupported'],
    ['serverSideModel', 'unsupported'],
    ['infiniteModel', 'unsupported'],
    ['clipboardOperations', 'unsupported'],
    ['advancedFiltering', 'unsupported'],
    ['columnGrouping', 'unsupported']
  ]);

  private readonly MIGRATION_COMPLEXITY_WEIGHTS = {
    imports: 1,
    components: 2,
    configurations: 3,
    events: 2,
    apiCalls: 3,
    cssClasses: 1,
    unsupportedFeatures: 5
  };

  async generateReport(
    usageResults: AgGridUsage[],
    outputPath?: string,
    jsonFormat: boolean = false
  ): Promise<CompatibilityReport> {
    const report = this.analyzeCompatibility(usageResults);
    
    if (outputPath) {
      if (jsonFormat) {
        await this.saveJsonReport(report, outputPath);
      } else {
        await this.saveHtmlReport(report, outputPath);
      }
    } else {
      this.printConsoleReport(report);
    }

    return report;
  }

  private analyzeCompatibility(usageResults: AgGridUsage[]): CompatibilityReport {
    const features = this.analyzeFeatures(usageResults);
    const manualChanges = this.identifyManualChanges(usageResults);
    const estimatedEffort = this.calculateEstimatedEffort(usageResults, manualChanges);
    
    const totalFeatures = features.length;
    const fullySupported = features.filter(f => f.status === 'supported').length;
    const partiallySupported = features.filter(f => f.status === 'partial').length;
    const unsupported = features.filter(f => f.status === 'unsupported').length;

    // Calculate overall compatibility score (0-100)
    const overallScore = Math.round(
      ((fullySupported * 1.0) + (partiallySupported * 0.7) + (unsupported * 0.0)) / 
      totalFeatures * 100
    );

    return {
      overallScore,
      totalFiles: usageResults.length,
      agGridFiles: usageResults.filter(r => 
        r.imports.length > 0 || r.components.length > 0
      ).length,
      compatibility: {
        fullySupported,
        partiallySupported,
        unsupported
      },
      features,
      manualChanges,
      estimatedEffort
    };
  }

  private analyzeFeatures(usageResults: AgGridUsage[]): FeatureCompatibility[] {
    const featureUsage = new Map<string, number>();
    
    // Count feature usage across all files
    for (const usage of usageResults) {
      // Count configuration features
      for (const config of usage.configurations) {
        const feature = this.mapConfigToFeature(config.property);
        featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
      }
      
      // Count API features
      for (const apiCall of usage.apiCalls) {
        const feature = this.mapApiCallToFeature(apiCall.method);
        featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
      }

      // Count component features
      for (const component of usage.components) {
        featureUsage.set('components', (featureUsage.get('components') || 0) + 1);
        
        // Check attributes for specific features
        for (const attr of component.attributes) {
          const feature = this.mapAttributeToFeature(attr.name);
          if (feature) {
            featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
          }
        }
      }
    }

    // Convert to feature compatibility list
    const features: FeatureCompatibility[] = [];
    
    for (const [feature, usage] of featureUsage.entries()) {
      const status = this.FEATURE_SUPPORT_MAP.get(feature) || 'partial';
      
      features.push({
        feature,
        status,
        usage,
        description: this.getFeatureDescription(feature),
        migrationNotes: this.getFeatureMigrationNotes(feature, status)
      });
    }

    return features.sort((a, b) => b.usage - a.usage);
  }

  private identifyManualChanges(usageResults: AgGridUsage[]): ManualChange[] {
    const manualChanges: ManualChange[] = [];

    for (const usage of usageResults) {
      // Check for unsupported configurations
      for (const config of usage.configurations) {
        const support = this.FEATURE_SUPPORT_MAP.get(this.mapConfigToFeature(config.property));
        if (support === 'unsupported' || support === 'partial') {
          manualChanges.push({
            filePath: usage.filePath,
            line: config.line,
            description: `Configuration property '${config.property}' needs manual migration`,
            reason: support === 'unsupported' ? 'Feature not supported' : 'Feature partially supported',
            suggestion: this.getConfigMigrationSuggestion(config.property),
            priority: support === 'unsupported' ? 'high' : 'medium'
          });
        }
      }

      // Check for unsupported API calls
      for (const apiCall of usage.apiCalls) {
        const feature = this.mapApiCallToFeature(apiCall.method);
        const support = this.FEATURE_SUPPORT_MAP.get(feature);
        if (support === 'unsupported') {
          manualChanges.push({
            filePath: usage.filePath,
            line: apiCall.line,
            description: `API call '${apiCall.method}' not supported`,
            reason: 'API method not available in ng-ui',
            suggestion: this.getApiMigrationSuggestion(apiCall.method),
            priority: 'high'
          });
        }
      }

      // Check for enterprise features
      const enterpriseFeatures = this.detectEnterpriseFeatures(usage);
      for (const feature of enterpriseFeatures) {
        manualChanges.push({
          filePath: usage.filePath,
          line: 0,
          description: `Enterprise feature '${feature}' detected`,
          reason: 'Enterprise features not available in ng-ui',
          suggestion: 'Consider alternative implementation or remove feature',
          priority: 'high'
        });
      }
    }

    return manualChanges;
  }

  private calculateEstimatedEffort(
    usageResults: AgGridUsage[],
    manualChanges: ManualChange[]
  ): EstimatedEffort {
    let totalComplexity = 0;
    let automaticPoints = 0;
    let manualPoints = 0;

    for (const usage of usageResults) {
      automaticPoints += usage.imports.length * this.MIGRATION_COMPLEXITY_WEIGHTS.imports;
      automaticPoints += usage.components.length * this.MIGRATION_COMPLEXITY_WEIGHTS.components;
      automaticPoints += usage.cssClasses.length * this.MIGRATION_COMPLEXITY_WEIGHTS.cssClasses;
      
      // Configurations and API calls may require manual intervention
      const supportedConfigs = usage.configurations.filter(c => 
        this.FEATURE_SUPPORT_MAP.get(this.mapConfigToFeature(c.property)) === 'supported'
      );
      const unsupportedConfigs = usage.configurations.filter(c => 
        this.FEATURE_SUPPORT_MAP.get(this.mapConfigToFeature(c.property)) !== 'supported'
      );

      automaticPoints += supportedConfigs.length * this.MIGRATION_COMPLEXITY_WEIGHTS.configurations;
      manualPoints += unsupportedConfigs.length * this.MIGRATION_COMPLEXITY_WEIGHTS.configurations;
      manualPoints += usage.apiCalls.length * this.MIGRATION_COMPLEXITY_WEIGHTS.apiCalls;
    }

    // Add manual changes complexity
    manualPoints += manualChanges.length * this.MIGRATION_COMPLEXITY_WEIGHTS.unsupportedFeatures;

    totalComplexity = automaticPoints + manualPoints;
    const automaticPercentage = totalComplexity > 0 ? Math.round((automaticPoints / totalComplexity) * 100) : 100;
    const manualPercentage = 100 - automaticPercentage;

    // Estimate time based on complexity
    let timeEstimate: string;
    let complexity: 'low' | 'medium' | 'high';

    if (totalComplexity < 50) {
      timeEstimate = '1-2 hours';
      complexity = 'low';
    } else if (totalComplexity < 150) {
      timeEstimate = '4-8 hours';
      complexity = 'medium';
    } else {
      timeEstimate = '1-3 days';
      complexity = 'high';
    }

    return {
      automatic: automaticPercentage,
      manual: manualPercentage,
      timeEstimate,
      complexity
    };
  }

  private async saveHtmlReport(report: CompatibilityReport, outputPath: string): Promise<void> {
    const html = this.generateHtmlReport(report);
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  private async saveJsonReport(report: CompatibilityReport, outputPath: string): Promise<void> {
    await fs.writeJson(outputPath, report, { spaces: 2 });
  }

  private printConsoleReport(report: CompatibilityReport): void {
    console.log(chalk.blue.bold('\n📊 ag-Grid to ng-ui Migration Analysis\n'));
    
    // Overall score
    const scoreColor = report.overallScore >= 80 ? 'green' : 
                      report.overallScore >= 60 ? 'yellow' : 'red';
    console.log(chalk[scoreColor](`Overall Compatibility Score: ${report.overallScore}%\n`));

    // File statistics
    console.log(chalk.white.bold('📁 File Analysis:'));
    console.log(`  Total files scanned: ${report.totalFiles}`);
    console.log(`  Files using ag-Grid: ${report.agGridFiles}\n`);

    // Feature compatibility
    console.log(chalk.white.bold('🔧 Feature Compatibility:'));
    console.log(chalk.green(`  ✓ Fully supported: ${report.compatibility.fullySupported}`));
    console.log(chalk.yellow(`  ⚠ Partially supported: ${report.compatibility.partiallySupported}`));
    console.log(chalk.red(`  ✗ Unsupported: ${report.compatibility.unsupported}\n`));

    // Effort estimation
    console.log(chalk.white.bold('⏱ Estimated Migration Effort:'));
    console.log(`  Automatic: ${report.estimatedEffort.automatic}%`);
    console.log(`  Manual: ${report.estimatedEffort.manual}%`);
    console.log(`  Time estimate: ${report.estimatedEffort.timeEstimate}`);
    console.log(`  Complexity: ${report.estimatedEffort.complexity}\n`);

    // Top features by usage
    console.log(chalk.white.bold('🎯 Most Used Features:'));
    const topFeatures = report.features.slice(0, 10);
    for (const feature of topFeatures) {
      const icon = feature.status === 'supported' ? '✓' : 
                   feature.status === 'partial' ? '⚠' : '✗';
      const color = feature.status === 'supported' ? 'green' : 
                    feature.status === 'partial' ? 'yellow' : 'red';
      
      console.log(chalk[color](`  ${icon} ${feature.feature} (${feature.usage} uses)`));
    }

    // Manual changes summary
    if (report.manualChanges.length > 0) {
      console.log(chalk.white.bold('\n🔧 Manual Changes Required:'));
      const highPriority = report.manualChanges.filter(c => c.priority === 'high').length;
      const mediumPriority = report.manualChanges.filter(c => c.priority === 'medium').length;
      const lowPriority = report.manualChanges.filter(c => c.priority === 'low').length;

      if (highPriority > 0) console.log(chalk.red(`  High priority: ${highPriority}`));
      if (mediumPriority > 0) console.log(chalk.yellow(`  Medium priority: ${mediumPriority}`));
      if (lowPriority > 0) console.log(chalk.white(`  Low priority: ${lowPriority}`));
    }

    console.log(chalk.blue('\nRun with --report option to generate detailed HTML report\n'));
  }

  private generateHtmlReport(report: CompatibilityReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ag-Grid to ng-ui Migration Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 48px; font-weight: bold; margin: 20px 0; }
        .score.high { color: #22c55e; }
        .score.medium { color: #f59e0b; }
        .score.low { color: #ef4444; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; }
        .card h3 { margin: 0 0 15px 0; color: #1e293b; }
        .supported { border-left-color: #22c55e; }
        .partial { border-left-color: #f59e0b; }
        .unsupported { border-left-color: #ef4444; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .feature-list li:last-child { border-bottom: none; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge.supported { background: #dcfce7; color: #166534; }
        .badge.partial { background: #fef3c7; color: #92400e; }
        .badge.unsupported { background: #fee2e2; color: #991b1b; }
        .manual-changes { margin-top: 30px; }
        .manual-changes table { width: 100%; border-collapse: collapse; }
        .manual-changes th, .manual-changes td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .manual-changes th { background: #f8fafc; font-weight: 600; }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #d97706; font-weight: bold; }
        .priority-low { color: #059669; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 ag-Grid to ng-ui Migration Report</h1>
            <div class="score ${report.overallScore >= 80 ? 'high' : report.overallScore >= 60 ? 'medium' : 'low'}">
                ${report.overallScore}%
            </div>
            <p>Overall Compatibility Score</p>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📁 Files Analyzed</h3>
                <p><strong>${report.totalFiles}</strong> total files</p>
                <p><strong>${report.agGridFiles}</strong> using ag-Grid</p>
            </div>

            <div class="card">
                <h3>🔧 Feature Support</h3>
                <p class="supported">✓ <strong>${report.compatibility.fullySupported}</strong> fully supported</p>
                <p class="partial">⚠ <strong>${report.compatibility.partiallySupported}</strong> partially supported</p>
                <p class="unsupported">✗ <strong>${report.compatibility.unsupported}</strong> unsupported</p>
            </div>

            <div class="card">
                <h3>⏱ Migration Effort</h3>
                <p><strong>${report.estimatedEffort.automatic}%</strong> automatic</p>
                <p><strong>${report.estimatedEffort.manual}%</strong> manual</p>
                <p><strong>${report.estimatedEffort.timeEstimate}</strong> estimated</p>
                <p>Complexity: <strong>${report.estimatedEffort.complexity}</strong></p>
            </div>
        </div>

        <div class="card">
            <h3>🎯 Feature Usage Analysis</h3>
            <ul class="feature-list">
                ${report.features.map(feature => `
                    <li>
                        <strong>${feature.feature}</strong> 
                        <span class="badge ${feature.status}">${feature.status}</span>
                        <span style="float: right;">${feature.usage} uses</span>
                        ${feature.migrationNotes ? `<br><small style="color: #6b7280;">${feature.migrationNotes}</small>` : ''}
                    </li>
                `).join('')}
            </ul>
        </div>

        ${report.manualChanges.length > 0 ? `
            <div class="manual-changes">
                <h3>🔧 Manual Changes Required</h3>
                <table>
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Line</th>
                            <th>Description</th>
                            <th>Priority</th>
                            <th>Suggestion</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.manualChanges.map(change => `
                            <tr>
                                <td><code>${path.basename(change.filePath)}</code></td>
                                <td>${change.line || '-'}</td>
                                <td>${change.description}</td>
                                <td class="priority-${change.priority}">${change.priority}</td>
                                <td><small>${change.suggestion}</small></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #0ea5e9;">
            <h4>💡 Migration Recommendations</h4>
            <ul>
                <li>Start with automatic transformations using the migration tool</li>
                <li>Test each component after migration to ensure functionality</li>
                <li>Review all manual changes marked as high priority first</li>
                <li>Consider implementing alternative solutions for unsupported enterprise features</li>
                <li>Update your package.json dependencies after migration</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  // Helper methods for mapping features and providing migration guidance
  private mapConfigToFeature(property: string): string {
    const mappings: { [key: string]: string } = {
      'rowData': 'rowData',
      'columnDefs': 'columnDefs',
      'gridOptions': 'gridOptions',
      'enableSorting': 'sorting',
      'enableFiltering': 'filtering',
      'pagination': 'pagination',
      'rowSelection': 'selection',
      'enableRangeSelection': 'rangeSelection',
      'enableCharts': 'charts',
      'masterDetail': 'masterDetail',
      'treeData': 'treeData',
      'pivotMode': 'pivotMode',
      'statusBar': 'statusBar',
      'sideBar': 'sideBar',
      'toolPanel': 'toolPanel'
    };
    
    return mappings[property] || property;
  }

  private mapApiCallToFeature(method: string): string {
    if (method.includes('export') || method.includes('Export')) return 'export';
    if (method.includes('selection') || method.includes('Selection')) return 'selection';
    if (method.includes('filter') || method.includes('Filter')) return 'filtering';
    if (method.includes('sort') || method.includes('Sort')) return 'sorting';
    if (method.includes('group') || method.includes('Group')) return 'grouping';
    return 'apiCalls';
  }

  private mapAttributeToFeature(attribute: string): string | null {
    if (attribute.includes('sort')) return 'sorting';
    if (attribute.includes('filter')) return 'filtering';
    if (attribute.includes('selection')) return 'selection';
    if (attribute.includes('pagination')) return 'pagination';
    if (attribute.includes('resize')) return 'columnResizing';
    return null;
  }

  private getFeatureDescription(feature: string): string {
    const descriptions: { [key: string]: string } = {
      'rowData': 'Data binding and display',
      'columnDefs': 'Column definitions and configuration',
      'sorting': 'Column sorting functionality',
      'filtering': 'Data filtering and search',
      'pagination': 'Data pagination controls',
      'selection': 'Row and cell selection',
      'cellRendering': 'Custom cell rendering',
      'cellEditing': 'Inline cell editing',
      'export': 'Data export capabilities',
      'grouping': 'Row grouping and aggregation',
      'rangeSelection': 'Excel-like range selection (Enterprise)',
      'charts': 'Integrated charting (Enterprise)',
      'masterDetail': 'Master-detail row expansion (Enterprise)',
      'treeData': 'Hierarchical tree data display',
      'pivotMode': 'Pivot table functionality (Enterprise)'
    };
    
    return descriptions[feature] || 'Feature functionality';
  }

  private getFeatureMigrationNotes(feature: string, status: string): string | undefined {
    if (status === 'supported') return undefined;
    
    const notes: { [key: string]: string } = {
      'rangeSelection': 'Consider implementing custom selection logic or using third-party solutions',
      'charts': 'Use external charting libraries like Chart.js or D3.js',
      'masterDetail': 'Implement custom expandable rows with nested components',
      'treeData': 'Use ng-ui tree components or implement custom hierarchical display',
      'pivotMode': 'Consider using dedicated pivot table libraries',
      'customFilters': 'May require adjusting filter component interfaces',
      'customRenderers': 'Cell renderer API may differ, review implementation',
      'grouping': 'Basic grouping supported, advanced features may need custom implementation'
    };
    
    return notes[feature];
  }

  private getConfigMigrationSuggestion(property: string): string {
    const suggestions: { [key: string]: string } = {
      'enableRangeSelection': 'Remove or implement custom selection behavior',
      'enableCharts': 'Use external charting library integration',
      'masterDetail': 'Use nested component architecture',
      'treeData': 'Use ng-ui tree components',
      'statusBar': 'Implement custom status display',
      'sideBar': 'Create custom sidebar component',
      'toolPanel': 'Build custom tool panel'
    };
    
    return suggestions[property] || 'Review ng-ui documentation for alternatives';
  }

  private getApiMigrationSuggestion(method: string): string {
    const suggestions: { [key: string]: string } = {
      'exportDataAsExcel': 'Use ng-ui export service with Excel format',
      'exportDataAsCsv': 'Use ng-ui export service with CSV format',
      'selectAll': 'Use ng-ui grid selection API',
      'getSelectedRows': 'Access selected rows through ng-ui API',
      'setQuickFilter': 'Use ng-ui filter API',
      'sizeColumnsToFit': 'Use ng-ui column sizing API'
    };
    
    return suggestions[method] || 'Check ng-ui API documentation for equivalent method';
  }

  private detectEnterpriseFeatures(usage: AgGridUsage): string[] {
    const enterpriseFeatures: string[] = [];
    
    // Check imports for enterprise packages
    for (const imp of usage.imports) {
      if (imp.module.includes('enterprise')) {
        enterpriseFeatures.push(`Enterprise package: ${imp.module}`);
      }
    }
    
    // Check configurations for enterprise features
    const enterpriseConfigs = [
      'enableRangeSelection', 'enableCharts', 'masterDetail', 'treeData',
      'statusBar', 'sideBar', 'toolPanel', 'pivotMode'
    ];
    
    for (const config of usage.configurations) {
      if (enterpriseConfigs.includes(config.property)) {
        enterpriseFeatures.push(`Enterprise config: ${config.property}`);
      }
    }
    
    return enterpriseFeatures;
  }
}