import { test, expect, Page } from '@playwright/test';

/**
 * Screenshot Capture Test Suite
 * 
 * This test suite is designed to capture comprehensive screenshots of the BigLedger Grid
 * in various states and configurations for documentation purposes.
 * 
 * Screenshots are saved to docs/images/ directory and can be referenced
 * in documentation files.
 */

test.describe('BigLedger Grid Documentation Screenshots', () => {
  
  // Configure test behavior
  test.beforeEach(async ({ page }) => {
    // Navigate to the grid demo page
    await page.goto('/grid-demo');
    
    // Wait for grid to be fully loaded
    await page.waitForSelector('blg-grid', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    
    // Allow time for any animations to complete
    await page.waitForTimeout(500);
  });

  test('Basic Grid Layout', async ({ page }) => {
    // Capture the basic grid with default configuration
    await page.screenshot({
      path: 'docs/images/basic-grid-layout.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 600
      }
    });
  });

  test('Grid with Data Loaded', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('.blg-grid-row', { state: 'visible' });
    
    // Ensure we have multiple rows visible
    const rowCount = await page.locator('.blg-grid-row').count();
    expect(rowCount).toBeGreaterThan(5);
    
    // Capture grid with data
    await page.screenshot({
      path: 'docs/images/grid-with-data.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 500
      }
    });
  });

  test('Column Headers and Sorting', async ({ page }) => {
    // Focus on the header area
    const headerElement = page.locator('.blg-grid-header');
    await expect(headerElement).toBeVisible();
    
    // Capture column headers
    await headerElement.screenshot({
      path: 'docs/images/column-headers.png'
    });
    
    // Click on a column header to show sort indicator
    await page.click('[data-column="name"]');
    await page.waitForTimeout(200);
    
    // Capture with sort indicator
    await headerElement.screenshot({
      path: 'docs/images/column-headers-sorted.png'
    });
  });

  test('Sorting in Action', async ({ page }) => {
    // Click on a sortable column
    await page.click('[data-column="name"]');
    
    // Wait for sort to complete
    await page.waitForTimeout(300);
    
    // Verify sort indicator is visible
    await expect(page.locator('[data-column="name"] .sort-indicator')).toBeVisible();
    
    // Capture the sorted grid
    await page.screenshot({
      path: 'docs/images/grid-sorted-ascending.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 500
      }
    });
    
    // Click again for descending sort
    await page.click('[data-column="name"]');
    await page.waitForTimeout(300);
    
    // Capture descending sort
    await page.screenshot({
      path: 'docs/images/grid-sorted-descending.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 500
      }
    });
  });

  test('Filtering UI', async ({ page }) => {
    // Look for filter trigger buttons
    const filterTrigger = page.locator('[data-column="name"] .filter-trigger').first();
    
    if (await filterTrigger.isVisible()) {
      // Click to open filter
      await filterTrigger.click();
      await page.waitForTimeout(300);
      
      // Capture filter UI
      await page.screenshot({
        path: 'docs/images/filter-dropdown-open.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 400
        }
      });
      
      // Enter filter text
      const filterInput = page.locator('.filter-input').first();
      if (await filterInput.isVisible()) {
        await filterInput.fill('John');
        await page.waitForTimeout(200);
        
        // Capture with filter applied
        await page.screenshot({
          path: 'docs/images/grid-filtered.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 500
          }
        });
      }
    } else {
      // If no filter UI, capture a placeholder
      await page.screenshot({
        path: 'docs/images/filter-placeholder.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 100
        }
      });
    }
  });

  test('Row Selection', async ({ page }) => {
    // Click on first row to select it
    const firstRow = page.locator('.blg-grid-row').first();
    await firstRow.click();
    await page.waitForTimeout(200);
    
    // Capture single row selection
    await page.screenshot({
      path: 'docs/images/single-row-selection.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 400
      }
    });
    
    // Select multiple rows with Ctrl+click
    const secondRow = page.locator('.blg-grid-row').nth(1);
    await secondRow.click({ modifiers: ['Meta'] }); // Use Meta for Mac, Ctrl for others
    await page.waitForTimeout(200);
    
    const thirdRow = page.locator('.blg-grid-row').nth(2);
    await thirdRow.click({ modifiers: ['Meta'] });
    await page.waitForTimeout(200);
    
    // Capture multiple row selection
    await page.screenshot({
      path: 'docs/images/multiple-row-selection.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 400
      }
    });
  });

  test('Cell Editing', async ({ page }) => {
    // Look for editable cells
    const firstCell = page.locator('.blg-grid-cell').first();
    
    // Double-click to enter edit mode
    await firstCell.dblclick();
    await page.waitForTimeout(300);
    
    // Check if edit mode is active
    const editInput = page.locator('.cell-editor input, .cell-editor textarea, .cell-editor select').first();
    
    if (await editInput.isVisible()) {
      // Capture cell editing mode
      await page.screenshot({
        path: 'docs/images/cell-editing.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 300
        }
      });
      
      // Enter some text
      await editInput.fill('New Value');
      await page.waitForTimeout(200);
      
      // Capture with edited value
      await page.screenshot({
        path: 'docs/images/cell-editing-with-value.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 300
        }
      });
      
      // Press Enter to save
      await editInput.press('Enter');
      await page.waitForTimeout(300);
    } else {
      // Capture placeholder if no edit mode available
      await page.screenshot({
        path: 'docs/images/cell-editing-placeholder.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 200
        }
      });
    }
  });

  test('Grouping Feature', async ({ page }) => {
    // Look for grouping controls
    const groupingButton = page.locator('[data-test="group-toggle"], .group-toggle, .grouping-control').first();
    
    if (await groupingButton.isVisible()) {
      await groupingButton.click();
      await page.waitForTimeout(500);
      
      // Capture grouped view
      await page.screenshot({
        path: 'docs/images/grid-grouped.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 600
        }
      });
      
      // Expand a group if possible
      const groupHeader = page.locator('.group-header, .blg-group-row').first();
      if (await groupHeader.isVisible()) {
        await groupHeader.click();
        await page.waitForTimeout(300);
        
        // Capture expanded group
        await page.screenshot({
          path: 'docs/images/grid-group-expanded.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 600
          }
        });
      }
    } else {
      // Navigate to grouping demo if available
      const groupingNav = page.locator('a[href*="grouping"], button[data-demo="grouping"]').first();
      if (await groupingNav.isVisible()) {
        await groupingNav.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        // Capture grouping demo
        await page.screenshot({
          path: 'docs/images/grid-grouping-demo.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 600
          }
        });
      } else {
        // Capture placeholder
        await page.screenshot({
          path: 'docs/images/grouping-placeholder.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 300
          }
        });
      }
    }
  });

  test('Export Dialog', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('[data-test="export-button"], .export-button, button:has-text("Export")').first();
    
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(500);
      
      // Capture export dialog
      await page.screenshot({
        path: 'docs/images/export-dialog.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 800,
          height: 600
        }
      });
      
      // Close dialog
      const closeButton = page.locator('[data-test="dialog-close"], .dialog-close, button:has-text("Cancel")').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        // Press Escape to close
        await page.keyboard.press('Escape');
      }
    } else {
      // Capture toolbar area as placeholder
      const toolbar = page.locator('.grid-toolbar, .blg-grid-toolbar').first();
      if (await toolbar.isVisible()) {
        await toolbar.screenshot({
          path: 'docs/images/export-placeholder.png'
        });
      } else {
        await page.screenshot({
          path: 'docs/images/export-placeholder.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 100
          }
        });
      }
    }
  });

  test('Pagination', async ({ page }) => {
    // Look for pagination controls
    const paginationContainer = page.locator('.pagination, .blg-pagination, .grid-pagination').first();
    
    if (await paginationContainer.isVisible()) {
      // Capture pagination
      await paginationContainer.screenshot({
        path: 'docs/images/pagination-controls.png'
      });
      
      // Try to navigate to next page
      const nextButton = page.locator('[data-test="next-page"], .next-page, button:has-text("Next")').first();
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        
        // Capture page 2
        await page.screenshot({
          path: 'docs/images/grid-page-2.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 500
          }
        });
      }
    } else {
      // Capture grid footer area as placeholder
      const footer = page.locator('.grid-footer, .blg-grid-footer').first();
      if (await footer.isVisible()) {
        await footer.screenshot({
          path: 'docs/images/pagination-placeholder.png'
        });
      }
    }
  });

  test('Virtual Scrolling', async ({ page }) => {
    // Navigate to virtual scrolling demo if available
    const virtualScrollNav = page.locator('a[href*="virtual"], button[data-demo="virtual"]').first();
    
    if (await virtualScrollNav.isVisible()) {
      await virtualScrollNav.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Capture initial state
      await page.screenshot({
        path: 'docs/images/virtual-scroll-top.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 500
        }
      });
      
      // Scroll down significantly
      const scrollContainer = page.locator('.blg-virtual-viewport, .virtual-scroll-container, .blg-grid-body').first();
      
      if (await scrollContainer.isVisible()) {
        // Scroll to middle
        await scrollContainer.evaluate(el => {
          el.scrollTop = el.scrollHeight / 2;
        });
        await page.waitForTimeout(500);
        
        // Capture middle position
        await page.screenshot({
          path: 'docs/images/virtual-scroll-middle.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 500
          }
        });
      }
    } else {
      // Use current grid and scroll if it has many items
      const scrollContainer = page.locator('.blg-grid-body, .grid-viewport').first();
      
      if (await scrollContainer.isVisible()) {
        await scrollContainer.scroll({ top: 300 });
        await page.waitForTimeout(300);
        
        await page.screenshot({
          path: 'docs/images/virtual-scroll-demo.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 500
          }
        });
      }
    }
  });

  test('Responsive Design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Capture mobile view
    await page.screenshot({
      path: 'docs/images/grid-mobile.png',
      fullPage: false
    });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Capture tablet view
    await page.screenshot({
      path: 'docs/images/grid-tablet.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 768,
        height: 600
      }
    });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
  });

  test('Loading States', async ({ page }) => {
    // Try to trigger loading state
    const refreshButton = page.locator('[data-test="refresh"], .refresh-button, button:has-text("Refresh")').first();
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      // Quickly capture loading state
      await page.waitForTimeout(100);
      
      const loadingIndicator = page.locator('.loading-indicator, .spinner, .loading').first();
      if (await loadingIndicator.isVisible()) {
        await page.screenshot({
          path: 'docs/images/grid-loading-state.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 400
          }
        });
      }
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
    } else {
      // Create a placeholder loading image
      await page.addStyleTag({
        content: `
          .loading-placeholder::before {
            content: "Loading...";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 18px;
            color: #666;
          }
        `
      });
      
      await page.evaluate(() => {
        const grid = document.querySelector('blg-grid');
        if (grid) {
          grid.classList.add('loading-placeholder');
        }
      });
      
      await page.screenshot({
        path: 'docs/images/grid-loading-placeholder.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 400
        }
      });
    }
  });

  test('Error States', async ({ page }) => {
    // Try to trigger an error state (this might not work in all setups)
    try {
      // Simulate network failure if possible
      await page.route('**/api/**', route => route.abort());
      
      const refreshButton = page.locator('[data-test="refresh"], .refresh-button').first();
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
        
        const errorMessage = page.locator('.error-message, .error-state, .alert-error').first();
        if (await errorMessage.isVisible()) {
          await page.screenshot({
            path: 'docs/images/grid-error-state.png',
            fullPage: false,
            clip: {
              x: 0,
              y: 0,
              width: 1200,
              height: 400
            }
          });
        }
      }
    } catch (error) {
      // Create a placeholder error image
      await page.addStyleTag({
        content: `
          .error-placeholder {
            background-color: #fee;
            border: 2px solid #fcc;
            border-radius: 4px;
            padding: 20px;
            text-align: center;
            color: #c33;
          }
          .error-placeholder::before {
            content: "⚠ Error loading data";
            display: block;
            font-size: 16px;
          }
        `
      });
      
      await page.evaluate(() => {
        const grid = document.querySelector('blg-grid');
        if (grid) {
          grid.classList.add('error-placeholder');
        }
      });
      
      await page.screenshot({
        path: 'docs/images/grid-error-placeholder.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 300
        }
      });
    }
  });

  test('Theme Variations', async ({ page }) => {
    // Try to capture different theme variations if theme switcher exists
    const themeSwitcher = page.locator('[data-test="theme-toggle"], .theme-switcher, select[name="theme"]').first();
    
    if (await themeSwitcher.isVisible()) {
      // Capture default theme
      await page.screenshot({
        path: 'docs/images/grid-theme-default.png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 400
        }
      });
      
      // Switch to dark theme if possible
      if (await themeSwitcher.isVisible()) {
        if ((await themeSwitcher.tagName()) === 'SELECT') {
          await themeSwitcher.selectOption('dark');
        } else {
          await themeSwitcher.click();
        }
        
        await page.waitForTimeout(500);
        
        // Capture dark theme
        await page.screenshot({
          path: 'docs/images/grid-theme-dark.png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 400
          }
        });
      }
    }
    
    // Always capture the current state as a theme example
    await page.screenshot({
      path: 'docs/images/grid-theme-example.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 400
      }
    });
  });

  test('Full Grid Overview', async ({ page }) => {
    // Reset viewport to ensure full grid is visible
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(500);
    
    // Capture comprehensive overview
    await page.screenshot({
      path: 'docs/images/grid-complete-overview.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1400,
        height: 800
      }
    });
    
    // Also create a full page screenshot for documentation
    await page.screenshot({
      path: 'docs/images/grid-full-page.png',
      fullPage: true
    });
  });
});

/**
 * Additional utility test for capturing specific UI components
 */
test.describe('Component Screenshots', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/grid-demo');
    await page.waitForSelector('blg-grid', { state: 'visible' });
    await page.waitForLoadState('networkidle');
  });

  test('Individual Components', async ({ page }) => {
    // Grid header only
    const header = page.locator('.blg-grid-header').first();
    if (await header.isVisible()) {
      await header.screenshot({
        path: 'docs/images/component-header.png'
      });
    }
    
    // Grid body only
    const body = page.locator('.blg-grid-body').first();
    if (await body.isVisible()) {
      await body.screenshot({
        path: 'docs/images/component-body.png'
      });
    }
    
    // Grid footer only
    const footer = page.locator('.blg-grid-footer').first();
    if (await footer.isVisible()) {
      await footer.screenshot({
        path: 'docs/images/component-footer.png'
      });
    }
    
    // Toolbar if present
    const toolbar = page.locator('.grid-toolbar, .blg-grid-toolbar').first();
    if (await toolbar.isVisible()) {
      await toolbar.screenshot({
        path: 'docs/images/component-toolbar.png'
      });
    }
  });
});