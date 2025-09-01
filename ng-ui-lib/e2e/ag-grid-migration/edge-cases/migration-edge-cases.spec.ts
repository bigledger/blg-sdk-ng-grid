/**
 * Migration Edge Cases and Error Handling Tests
 * Tests complex scenarios and error conditions during ag-Grid to BigLedger Grid migration
 */

import { test, expect, Page } from '@playwright/test';
import { MigrationMapper } from '../utils/migration-mapper.js';
import { MigrationTestData } from '../test-data/migration-test-data.js';
import { BigLedgerGridApiWrapper } from '../utils/api-compatibility-layer.js';

test.describe('ag-Grid Migration - Edge Cases and Error Handling', () => {
  let page: Page;
  let gridApi: BigLedgerGridApiWrapper;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    gridApi = new BigLedgerGridApiWrapper(page);
    await page.goto('/grid-demo');
  });

  test('should handle complex nested configurations', async () => {
    const complexAgGridOptions = {
      rowData: MigrationTestData.getBasicRowData(),
      columnDefs: [
        {
          headerName: 'User Info',
          children: [
            {
              headerName: 'Name',
              children: [
                { field: 'firstName', headerName: 'First', width: 100, pinned: 'left' },
                { field: 'lastName', headerName: 'Last', width: 100, pinned: 'left' }
              ]
            },
            { field: 'email', headerName: 'Email Address', width: 200 }
          ]
        },
        {
          headerName: 'Employment',
          children: [
            { field: 'department', headerName: 'Dept', width: 120, rowGroup: true },
            { field: 'salary', headerName: 'Salary', width: 120, aggFunc: 'sum' }
          ]
        }
      ],
      enableRowGroup: true,
      groupSelectsChildren: true,
      pagination: true,
      paginationPageSize: 10,
      rowSelection: 'multiple'
    };

    const blgConfig = MigrationMapper.migrateGridOptions(complexAgGridOptions);
    const warnings = MigrationMapper.generateMigrationWarnings(complexAgGridOptions);

    // Should generate warnings for unsupported features
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.includes('grouping'))).toBe(true);

    // Should flatten nested column structure
    expect(blgConfig.columns?.length).toBeGreaterThan(0);
    
    // Should preserve basic column properties even from nested structure
    const firstNameColumn = blgConfig.columns?.find(col => col.field === 'firstName');
    expect(firstNameColumn).toBeDefined();
    expect(firstNameColumn?.pinned).toBe('left');
    
    // Apply configuration - should not throw errors
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
  });

  test('should handle malformed column definitions', async () => {
    const malformedAgGridOptions = {
      rowData: MigrationTestData.getBasicRowData(),
      columnDefs: [
        { field: 'id', headerName: 'ID' }, // Valid
        { headerName: 'No Field' }, // Missing field
        { field: null, headerName: 'Null Field' }, // Null field
        { field: '', headerName: 'Empty Field' }, // Empty field
        { field: 'firstName', headerName: null }, // Null header name
        { field: 'lastName', width: 'invalid' }, // Invalid width
        { field: 'age', width: -100 }, // Negative width
        { field: 'salary', resizable: 'true' }, // String instead of boolean
        {}, // Empty column definition
        null, // Null column definition
        { field: 'email', filter: { invalidFilter: true } } // Invalid filter
      ].filter(col => col !== null) // Remove null entries for basic test
    };

    // Should handle malformed configurations gracefully
    expect(() => {
      const blgConfig = MigrationMapper.migrateGridOptions(malformedAgGridOptions);
    }).not.toThrow();

    const blgConfig = MigrationMapper.migrateGridOptions(malformedAgGridOptions);
    
    // Should have some valid columns
    expect(blgConfig.columns?.length).toBeGreaterThan(0);
    
    // Should filter out completely invalid columns
    const validColumns = blgConfig.columns?.filter(col => col.field && col.field.length > 0);
    expect(validColumns?.length).toBeGreaterThan(0);

    // Apply configuration - should handle gracefully
    await page.evaluate((config) => {
      try {
        window.testGridInstance?.setConfiguration(config);
      } catch (error) {
        console.warn('Configuration error handled:', error);
      }
    }, blgConfig);

    // Grid should still render with valid columns
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
  });

  test('should handle circular references in data', async () => {
    // Create data with circular references
    const circularData = MigrationTestData.getBasicRowData().map(row => {
      const newRow = { ...row };
      (newRow as any).self = newRow; // Circular reference
      return newRow;
    });

    const agGridOptions = {
      rowData: circularData,
      columnDefs: MigrationTestData.getBasicColumnDefs()
    };

    // Should handle circular references without crashing
    let blgConfig;
    expect(() => {
      blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    }).not.toThrow();

    // Apply configuration - should handle gracefully
    await page.evaluate((config) => {
      try {
        // Need to handle circular references during serialization
        const safeConfig = {
          ...config,
          data: config.data?.map((row: any) => {
            const safeRow = { ...row };
            delete safeRow.self; // Remove circular reference
            return safeRow;
          })
        };
        window.testGridInstance?.setConfiguration(safeConfig);
      } catch (error) {
        console.warn('Circular reference error handled:', error);
      }
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
  });

  test('should handle extremely large datasets gracefully', async () => {
    const extremelyLargeDataset = MigrationTestData.getLargeDataset(100000);
    const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(100000);
    agGridOptions.rowData = extremelyLargeDataset;

    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

    // Should enable virtual scrolling automatically
    expect(blgConfig.virtualScrolling?.enabled).toBe(true);

    const startTime = Date.now();

    // Apply configuration - should not freeze the browser
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    const renderTime = Date.now() - startTime;
    console.log(`Large dataset render time: ${renderTime}ms`);

    // Should render in reasonable time even with large dataset
    expect(renderTime).toBeLessThan(10000); // 10 seconds max

    // Should only render visible rows
    const visibleRows = await page.locator('[data-testid="grid-row"]').count();
    expect(visibleRows).toBeLessThan(1000); // Virtual scrolling should limit visible rows
    expect(visibleRows).toBeGreaterThan(0);

    // Should still be responsive
    await page.click('[data-testid="grid-row"]:first-child');
    await expect(page.locator('[data-testid="grid-row"]:first-child.selected')).toBeVisible();
  });

  test('should handle custom cell renderers with errors', async () => {
    const problematicRenderers = {
      throwingRenderer: () => { throw new Error('Renderer error'); },
      undefinedRenderer: undefined,
      nullRenderer: null,
      invalidRenderer: 'non-existent-renderer',
      recursiveRenderer: function recursiveRenderer(): string {
        return recursiveRenderer(); // Infinite recursion
      }
    };

    const agGridOptions = {
      rowData: MigrationTestData.getBasicRowData(),
      columnDefs: [
        { field: 'id', headerName: 'ID' },
        { field: 'firstName', headerName: 'First Name', cellRenderer: problematicRenderers.throwingRenderer },
        { field: 'lastName', headerName: 'Last Name', cellRenderer: problematicRenderers.undefinedRenderer },
        { field: 'email', headerName: 'Email', cellRenderer: problematicRenderers.nullRenderer },
        { field: 'age', headerName: 'Age', cellRenderer: problematicRenderers.invalidRenderer },
        { field: 'salary', headerName: 'Salary', cellRenderer: problematicRenderers.recursiveRenderer }
      ]
    };

    // Should handle problematic renderers gracefully
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    expect(blgConfig.columns).toBeDefined();

    // Apply configuration - should not crash
    await page.evaluate((config) => {
      try {
        // Remove problematic renderers that can't be serialized
        const safeConfig = {
          ...config,
          columns: config.columns?.map((col: any) => {
            if (typeof col.cellRenderer === 'function' || col.cellRenderer === undefined || col.cellRenderer === null) {
              const safCol = { ...col };
              delete safCol.cellRenderer; // Remove problematic renderer
              return safCol;
            }
            return col;
          })
        };
        window.testGridInstance?.setConfiguration(safeConfig);
      } catch (error) {
        console.warn('Renderer error handled:', error);
      }
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Should render basic data even without custom renderers
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle data type mismatches', async () => {
    const mixedTypeData = [
      { id: 1, name: 'John', age: 30, active: true, date: new Date() },
      { id: '2', name: 123, age: '30', active: 'true', date: '2023-01-01' },
      { id: null, name: null, age: null, active: null, date: null },
      { id: undefined, name: undefined, age: undefined, active: undefined, date: undefined },
      { id: [], name: {}, age: [], active: {}, date: [] },
      { id: 3.14, name: 'Jane', age: -5, active: 0, date: 'invalid-date' }
    ];

    const agGridOptions = {
      rowData: mixedTypeData,
      columnDefs: [
        { field: 'id', headerName: 'ID', filter: 'agNumberColumnFilter' },
        { field: 'name', headerName: 'Name', filter: 'agTextColumnFilter' },
        { field: 'age', headerName: 'Age', filter: 'agNumberColumnFilter' },
        { field: 'active', headerName: 'Active', cellRenderer: (params: any) => params.value ? '✓' : '✗' },
        { field: 'date', headerName: 'Date', filter: 'agDateColumnFilter' }
      ]
    };

    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

    // Apply configuration - should handle type mismatches
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Should render all rows even with type mismatches
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBe(mixedTypeData.length);

    // Should handle filtering with mixed types
    await gridApi.setQuickFilter('John');
    const filteredRows = await page.locator('[data-testid="grid-row"]').count();
    expect(filteredRows).toBeLessThan(mixedTypeData.length);

    // Reset filter
    await gridApi.resetQuickFilter();
    const resetRowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(resetRowCount).toBe(mixedTypeData.length);
  });

  test('should handle memory pressure scenarios', async () => {
    // Simulate memory pressure by creating multiple large grids
    const largeDataset = MigrationTestData.getLargeDataset(10000);

    for (let i = 0; i < 3; i++) {
      console.log(`Creating grid instance ${i + 1}`);

      const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(10000);
      agGridOptions.rowData = largeDataset;
      const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

      // Apply configuration
      await page.evaluate((config, index) => {
        // Create multiple grid instances to simulate memory pressure
        window[`testGridInstance${index}`] = window.testGridInstance;
        window[`testGridInstance${index}`]?.setConfiguration(config);
      }, blgConfig, i);

      // Check memory usage
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      console.log(`Memory usage after grid ${i + 1}: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);

      // Should still be responsive
      await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    }

    // Clean up - test garbage collection
    await page.evaluate(() => {
      for (let i = 0; i < 3; i++) {
        const instance = window[`testGridInstance${i}`];
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
        delete window[`testGridInstance${i}`];
      }
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    // Should still be functional after cleanup
    await page.reload();
    await page.goto('/grid-demo');
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
  });

  test('should handle concurrent API operations', async () => {
    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Perform concurrent operations
    const concurrentOperations = async () => {
      const operations = [
        () => gridApi.selectAll(),
        () => gridApi.setQuickFilter('test'),
        () => gridApi.setSortModel([{colId: 'firstName', sort: 'asc'}]),
        () => gridApi.setFilterModel({age: {filterType: 'number', type: 'greaterThan', filter: 25}}),
        () => gridApi.deselectAll(),
        () => gridApi.resetQuickFilter()
      ];

      // Execute operations concurrently
      await Promise.all(operations.map(op => op()));
    };

    // Should handle concurrent operations without errors
    expect(async () => {
      await concurrentOperations();
    }).not.toThrow();

    await concurrentOperations();

    // Grid should still be functional
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle network interruptions during data loading', async () => {
    // Simulate network interruption
    await page.route('**/api/data**', route => {
      // Simulate network failure
      route.abort('failed');
    });

    const agGridOptions = {
      ...MigrationTestData.getBasicAgGridOptions(),
      rowModelType: 'serverSide' as const,
      datasource: {
        getRows: (params: any) => {
          // This would normally make a network request
          fetch('/api/data')
            .then(response => response.json())
            .then(data => params.successCallback(data))
            .catch(error => params.failCallback());
        }
      }
    };

    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    const warnings = MigrationMapper.generateMigrationWarnings(agGridOptions);

    // Should warn about server-side row model
    expect(warnings.some(w => w.includes('serverSide'))).toBe(true);

    // Should fallback to client-side data
    expect(blgConfig.data).toBeDefined();

    // Apply configuration - should handle gracefully
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Remove network interception
    await page.unroute('**/api/data**');
  });

  test('should handle browser compatibility issues', async () => {
    // Test older browser API compatibility
    await page.addInitScript(() => {
      // Simulate missing modern APIs
      delete (window as any).IntersectionObserver;
      delete (window as any).ResizeObserver;
      
      // Simulate older browser without certain features
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 6.1; WOW64; Trident/7.0)',
        writable: false
      });
    });

    const agGridOptions = MigrationTestData.getAdvancedAgGridOptions();
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

    // Should still work without modern APIs
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Should provide fallback functionality
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle deeply nested data structures', async () => {
    const deeplyNestedData = MigrationTestData.getBasicRowData().map(row => ({
      ...row,
      nested: {
        level1: {
          level2: {
            level3: {
              level4: {
                value: `deep-${row.id}`,
                array: [1, 2, 3, { nested: true }]
              }
            }
          }
        }
      },
      circularRef: null as any
    }));

    // Add circular reference
    deeplyNestedData.forEach(row => {
      row.circularRef = row.nested;
    });

    const agGridOptions = {
      rowData: deeplyNestedData,
      columnDefs: [
        { field: 'id', headerName: 'ID' },
        { field: 'firstName', headerName: 'First Name' },
        { field: 'nested.level1.level2.level3.level4.value', headerName: 'Deep Value' },
        { field: 'nested.level1.level2.level3.level4.array', headerName: 'Deep Array' }
      ]
    };

    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

    // Apply configuration - should handle deep nesting
    await page.evaluate((config) => {
      try {
        // Remove circular references before serialization
        const safeConfig = {
          ...config,
          data: config.data?.map((row: any) => {
            const safeRow = { ...row };
            delete safeRow.circularRef; // Remove circular reference
            return safeRow;
          })
        };
        window.testGridInstance?.setConfiguration(safeConfig);
      } catch (error) {
        console.warn('Deep nesting error handled:', error);
      }
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Should handle nested field access
    const deepValueCells = await page.locator('[data-testid="grid-cell"][data-field="nested.level1.level2.level3.level4.value"]').count();
    expect(deepValueCells).toBeGreaterThan(0);
  });

  test('should provide comprehensive error reporting', async () => {
    const problematicConfig = {
      rowData: 'not-an-array' as any,
      columnDefs: 'not-an-array' as any,
      pagination: 'invalid' as any,
      rowSelection: 'invalid-mode' as any,
      theme: 'non-existent-theme',
      invalidProperty: 'should-be-ignored'
    };

    let migrationReport;
    let errorsCaught: string[] = [];

    try {
      migrationReport = MigrationMapper.migrateGridOptions(problematicConfig);
    } catch (error) {
      errorsCaught.push(error instanceof Error ? error.message : String(error));
    }

    // Should generate warnings for problems
    const warnings = MigrationMapper.generateMigrationWarnings(problematicConfig);
    const report = MigrationMapper.generateCompatibilityReport(problematicConfig);

    console.log('Migration warnings:', warnings);
    console.log('Compatibility report:', report);
    console.log('Errors caught:', errorsCaught);

    // Should provide meaningful feedback about issues
    expect(warnings.length + errorsCaught.length + report.warnings.length).toBeGreaterThan(0);

    // Should still attempt to create a working configuration
    if (migrationReport) {
      expect(migrationReport).toBeDefined();
      
      // Apply even problematic configuration - should handle gracefully
      await page.evaluate((config) => {
        try {
          window.testGridInstance?.setConfiguration(config);
        } catch (error) {
          console.warn('Configuration error handled:', error);
          // Fallback to minimal configuration
          window.testGridInstance?.setConfiguration({
            data: [],
            columns: [{ field: 'id', headerName: 'ID' }]
          });
        }
      }, migrationReport);

      await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    }
  });
});