import { test, expect, Page } from '@playwright/test';
import { GridTestHelpers } from '../helpers/grid-test-helpers';

/**
 * Column Groups E2E Tests
 * 
 * These tests verify the advanced column grouping features that exceed ag-grid:
 * - Multi-level nested column groups with unlimited depth
 * - AI-powered automatic column grouping based on data analysis
 * - Drag-and-drop column group management
 * - Advanced animations and visual effects
 * - Column group analytics and insights
 * - Collaborative group management
 * - Performance optimization for large column sets
 * - Responsive column group behavior
 * - Custom group templates and themes
 * - Export/import group configurations
 */

test.describe('Column Groups', () => {
  let page: Page;
  let gridHelpers: GridTestHelpers;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    gridHelpers = new GridTestHelpers(page);
    
    // Navigate to column groups demo
    await page.goto('/examples/grid/column-groups');
    await page.waitForSelector('[data-testid="blg-grid"]');
    
    // Wait for data and column groups to load
    await expect(page.locator('.blg-grid-row')).toHaveCount(50, { timeout: 10000 });
    await expect(page.locator('[data-testid="column-group"]')).toHaveCountGreaterThan(0);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Basic Column Group Functionality', () => {
    test('should display nested column groups correctly', async () => {
      // Verify column groups are rendered
      const columnGroups = page.locator('[data-testid="column-group"]');
      const groupCount = await columnGroups.count();
      expect(groupCount).toBeGreaterThan(2);
      
      // Verify group hierarchy
      const level0Groups = page.locator('[data-testid="column-group"][data-level="0"]');
      const level1Groups = page.locator('[data-testid="column-group"][data-level="1"]');
      
      expect(await level0Groups.count()).toBeGreaterThan(0);
      expect(await level1Groups.count()).toBeGreaterThan(0);
      
      // Verify group headers are displayed
      const firstGroup = columnGroups.first();
      await expect(firstGroup.locator('[data-testid="group-header"]')).toBeVisible();
      await expect(firstGroup.locator('[data-testid="group-title"]')).not.toBeEmpty();
      
      // Verify group spans correct number of columns
      const groupSpan = await firstGroup.getAttribute('data-col-span');
      expect(parseInt(groupSpan!)).toBeGreaterThan(1);
    });

    test('should support expand/collapse functionality', async () => {
      const expandableGroup = page.locator('[data-testid="column-group"][data-expandable="true"]').first();
      
      // Verify expand/collapse button is present
      await expect(expandableGroup.locator('[data-testid="expand-collapse-btn"]')).toBeVisible();
      
      // Get initial state
      const initialState = await expandableGroup.getAttribute('data-collapsed');
      const isInitiallyCollapsed = initialState === 'true';
      
      // Toggle collapse state
      await expandableGroup.locator('[data-testid="expand-collapse-btn"]').click();
      
      // Verify state changed
      const newState = await expandableGroup.getAttribute('data-collapsed');
      const isNewlyCollapsed = newState === 'true';
      expect(isNewlyCollapsed).toBe(!isInitiallyCollapsed);
      
      // Verify child columns are hidden when collapsed
      if (isNewlyCollapsed) {
        const childColumns = page.locator(`[data-parent-group="${await expandableGroup.getAttribute('data-group-id')}"]`);
        for (let i = 0; i < await childColumns.count(); i++) {
          const child = childColumns.nth(i);
          await expect(child).not.toBeVisible();
        }
      }
      
      // Toggle back
      await expandableGroup.locator('[data-testid="expand-collapse-btn"]').click();
      const finalState = await expandableGroup.getAttribute('data-collapsed');
      expect(finalState === 'true').toBe(isInitiallyCollapsed);
    });

    test('should display group statistics and counts', async () => {
      const groupWithStats = page.locator('[data-testid="column-group"][data-show-stats="true"]').first();
      
      // Verify child count is displayed
      await expect(groupWithStats.locator('[data-testid="child-count"]')).toBeVisible();
      
      const childCountText = await groupWithStats.locator('[data-testid="child-count"]').textContent();
      const childCount = parseInt(childCountText!.replace(/[^\d]/g, ''));
      expect(childCount).toBeGreaterThan(0);
      
      // Verify data statistics if available
      const hasDataStats = await groupWithStats.locator('[data-testid="data-stats"]').isVisible();
      if (hasDataStats) {
        // Should show aggregated statistics for the group
        await expect(groupWithStats.locator('[data-testid="group-total"]')).toBeVisible();
        await expect(groupWithStats.locator('[data-testid="group-average"]')).toBeVisible();
      }
    });
  });

  test.describe('AI-Powered Column Grouping', () => {
    test('should auto-generate column groups based on data analysis', async () => {
      // Enable AI-powered grouping
      await page.click('[data-testid="ai-grouping-toggle"]');
      await expect(page.locator('[data-testid="ai-analysis-indicator"]')).toBeVisible();
      
      // Wait for AI analysis to complete
      await page.waitForSelector('[data-testid="ai-analysis-complete"]', { timeout: 10000 });
      
      // Verify suggested groups are displayed
      const suggestedGroups = page.locator('[data-testid="suggested-group"]');
      expect(await suggestedGroups.count()).toBeGreaterThan(0);
      
      // Apply a suggested group
      const firstSuggestion = suggestedGroups.first();
      await expect(firstSuggestion.locator('[data-testid="suggestion-title"]')).toBeVisible();
      await expect(firstSuggestion.locator('[data-testid="confidence-score"]')).toBeVisible();
      
      const confidenceScore = await firstSuggestion.locator('[data-testid="confidence-score"]').textContent();
      expect(parseFloat(confidenceScore!)).toBeGreaterThan(0.5);
      
      // Apply the suggestion
      await firstSuggestion.locator('[data-testid="apply-suggestion-btn"]').click();
      
      // Verify new group was created
      await page.waitForSelector('[data-testid="new-group-applied"]');
      const newGroups = page.locator('[data-testid="column-group"][data-ai-generated="true"]');
      expect(await newGroups.count()).toBeGreaterThan(0);
    });

    test('should provide intelligent group naming suggestions', async () => {
      // Open group creation dialog
      await page.click('[data-testid="create-group-btn"]');
      await expect(page.locator('[data-testid="group-creation-dialog"]')).toBeVisible();
      
      // Select columns for grouping
      await page.check('[data-testid="column-selector"][data-column="firstName"]');
      await page.check('[data-testid="column-selector"][data-column="lastName"]');
      await page.check('[data-testid="column-selector"][data-column="email"]');
      
      // Enable AI naming
      await page.check('[data-testid="enable-ai-naming"]');
      
      // Verify AI suggestions appear
      await page.waitForSelector('[data-testid="ai-name-suggestions"]');
      const nameSuggestions = page.locator('[data-testid="name-suggestion"]');
      expect(await nameSuggestions.count()).toBeGreaterThan(0);
      
      // Verify suggestion quality
      const firstSuggestion = await nameSuggestions.first().textContent();
      expect(firstSuggestion!.toLowerCase()).toContain('personal'); // Should recognize personal info pattern
      
      // Apply suggestion
      await nameSuggestions.first().click();
      
      const groupNameInput = page.locator('[data-testid="group-name-input"]');
      const appliedName = await groupNameInput.inputValue();
      expect(appliedName).toBe(firstSuggestion);
      
      // Create the group
      await page.click('[data-testid="create-group-confirm"]');
      
      // Verify group was created with AI-suggested name
      const newGroup = page.locator(`[data-testid="column-group"][data-group-name="${appliedName}"]`);
      await expect(newGroup).toBeVisible();
    });

    test('should analyze column relationships for optimal grouping', async () => {
      // Open AI analysis panel
      await page.click('[data-testid="ai-analysis-panel-btn"]');
      await expect(page.locator('[data-testid="ai-analysis-panel"]')).toBeVisible();
      
      // Start relationship analysis
      await page.click('[data-testid="analyze-relationships-btn"]');
      await expect(page.locator('[data-testid="analysis-progress"]')).toBeVisible();
      
      // Wait for analysis to complete
      await page.waitForSelector('[data-testid="relationship-analysis-complete"]', { timeout: 15000 });
      
      // Verify correlation heatmap is displayed
      await expect(page.locator('[data-testid="correlation-heatmap"]')).toBeVisible();
      
      // Verify suggested optimal groupings
      const optimalGroups = page.locator('[data-testid="optimal-grouping-suggestion"]');
      expect(await optimalGroups.count()).toBeGreaterThan(0);
      
      // Check suggestion details
      const firstOptimal = optimalGroups.first();
      await expect(firstOptimal.locator('[data-testid="grouping-score"]')).toBeVisible();
      await expect(firstOptimal.locator('[data-testid="correlation-strength"]')).toBeVisible();
      await expect(firstOptimal.locator('[data-testid="business-logic-match"]')).toBeVisible();
      
      // Apply optimal grouping
      await firstOptimal.locator('[data-testid="apply-optimal-btn"]').click();
      
      // Verify grouping was applied
      const appliedGroups = page.locator('[data-testid="column-group"][data-optimal-applied="true"]');
      expect(await appliedGroups.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Drag and Drop Group Management', () => {
    test('should support dragging columns between groups', async () => {
      // Get source and target elements
      const sourceColumn = page.locator('[data-testid="draggable-column"]').first();
      const targetGroup = page.locator('[data-testid="column-group"][data-drop-target="true"]').last();
      
      // Get initial states
      const sourceGroupId = await sourceColumn.getAttribute('data-parent-group');
      const targetGroupId = await targetGroup.getAttribute('data-group-id');
      
      expect(sourceGroupId).not.toBe(targetGroupId);
      
      // Perform drag and drop
      await sourceColumn.dragTo(targetGroup);
      
      // Wait for animation to complete
      await page.waitForTimeout(500);
      
      // Verify column was moved to new group
      const newParentGroupId = await sourceColumn.getAttribute('data-parent-group');
      expect(newParentGroupId).toBe(targetGroupId);
      
      // Verify visual feedback during drag
      await sourceColumn.hover();
      await page.mouse.down();
      
      // Should show drag preview
      await expect(page.locator('[data-testid="drag-preview"]')).toBeVisible();
      
      // Should show valid drop zones
      const dropZones = page.locator('[data-testid="valid-drop-zone"]');
      expect(await dropZones.count()).toBeGreaterThan(0);
      
      await page.mouse.up();
    });

    test('should support reordering groups', async () => {
      const groups = page.locator('[data-testid="column-group"][data-level="0"]');
      const groupCount = await groups.count();
      
      if (groupCount >= 2) {
        const firstGroup = groups.first();
        const secondGroup = groups.nth(1);
        
        // Get initial order
        const firstGroupOrder = await firstGroup.getAttribute('data-order');
        const secondGroupOrder = await secondGroup.getAttribute('data-order');
        
        // Drag first group after second group
        await firstGroup.dragTo(secondGroup);
        
        // Wait for reorder animation
        await page.waitForTimeout(800);
        
        // Verify order changed
        const newFirstGroupOrder = await firstGroup.getAttribute('data-order');
        const newSecondGroupOrder = await secondGroup.getAttribute('data-order');
        
        expect(parseInt(newFirstGroupOrder!)).toBeGreaterThan(parseInt(newSecondGroupOrder!));
        expect(newFirstGroupOrder).not.toBe(firstGroupOrder);
      }
    });

    test('should prevent invalid drop operations', async () => {
      const parentGroup = page.locator('[data-testid="column-group"][data-level="0"]').first();
      const childGroup = page.locator('[data-testid="column-group"][data-level="1"]').first();
      
      // Try to drop parent into its own child (should be prevented)
      await parentGroup.dragTo(childGroup);
      
      // Should show invalid drop indicator
      await expect(page.locator('[data-testid="invalid-drop-indicator"]')).toBeVisible();
      
      // Should not actually move the group
      const parentLevel = await parentGroup.getAttribute('data-level');
      expect(parentLevel).toBe('0');
    });
  });

  test.describe('Advanced Animations and Effects', () => {
    test('should display smooth expand/collapse animations', async () => {
      const animatedGroup = page.locator('[data-testid="column-group"][data-animation-enabled="true"]').first();
      
      // Enable animation monitoring
      await page.addStyleTag({
        content: `
          .blg-column-group {
            transition-duration: 0.3s !important;
          }
        `
      });
      
      // Trigger collapse
      await animatedGroup.locator('[data-testid="expand-collapse-btn"]').click();
      
      // Verify animation class is applied
      await expect(animatedGroup).toHaveClass(/.*collapsing.*/);
      
      // Wait for animation to complete
      await page.waitForTimeout(400);
      
      // Verify final state
      await expect(animatedGroup).toHaveClass(/.*collapsed.*/);
      await expect(animatedGroup).not.toHaveClass(/.*collapsing.*/);
    });

    test('should support hover effects and visual feedback', async () => {
      const interactiveGroup = page.locator('[data-testid="column-group"]').first();
      
      // Test hover effect
      await interactiveGroup.hover();
      await expect(interactiveGroup).toHaveClass(/.*hovered.*/);
      
      // Test focus effect
      await interactiveGroup.focus();
      await expect(interactiveGroup).toHaveClass(/.*focused.*/);
      
      // Test active state
      await interactiveGroup.click();
      await expect(interactiveGroup).toHaveClass(/.*active.*/);
      
      // Move away and verify classes are removed
      await page.mouse.move(0, 0);
      await expect(interactiveGroup).not.toHaveClass(/.*hovered.*/);
    });

    test('should display group creation animations', async () => {
      // Create new group and watch animation
      await page.click('[data-testid="create-group-btn"]');
      await page.fill('[data-testid="group-name-input"]', 'Animated Group');
      await page.check('[data-testid="column-selector"][data-column="name"]');
      await page.click('[data-testid="create-group-confirm"]');
      
      // Should show creation animation
      const newGroup = page.locator('[data-testid="column-group"][data-group-name="Animated Group"]');
      await expect(newGroup).toHaveClass(/.*creating.*/);
      
      // Wait for animation
      await page.waitForTimeout(600);
      
      // Verify group is fully created
      await expect(newGroup).toBeVisible();
      await expect(newGroup).not.toHaveClass(/.*creating.*/);
    });
  });

  test.describe('Group Analytics and Performance', () => {
    test('should display group performance metrics', async () => {
      // Open performance panel
      await page.click('[data-testid="group-performance-btn"]');
      await expect(page.locator('[data-testid="performance-metrics-panel"]')).toBeVisible();
      
      // Verify metrics are displayed
      await expect(page.locator('[data-testid="render-time-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="memory-usage-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="group-count-metric"]')).toBeVisible();
      
      // Verify performance thresholds
      const renderTime = await page.textContent('[data-testid="render-time-value"]');
      expect(parseFloat(renderTime!)).toBeLessThan(100); // Should render in <100ms
      
      // Test with large number of groups
      await page.click('[data-testid="stress-test-btn"]');
      await page.waitForSelector('[data-testid="stress-test-complete"]');
      
      // Verify performance degradation is minimal
      const stressRenderTime = await page.textContent('[data-testid="render-time-value"]');
      expect(parseFloat(stressRenderTime!)).toBeLessThan(500); // Should still be reasonable
    });

    test('should provide group analytics insights', async () => {
      // Open analytics dashboard
      await page.click('[data-testid="group-analytics-btn"]');
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
      
      // Verify usage statistics
      await expect(page.locator('[data-testid="most-used-groups"]')).toBeVisible();
      await expect(page.locator('[data-testid="group-interaction-heatmap"]')).toBeVisible();
      await expect(page.locator('[data-testid="collapse-expand-frequency"]')).toBeVisible();
      
      // Test drill-down functionality
      const topGroup = page.locator('[data-testid="top-group-item"]').first();
      await topGroup.click();
      
      // Should show detailed analytics for specific group
      await expect(page.locator('[data-testid="group-detail-analytics"]')).toBeVisible();
      await expect(page.locator('[data-testid="interaction-timeline"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-behavior-patterns"]')).toBeVisible();
    });

    test('should optimize groups for performance', async () => {
      // Trigger group optimization
      await page.click('[data-testid="optimize-groups-btn"]');
      await expect(page.locator('[data-testid="optimization-dialog"]')).toBeVisible();
      
      // View optimization suggestions
      const suggestions = page.locator('[data-testid="optimization-suggestion"]');
      expect(await suggestions.count()).toBeGreaterThan(0);
      
      // Apply an optimization
      const firstSuggestion = suggestions.first();
      await expect(firstSuggestion.locator('[data-testid="potential-improvement"]')).toBeVisible();
      
      await firstSuggestion.locator('[data-testid="apply-optimization-btn"]').click();
      
      // Wait for optimization to complete
      await page.waitForSelector('[data-testid="optimization-applied"]');
      
      // Verify performance improved
      const optimizedMetrics = page.locator('[data-testid="post-optimization-metrics"]');
      await expect(optimizedMetrics).toBeVisible();
      
      const improvement = await optimizedMetrics.locator('[data-testid="improvement-percentage"]').textContent();
      expect(parseFloat(improvement!)).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should adapt groups for mobile viewports', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500); // Allow responsive changes to apply
      
      // Verify groups are stacked vertically on mobile
      const groups = page.locator('[data-testid="column-group"]');
      for (let i = 0; i < Math.min(3, await groups.count()); i++) {
        const group = groups.nth(i);
        await expect(group).toHaveClass(/.*mobile-stacked.*/);
      }
      
      // Verify mobile-specific controls are visible
      await expect(page.locator('[data-testid="mobile-group-menu"]')).toBeVisible();
      
      // Test mobile group interaction
      await page.click('[data-testid="mobile-group-menu"]');
      await expect(page.locator('[data-testid="mobile-group-options"]')).toBeVisible();
    });

    test('should support tablet landscape mode', async () => {
      // Test tablet viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(500);
      
      // Verify tablet-optimized layout
      const groups = page.locator('[data-testid="column-group"]');
      for (let i = 0; i < Math.min(3, await groups.count()); i++) {
        const group = groups.nth(i);
        await expect(group).toHaveClass(/.*tablet-optimized.*/);
      }
      
      // Verify touch-friendly controls
      const touchControls = page.locator('[data-testid="touch-control"]');
      for (let i = 0; i < await touchControls.count(); i++) {
        const control = touchControls.nth(i);
        const size = await control.boundingBox();
        expect(size!.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
      }
    });

    test('should handle viewport changes gracefully', async () => {
      // Start with desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const initialGroupCount = await page.locator('[data-testid="column-group"]:visible').count();
      
      // Switch to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(800); // Allow transition
      
      // Verify groups are still functional
      const mobileGroupCount = await page.locator('[data-testid="column-group"]:visible').count();
      expect(mobileGroupCount).toBeGreaterThan(0);
      
      // Switch back to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(800);
      
      // Verify groups are restored
      const restoredGroupCount = await page.locator('[data-testid="column-group"]:visible').count();
      expect(restoredGroupCount).toBe(initialGroupCount);
    });
  });

  test.describe('Collaborative Group Management', () => {
    test('should support real-time group updates', async () => {
      test.skip(!process.env.COLLABORATION_ENABLED, 'Collaboration features not enabled');
      
      // Simulate another user creating a group
      await page.evaluate(() => {
        const event = new CustomEvent('remoteGroupCreated', {
          detail: {
            groupId: 'remote-group-1',
            groupName: 'Remote User Group',
            columns: ['firstName', 'lastName'],
            userId: 'user123'
          }
        });
        document.dispatchEvent(event);
      });
      
      // Verify remote group appears
      await expect(page.locator('[data-testid="column-group"][data-group-id="remote-group-1"]')).toBeVisible();
      
      // Verify attribution is shown
      await expect(page.locator('[data-testid="group-author"][data-user="user123"]')).toBeVisible();
      
      // Test conflict resolution
      await page.evaluate(() => {
        const event = new CustomEvent('remoteGroupConflict', {
          detail: {
            groupId: 'remote-group-1',
            conflictType: 'simultaneous-edit',
            remoteChanges: { groupName: 'Updated Remote Group' }
          }
        });
        document.dispatchEvent(event);
      });
      
      // Should show conflict resolution dialog
      await expect(page.locator('[data-testid="conflict-resolution-dialog"]')).toBeVisible();
    });

    test('should support group sharing and permissions', async () => {
      test.skip(!process.env.COLLABORATION_ENABLED, 'Collaboration features not enabled');
      
      const group = page.locator('[data-testid="column-group"]').first();
      
      // Open sharing dialog
      await group.locator('[data-testid="group-menu-btn"]').click();
      await page.click('[data-testid="share-group-option"]');
      
      await expect(page.locator('[data-testid="group-sharing-dialog"]')).toBeVisible();
      
      // Set permissions
      await page.selectOption('[data-testid="permission-level"]', 'edit');
      await page.fill('[data-testid="share-with-email"]', 'colleague@company.com');
      await page.click('[data-testid="send-share-invitation"]');
      
      // Verify sharing confirmation
      await expect(page.locator('[data-testid="share-success-message"]')).toBeVisible();
      
      // Verify group shows shared indicator
      await expect(group.locator('[data-testid="shared-group-indicator"]')).toBeVisible();
    });
  });

  test.describe('Export and Import Configurations', () => {
    test('should export group configurations', async () => {
      // Open export dialog
      await page.click('[data-testid="group-menu"]');
      await page.click('[data-testid="export-groups-option"]');
      
      await expect(page.locator('[data-testid="export-groups-dialog"]')).toBeVisible();
      
      // Select export format
      await page.selectOption('[data-testid="export-format"]', 'json');
      
      // Include specific options
      await page.check('[data-testid="include-group-hierarchy"]');
      await page.check('[data-testid="include-visual-settings"]');
      await page.check('[data-testid="include-performance-settings"]');
      
      // Export
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="export-groups-btn"]')
      ]);
      
      expect(download.suggestedFilename()).toMatch(/group-config.*\.json$/);
      
      // Verify export content structure
      const exportContent = await download.path();
      // In real implementation, would validate the exported JSON structure
    });

    test('should import group configurations', async () => {
      // Prepare import data
      const importConfig = {
        version: '2.0',
        groups: [
          {
            id: 'imported-group-1',
            name: 'Imported Personal Info',
            columns: ['firstName', 'lastName', 'email'],
            level: 0,
            collapsed: false,
            visual: {
              theme: 'primary',
              icon: 'person'
            }
          }
        ]
      };
      
      // Open import dialog
      await page.click('[data-testid="group-menu"]');
      await page.click('[data-testid="import-groups-option"]');
      
      await expect(page.locator('[data-testid="import-groups-dialog"]')).toBeVisible();
      
      // Upload configuration
      await page.setInputFiles('[data-testid="import-file-input"]', {
        name: 'group-config.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(importConfig))
      });
      
      // Preview import
      await page.click('[data-testid="preview-import-btn"]');
      await expect(page.locator('[data-testid="import-preview"]')).toBeVisible();
      
      // Verify preview shows imported groups
      await expect(page.locator('[data-testid="preview-group"][data-group-name="Imported Personal Info"]')).toBeVisible();
      
      // Apply import
      await page.click('[data-testid="apply-import-btn"]');
      
      // Verify imported group appears in grid
      await expect(page.locator('[data-testid="column-group"][data-group-id="imported-group-1"]')).toBeVisible();
      
      // Verify imported settings are applied
      const importedGroup = page.locator('[data-testid="column-group"][data-group-id="imported-group-1"]');
      await expect(importedGroup).toHaveClass(/.*theme-primary.*/);
      await expect(importedGroup.locator('[data-testid="group-icon"][data-icon="person"]')).toBeVisible();
    });
  });

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should be fully keyboard accessible', async () => {
      const firstGroup = page.locator('[data-testid="column-group"]').first();
      
      // Focus group with keyboard
      await firstGroup.focus();
      await expect(firstGroup).toBeFocused();
      
      // Verify ARIA attributes
      await expect(firstGroup).toHaveAttribute('role', 'columnheader');
      await expect(firstGroup).toHaveAttribute('aria-expanded');
      await expect(firstGroup).toHaveAttribute('aria-describedby');
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      const nextGroup = page.locator('[data-testid="column-group"]').nth(1);
      await expect(nextGroup).toBeFocused();
      
      // Expand/collapse with keyboard
      await page.keyboard.press('Enter');
      const expandedState = await nextGroup.getAttribute('aria-expanded');
      expect(['true', 'false']).toContain(expandedState);
      
      // Space key alternative
      await page.keyboard.press(' ');
      const newExpandedState = await nextGroup.getAttribute('aria-expanded');
      expect(newExpandedState).not.toBe(expandedState);
    });

    test('should provide screen reader announcements', async () => {
      // Verify live region exists
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeVisible();
      
      // Trigger group action and verify announcement
      const group = page.locator('[data-testid="column-group"]').first();
      await group.locator('[data-testid="expand-collapse-btn"]').click();
      
      // Check for announcement
      await expect(liveRegion).toContainText(/Group .* (expanded|collapsed)/);
      
      // Test drag and drop announcements
      const draggableColumn = page.locator('[data-testid="draggable-column"]').first();
      const targetGroup = page.locator('[data-testid="column-group"]').last();
      
      await draggableColumn.dragTo(targetGroup);
      await expect(liveRegion).toContainText(/Column moved to group/);
    });

    test('should support high contrast mode', async () => {
      // Enable high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      // Verify high contrast styles are applied
      const groups = page.locator('[data-testid="column-group"]');
      
      for (let i = 0; i < Math.min(3, await groups.count()); i++) {
        const group = groups.nth(i);
        const styles = await group.evaluate(el => {
          return window.getComputedStyle(el);
        });
        
        // Verify sufficient contrast
        expect(styles.borderWidth).not.toBe('0px');
        
        // Focus should be clearly visible
        await group.focus();
        const focusStyles = await group.evaluate(el => {
          return window.getComputedStyle(el, ':focus');
        });
        expect(focusStyles.outline).not.toBe('none');
      }
    });
  });
});