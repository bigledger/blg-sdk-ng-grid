# ag-Grid Migration Tool - Usage Examples

## Quick Start Examples

### 1. Basic Analysis
```bash
# Navigate to your project
cd /path/to/your/angular/project

# Analyze ag-Grid usage
npx ng-ui-migrate-ag-grid analyze

# Generate detailed HTML report
npx ng-ui-migrate-ag-grid analyze --report migration-report.html
```

### 2. Safe Migration with Backup
```bash
# Create backup and migrate
npx ng-ui-migrate-ag-grid migrate --backup

# Preview changes first (recommended)
npx ng-ui-migrate-ag-grid migrate --dry-run
```

### 3. Interactive Migration (Recommended for First Time)
```bash
# Run the wizard for guided migration
npx ng-ui-migrate-ag-grid wizard
```

## Real-World Migration Scenarios

### Scenario 1: Small Angular App with Basic ag-Grid Usage

**Project Structure:**
```
my-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── data-grid/
│   │   │       ├── data-grid.component.ts
│   │   │       ├── data-grid.component.html
│   │   │       └── data-grid.component.scss
│   │   └── app.module.ts
│   └── styles.scss
└── package.json
```

**Step 1: Analysis**
```bash
cd my-app
npx ng-ui-migrate-ag-grid analyze --report ./analysis-report.html
```

**Expected Output:**
```
📊 ag-Grid to ng-ui Migration Analysis

Overall Compatibility Score: 92%

📁 File Analysis:
  Total files scanned: 15
  Files using ag-Grid: 3

🔧 Feature Compatibility:
  ✓ Fully supported: 12
  ⚠ Partially supported: 2
  ✗ Unsupported: 0

⏱ Estimated Migration Effort:
  Automatic: 85%
  Manual: 15%
  Time estimate: 1-2 hours
  Complexity: low
```

**Step 2: Migration**
```bash
# Dry run first
npx ng-ui-migrate-ag-grid migrate --dry-run

# If satisfied with preview, run actual migration
npx ng-ui-migrate-ag-grid migrate --backup
```

### Scenario 2: Enterprise Application with Complex ag-Grid Features

**Project Structure:**
```
enterprise-app/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── reporting/
│   │   │   ├── analytics/
│   │   │   └── administration/
│   │   └── shared/
│   │       └── components/
│   │           ├── advanced-grid/
│   │           └── master-detail-grid/
```

**Step 1: Analysis**
```bash
cd enterprise-app
npx ng-ui-migrate-ag-grid analyze --report ./detailed-analysis.html --json
```

**Expected Analysis Results:**
```json
{
  "overallScore": 67,
  "compatibility": {
    "fullySupported": 15,
    "partiallySupported": 8,
    "unsupported": 5
  },
  "manualChanges": [
    {
      "filePath": "src/app/shared/components/advanced-grid/advanced-grid.component.ts",
      "description": "Enterprise feature 'rangeSelection' detected",
      "priority": "high",
      "suggestion": "Consider alternative implementation or remove feature"
    }
  ]
}
```

**Step 2: Interactive Migration**
```bash
npx ng-ui-migrate-ag-grid wizard
```

**Wizard Flow:**
```
🧙 ag-Grid Migration Wizard

✓ Found ag-Grid usage in 12 files

📊 Compatibility Report:
  - Overall Score: 67%
  - 5 features need manual attention

? Create backup before migration? Yes
? Preview changes without applying them (dry run)? Yes
? Select migration scope: Selective migration (choose files)
? Select files to migrate:
  ✓ src/app/modules/reporting/reports-grid.component.ts (8 items)
  ✓ src/app/modules/analytics/charts-grid.component.ts (12 items)
  ✗ src/app/shared/components/advanced-grid/advanced-grid.component.ts (15 items - has enterprise features)
  ✓ src/app/shared/components/master-detail-grid/master-detail-grid.component.ts (6 items)

? Ready to migrate 3 files. Proceed? Yes
```

### Scenario 3: Legacy Application with Mixed ag-Grid Versions

**Challenge:** App uses both community and enterprise features across different modules.

**Solution:**
```bash
# Step 1: Comprehensive analysis
npx ng-ui-migrate-ag-grid analyze --path ./src --report ./legacy-analysis.html

# Step 2: Module-by-module migration
# Start with modules using only community features
npx ng-ui-migrate-ag-grid migrate --path ./src/app/modules/basic-reporting --backup

# Validate each module after migration
npx ng-ui-migrate-ag-grid validate --path ./src/app/modules/basic-reporting

# Continue with more complex modules
npx ng-ui-migrate-ag-grid wizard --path ./src/app/modules/advanced-analytics
```

## Sample Code Transformations

### Before Migration: ag-Grid Component
```typescript
// data-grid.component.ts
import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-data-grid',
  template: `
    <ag-grid-angular
      #agGrid
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [gridOptions]="gridOptions"
      [pagination]="true"
      [paginationPageSize]="10"
      [enableSorting]="true"
      [enableFiltering]="true"
      [rowSelection]="'multiple'"
      (gridReady)="onGridReady($event)"
      (selectionChanged)="onSelectionChanged()"
      (rowClicked)="onRowClicked($event)">
    </ag-grid-angular>
  `,
  styles: [`
    .ag-theme-alpine {
      height: 400px;
      width: 100%;
    }
  `]
})
export class DataGridComponent implements OnInit {
  rowData = [];
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', filter: 'agTextColumnFilter' },
    { field: 'age', headerName: 'Age', filter: 'agNumberColumnFilter' }
  ];

  gridOptions: GridOptions = {
    suppressRowClickSelection: true,
    animateRows: true
  };

  private gridApi: any;

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }

  onRowClicked(event: any) {
    console.log('Row clicked:', event.data);
  }
}
```

### After Migration: ng-ui Component
```typescript
// data-grid.component.ts
import { Component, OnInit } from '@angular/core';
import { NgUiGridComponent } from '@ng-ui/grid';
import { NgUiColumnDefinition, NgUiGridConfig, NgUiGridReadyEvent } from '@ng-ui/core';

@Component({
  selector: 'app-data-grid',
  template: `
    <ngui-grid
      #nguiGrid
      class="ngui-theme-alpine"
      [data]="rowData"
      [columns]="columnDefs"
      [config]="gridConfig"
      [paginated]="true"
      [pageSize]="10"
      [sortable]="true"
      [filterable]="true"
      [rowSelection]="'multi'"
      (gridReady)="onGridReady($event)"
      (selectionChanged)="onSelectionChanged()"
      (rowClicked)="onRowClicked($event)">
    </ngui-grid>
  `,
  styles: [`
    .ngui-theme-alpine {
      height: 400px;
      width: 100%;
    }
  `]
})
export class DataGridComponent implements OnInit {
  rowData = [];
  columnDefs: NgUiColumnDefinition[] = [
    { field: 'id', header: 'ID', width: 80 },
    { field: 'name', header: 'Name', sortable: true, filterable: true },
    { field: 'email', header: 'Email', filterType: 'text' },
    { field: 'age', header: 'Age', filterType: 'number' }
  ];

  gridConfig: NgUiGridConfig = {
    disableRowClickSelection: true,
    animateRows: true
  };

  private gridApi: any;

  onGridReady(params: NgUiGridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }

  onRowClicked(event: any) {
    console.log('Row clicked:', event.data);
  }
}
```

## Post-Migration Steps

### 1. Update Package.json
```bash
# Remove ag-Grid dependencies
npm uninstall ag-grid-angular ag-grid-community ag-grid-enterprise

# Install ng-ui dependencies
npm install @ng-ui/grid @ng-ui/core @ng-ui/theme
```

### 2. Update Angular Module
```typescript
// app.module.ts - Before
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  imports: [
    AgGridModule.withComponents([])
  ]
})

// app.module.ts - After
import { NgUiGridModule } from '@ng-ui/grid';

@NgModule({
  imports: [
    NgUiGridModule
  ]
})
```

### 3. Validation
```bash
# Validate the migration
npx ng-ui-migrate-ag-grid validate

# Test the application
npm run build
npm run test
```

### 4. Manual Review Checklist

- [ ] Check all enterprise features are properly handled
- [ ] Verify custom cell renderers work correctly
- [ ] Test all event handlers
- [ ] Validate filtering and sorting functionality
- [ ] Ensure pagination works as expected
- [ ] Test export functionality
- [ ] Review CSS styling and themes
- [ ] Test responsive behavior
- [ ] Validate accessibility features
- [ ] Run performance tests

## Troubleshooting Common Issues

### Issue 1: Missing Dependencies
```bash
# Error: Cannot resolve '@ng-ui/grid'
# Solution:
npm install @ng-ui/grid @ng-ui/core @ng-ui/theme
```

### Issue 2: Compilation Errors After Migration
```bash
# Check for unmigrated imports
npx ng-ui-migrate-ag-grid validate --path ./src

# Common fixes:
# 1. Update remaining ag-Grid type references
# 2. Fix template binding syntax
# 3. Update event handler signatures
```

### Issue 3: Styling Issues
```scss
// Replace ag-Grid CSS variables
:root {
  // Before
  --ag-background-color: #ffffff;
  --ag-header-background-color: #f5f5f5;
  
  // After
  --ngui-background-color: #ffffff;
  --ngui-header-background-color: #f5f5f5;
}
```

### Issue 4: Feature Not Working After Migration
1. Check the compatibility report for partially supported features
2. Review the ng-ui documentation for equivalent functionality
3. Consider custom implementation for enterprise features
4. Use the interactive wizard for complex migrations

## Best Practices

1. **Always run analysis first** to understand the migration scope
2. **Create backups** before any migration
3. **Use dry-run mode** to preview changes
4. **Migrate incrementally** - start with simple components
5. **Test thoroughly** after each migration step
6. **Review manual changes** carefully before implementation
7. **Update tests** to work with ng-ui APIs
8. **Document any custom implementations** needed for enterprise features

## Getting Help

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/ng-ui/issues)
- 💬 [Community Support](https://github.com/ng-ui/discussions)
- 📧 Email: support@ng-ui.dev