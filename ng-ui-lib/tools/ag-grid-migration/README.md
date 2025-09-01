# ag-Grid to ng-ui Migration Tool

A comprehensive CLI tool for automatically migrating ag-Grid implementations to BigLedger Grid (ng-ui). This tool analyzes your existing ag-Grid usage, generates compatibility reports, and performs automated code transformations with intelligent migration suggestions.

## Features

- 🔍 **Deep Analysis**: Scans TypeScript, HTML, and CSS files for ag-Grid usage
- 📊 **Compatibility Report**: Generates detailed HTML reports with compatibility scores
- 🔄 **Automated Migration**: Transforms imports, components, configurations, and styles
- 🛡️ **Safe Migration**: Creates backups and supports rollback functionality
- 🧪 **Dry Run Mode**: Preview changes before applying them
- 🧙 **Interactive Wizard**: Step-by-step guided migration process
- ✅ **Validation**: Verifies migrated code compiles and works correctly

## Installation

### Global Installation
```bash
npm install -g ng-ui-migrate-ag-grid
```

### Local Development
```bash
cd tools/ag-grid-migration
npm install
npm run build
```

## Usage

### Quick Start

```bash
# Analyze your project
ng-ui-migrate-ag-grid analyze --path ./my-angular-project

# Run migration wizard (recommended for first-time users)
ng-ui-migrate-ag-grid wizard --path ./my-angular-project

# Perform automated migration
ng-ui-migrate-ag-grid migrate --path ./my-angular-project --backup
```

### Commands

#### `analyze`
Analyze project for ag-Grid usage and generate compatibility report.

```bash
ng-ui-migrate-ag-grid analyze [options]

Options:
  -p, --path <path>     Project path to analyze (default: current directory)
  -r, --report <path>   Output path for analysis report
  --json               Output report in JSON format
```

**Example:**
```bash
# Generate HTML report
ng-ui-migrate-ag-grid analyze --path ./src --report ./migration-report.html

# Generate JSON report for CI/CD integration
ng-ui-migrate-ag-grid analyze --path ./src --report ./report.json --json
```

#### `migrate`
Perform automatic migration from ag-Grid to ng-ui.

```bash
ng-ui-migrate-ag-grid migrate [options]

Options:
  -p, --path <path>    Project path to migrate (default: current directory)
  --dry-run           Preview changes without applying them
  --backup            Create backup before migration (default: true)
  --interactive       Run in interactive mode
  --force             Force migration without confirmation
```

**Examples:**
```bash
# Safe migration with backup
ng-ui-migrate-ag-grid migrate --path ./src --backup

# Preview changes without applying
ng-ui-migrate-ag-grid migrate --path ./src --dry-run

# Interactive migration
ng-ui-migrate-ag-grid migrate --path ./src --interactive
```

#### `validate`
Validate migrated code for compilation and compatibility.

```bash
ng-ui-migrate-ag-grid validate [options]

Options:
  -p, --path <path>    Project path to validate (default: current directory)
```

#### `rollback`
Rollback migration using backup.

```bash
ng-ui-migrate-ag-grid rollback [options]

Options:
  -p, --path <path>      Project path to rollback (default: current directory)
  -b, --backup <path>    Backup path to restore from
```

#### `wizard`
Run interactive migration wizard.

```bash
ng-ui-migrate-ag-grid wizard [options]

Options:
  -p, --path <path>    Project path (default: current directory)
```

## Migration Coverage

### ✅ Fully Supported Features

| ag-Grid Feature | ng-ui Equivalent | Auto Migration |
|----------------|------------------|----------------|
| Basic Data Binding | `[data]` | ✅ |
| Column Definitions | `[columns]` | ✅ |
| Sorting | `sortable` | ✅ |
| Filtering | `filterable` | ✅ |
| Pagination | `paginated` | ✅ |
| Row Selection | `rowSelection` | ✅ |
| Cell Editing | `cellEditor` | ✅ |
| Custom Cell Renderers | `cellRenderer` | ✅ |
| Export (CSV/Excel) | Export Service | ✅ |
| Column Resizing | `resizable` | ✅ |
| Event Handling | Event bindings | ✅ |
| CSS Theming | ng-ui themes | ✅ |

### ⚠️ Partially Supported Features

| ag-Grid Feature | ng-ui Status | Migration Notes |
|----------------|--------------|-----------------|
| Row Grouping | Basic grouping | Advanced grouping requires manual setup |
| Custom Filters | Supported | Filter interface may need adjustments |
| Context Menu | Basic support | Advanced menu features need custom implementation |
| Tooltips | Supported | Custom tooltip components may need updates |
| Virtual Scrolling | Automatic | Performance optimization may vary |

### ❌ Unsupported Features (Enterprise)

| ag-Grid Feature | Alternative Solution |
|----------------|---------------------|
| Range Selection | Custom selection logic or third-party library |
| Integrated Charts | Chart.js, D3.js, or other charting libraries |
| Master-Detail | Nested component architecture |
| Tree Data | ng-ui tree components |
| Pivot Mode | Dedicated pivot table libraries |
| Status Bar | Custom status component |
| Side Bar | Custom sidebar implementation |
| Tool Panel | Custom tool panel component |

## Migration Example

### Before (ag-Grid)
```typescript
// app.component.ts
import { Component } from '@angular/core';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-root',
  template: `
    <ag-grid-angular
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [gridOptions]="gridOptions"
      (gridReady)="onGridReady($event)"
      (selectionChanged)="onSelectionChanged()">
    </ag-grid-angular>
  `
})
export class AppComponent {
  rowData = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Jane', age: 25, city: 'London' }
  ];

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'age', headerName: 'Age', filter: 'agNumberColumnFilter' },
    { field: 'city', headerName: 'City', resizable: true }
  ];

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 10,
    rowSelection: 'multiple'
  };

  onGridReady(event: GridReadyEvent) {
    event.api.sizeColumnsToFit();
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected:', selectedRows);
  }
}
```

### After (ng-ui) - Automatically Generated
```typescript
// app.component.ts
import { Component } from '@angular/core';
import { NgUiColumnDefinition, NgUiGridConfig, NgUiGridReadyEvent } from '@ng-ui/grid';

@Component({
  selector: 'app-root',
  template: `
    <ngui-grid
      class="ngui-theme-alpine"
      [data]="rowData"
      [columns]="columnDefs"
      [config]="gridConfig"
      (gridReady)="onGridReady($event)"
      (selectionChanged)="onSelectionChanged()">
    </ngui-grid>
  `
})
export class AppComponent {
  rowData = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Jane', age: 25, city: 'London' }
  ];

  columnDefs: NgUiColumnDefinition[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'age', header: 'Age', filterType: 'number' },
    { field: 'city', header: 'City', resizable: true }
  ];

  gridConfig: NgUiGridConfig = {
    paginated: true,
    pageSize: 10,
    rowSelection: 'multi'
  };

  onGridReady(event: NgUiGridReadyEvent) {
    event.api.sizeColumnsToFit();
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected:', selectedRows);
  }
}
```

## Migration Reports

The tool generates detailed HTML reports showing:

- **Compatibility Score**: Overall migration success rate (0-100%)
- **Feature Analysis**: Breakdown of supported, partial, and unsupported features
- **File-by-File Results**: Detailed analysis of each file
- **Manual Changes Required**: List of items needing manual intervention
- **Effort Estimation**: Time and complexity estimates

### Sample Report Output
```
📊 ag-Grid to ng-ui Migration Analysis

Overall Compatibility Score: 85%

📁 File Analysis:
  Total files scanned: 45
  Files using ag-Grid: 12

🔧 Feature Compatibility:
  ✓ Fully supported: 18
  ⚠ Partially supported: 5
  ✗ Unsupported: 3

⏱ Estimated Migration Effort:
  Automatic: 75%
  Manual: 25%
  Time estimate: 4-8 hours
  Complexity: medium
```

## Configuration

### Custom Mappings
You can extend the migration tool with custom mappings:

```typescript
// custom-mappings.ts
import { MigrationRunner } from 'ng-ui-migrate-ag-grid';

const runner = new MigrationRunner();

// Add custom import mapping
runner.importTransformer.addCustomMapping(
  'my-custom-ag-grid-module',
  '@my-company/custom-grid'
);

// Add custom component mapping
runner.componentTransformer.addCustomAttributeMapping(
  '[myCustomProperty]',
  '[customProp]'
);
```

### Migration Options
Create a `migration.config.js` file for project-specific settings:

```javascript
module.exports = {
  // Skip certain files or directories
  ignore: [
    '**/legacy/**',
    '**/deprecated/**'
  ],
  
  // Custom transformation rules
  customRules: {
    // Preserve certain ag-Grid features
    preserveFeatures: ['contextMenu', 'customTooltips'],
    
    // Override default mappings
    overrideMappings: {
      'AgGridAngular': 'CustomGridComponent'
    }
  },
  
  // Validation settings
  validation: {
    skipTypeScriptCheck: false,
    skipBuildCheck: true,
    skipDependencyCheck: false
  }
};
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: ag-Grid Migration Check
on: [pull_request]

jobs:
  migration-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install migration tool
        run: npm install -g ng-ui-migrate-ag-grid
      
      - name: Run migration analysis
        run: ng-ui-migrate-ag-grid analyze --json --report ./migration-report.json
      
      - name: Upload migration report
        uses: actions/upload-artifact@v3
        with:
          name: migration-report
          path: ./migration-report.json
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Migration Analysis') {
            steps {
                sh 'npx ng-ui-migrate-ag-grid analyze --json --report migration-report.json'
                archiveArtifacts artifacts: 'migration-report.json'
                
                script {
                    def report = readJSON file: 'migration-report.json'
                    if (report.overallScore < 80) {
                        unstable('Migration compatibility below threshold')
                    }
                }
            }
        }
    }
}
```

## Troubleshooting

### Common Issues

**Issue**: "TypeScript compilation failed"
```bash
# Solution: Fix TypeScript errors before migration
ng-ui-migrate-ag-grid validate --path ./src
```

**Issue**: "Import resolution errors"
```bash
# Solution: Install ng-ui dependencies
npm install @ng-ui/grid @ng-ui/core @ng-ui/theme
```

**Issue**: "Template binding errors"
```bash
# Solution: Run migration in interactive mode
ng-ui-migrate-ag-grid migrate --interactive --path ./src
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=ng-ui-migrate-ag-grid:* ng-ui-migrate-ag-grid migrate --path ./src
```

### Manual Migration Steps

For features that cannot be automatically migrated:

1. **Enterprise Features**: Review the [ng-ui documentation](https://ng-ui.dev) for alternative implementations
2. **Custom Components**: Update component interfaces to match ng-ui patterns
3. **Complex Configurations**: Use the interactive wizard for guided setup
4. **Performance Optimization**: Review virtual scrolling and lazy loading settings

## Development

### Building from Source
```bash
git clone <repository-url>
cd tools/ag-grid-migration
npm install
npm run build
npm test
```

### Running Tests
```bash
# Unit tests
npm test

# Test with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

- 📖 [Documentation](https://ng-ui.dev/migration)
- 🐛 [Issues](https://github.com/ng-ui/migration-tool/issues)
- 💬 [Discussions](https://github.com/ng-ui/migration-tool/discussions)
- 📧 [Email Support](mailto:support@ng-ui.dev)

## License

MIT License - see [LICENSE](LICENSE) file for details.