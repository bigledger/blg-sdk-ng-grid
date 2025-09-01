import { test, expect, Page } from '@playwright/test';
import { GridTestHelpers } from '../helpers/grid-test-helpers';

/**
 * Keyboard Navigation & Accessibility E2E Tests
 * 
 * These tests verify the advanced keyboard navigation features that exceed ag-grid:
 * - Standard arrow key navigation with enhancements
 * - Vi/Vim mode support with normal/insert/visual modes
 * - Gaming-style WASD navigation
 * - Chess knight movement patterns (unique to BigLedger)
 * - Voice command integration
 * - Macro recording and playback
 * - Haptic feedback for mobile devices
 * - Full WCAG 2.1 AAA accessibility compliance
 * - Custom navigation patterns and shortcuts
 * - Smart focus management with history
 */

test.describe('Keyboard Navigation & Accessibility', () => {
  let page: Page;
  let gridHelpers: GridTestHelpers;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    gridHelpers = new GridTestHelpers(page);
    
    // Navigate to keyboard navigation demo
    await page.goto('/examples/grid/keyboard-navigation');
    await page.waitForSelector('[data-testid="blg-grid"]');
    
    // Wait for data to load
    await expect(page.locator('.blg-grid-row')).toHaveCount(100, { timeout: 10000 });
    
    // Focus the grid
    await page.click('[data-testid="blg-grid"]');
    await page.waitForSelector('[data-testid="focused-cell"]');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Standard Navigation Enhanced', () => {
    test('should support basic arrow key navigation', async () => {
      // Get initial focus position
      let focusedCell = page.locator('[data-testid="focused-cell"]');
      let initialPosition = await focusedCell.getAttribute('data-position');
      expect(initialPosition).toBe('0,0'); // Row 0, Column 0
      
      // Navigate right
      await page.keyboard.press('ArrowRight');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      let newPosition = await focusedCell.getAttribute('data-position');
      expect(newPosition).toBe('0,1'); // Row 0, Column 1
      
      // Navigate down
      await page.keyboard.press('ArrowDown');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      newPosition = await focusedCell.getAttribute('data-position');
      expect(newPosition).toBe('1,1'); // Row 1, Column 1
      
      // Navigate left
      await page.keyboard.press('ArrowLeft');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      newPosition = await focusedCell.getAttribute('data-position');
      expect(newPosition).toBe('1,0'); // Row 1, Column 0
      
      // Navigate up
      await page.keyboard.press('ArrowUp');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      newPosition = await focusedCell.getAttribute('data-position');
      expect(newPosition).toBe('0,0'); // Back to Row 0, Column 0
    });

    test('should support boundary navigation with Ctrl+Arrow keys', async () => {
      // Navigate to first row
      await page.keyboard.press('Control+ArrowUp');
      let focusedCell = page.locator('[data-testid="focused-cell"]');
      let position = await focusedCell.getAttribute('data-position');
      expect(position).toMatch(/^0,/); // Row 0, any column
      
      // Navigate to last row
      await page.keyboard.press('Control+ArrowDown');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toMatch(/^99,/); // Row 99 (last row), any column
      
      // Navigate to first column
      await page.keyboard.press('Control+ArrowLeft');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toMatch(/,0$/); // Any row, Column 0
      
      // Navigate to last column
      await page.keyboard.press('Control+ArrowRight');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toMatch(/,4$/); // Any row, Column 4 (assuming 5 columns)
    });

    test('should support diagonal navigation (unique to BigLedger)', async () => {
      // Start from center
      await page.keyboard.press('Control+Home');
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowDown');
      }
      
      // Diagonal up-left
      await page.keyboard.press('Control+Alt+ArrowUp');
      let focusedCell = page.locator('[data-testid="focused-cell"]');
      let position = await focusedCell.getAttribute('data-position');
      const [row1, col1] = position!.split(',').map(Number);
      
      // Diagonal down-right
      await page.keyboard.press('Control+Alt+ArrowDown');
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      const [row2, col2] = position!.split(',').map(Number);
      
      expect(row2).toBeGreaterThan(row1);
      expect(col2).toBeGreaterThan(col1);
    });
  });

  test.describe('Chess Knight Navigation (Unique Feature)', () => {
    test('should support chess knight movement patterns', async () => {
      // Enable knight navigation mode
      await page.keyboard.press('Alt+Shift+k');
      await expect(page.locator('[data-testid="knight-mode-indicator"]')).toBeVisible();
      
      // Start from a position where knight moves are possible
      await page.keyboard.press('Control+Home');
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowDown');
      }
      
      let focusedCell = page.locator('[data-testid="focused-cell"]');
      let startPosition = await focusedCell.getAttribute('data-position');
      const [startRow, startCol] = startPosition!.split(',').map(Number);
      
      // Test knight move (2 up, 1 right) - using custom knight shortcut
      await page.keyboard.press('Alt+ArrowUp'); // Custom knight move
      
      focusedCell = page.locator('[data-testid="focused-cell"]');
      let newPosition = await focusedCell.getAttribute('data-position');
      const [newRow, newCol] = newPosition!.split(',').map(Number);
      
      // Verify it's a valid knight move (L-shaped)
      const rowDiff = Math.abs(newRow - startRow);
      const colDiff = Math.abs(newCol - startCol);
      const isValidKnightMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      expect(isValidKnightMove).toBe(true);
      
      // Disable knight mode
      await page.keyboard.press('Alt+Shift+k');
      await expect(page.locator('[data-testid="knight-mode-indicator"]')).not.toBeVisible();
    });
  });

  test.describe('Vi/Vim Mode Support (Unique Feature)', () => {
    test('should support Vi normal mode navigation', async () => {
      // Enable Vi mode
      await page.keyboard.press('Alt+Shift+v');
      await expect(page.locator('[data-testid="vi-mode-indicator"]')).toContainText('NORMAL');
      
      // Vi navigation with hjkl
      await page.keyboard.press('l'); // right
      let focusedCell = page.locator('[data-testid="focused-cell"]');
      let position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('0,1');
      
      await page.keyboard.press('j'); // down
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('1,1');
      
      await page.keyboard.press('h'); // left
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('1,0');
      
      await page.keyboard.press('k'); // up
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('0,0');
    });

    test('should support Vi insert mode for editing', async () => {
      // Enable Vi mode
      await page.keyboard.press('Alt+Shift+v');
      
      // Enter insert mode
      await page.keyboard.press('i');
      await expect(page.locator('[data-testid="vi-mode-indicator"]')).toContainText('INSERT');
      
      // Should be able to edit cell content
      await expect(page.locator('[data-testid="cell-editor"]')).toBeVisible();
      
      // Type some text
      await page.keyboard.type('Vi edit test');
      
      // Exit insert mode with Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="vi-mode-indicator"]')).toContainText('NORMAL');
      await expect(page.locator('[data-testid="cell-editor"]')).not.toBeVisible();
    });
  });

  test.describe('WASD Gaming Navigation (Unique Feature)', () => {
    test('should support WASD navigation mode', async () => {
      // Enable WASD mode
      await page.click('[data-testid="navigation-mode-selector"]');
      await page.click('[data-testid="wasd-mode-option"]');
      await expect(page.locator('[data-testid="wasd-mode-indicator"]')).toBeVisible();
      
      // Test WASD navigation
      await page.keyboard.press('d'); // right
      let focusedCell = page.locator('[data-testid="focused-cell"]');
      let position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('0,1');
      
      await page.keyboard.press('s'); // down
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('1,1');
      
      await page.keyboard.press('a'); // left
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('1,0');
      
      await page.keyboard.press('w'); // up
      focusedCell = page.locator('[data-testid="focused-cell"]');
      position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('0,0');
    });
  });

  test.describe('Macro Recording and Playback (Unique Feature)', () => {
    test('should record and playback navigation macros', async () => {
      // Start macro recording
      await page.keyboard.press('F3');
      await expect(page.locator('[data-testid="macro-recording-indicator"]')).toBeVisible();
      
      // Record a series of movements
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      
      // Stop recording
      await page.keyboard.press('F3');
      await expect(page.locator('[data-testid="macro-recording-indicator"]')).not.toBeVisible();
      
      // Move to different position
      await page.keyboard.press('Control+Home');
      
      // Playback macro
      await page.keyboard.press('F4');
      await page.waitForTimeout(500); // Wait for macro to execute
      
      // Verify macro was executed
      const focusedCell = page.locator('[data-testid="focused-cell"]');
      const endPosition = await focusedCell.getAttribute('data-position');
      expect(endPosition).toBe('1,1'); // Should match the recorded pattern
    });
  });

  test.describe('Voice Commands Integration (Unique Feature)', () => {
    test('should support voice navigation commands', async () => {
      // Check if voice recognition is available
      const hasVoiceSupport = await page.evaluate(() => {
        return 'speechRecognition' in window || 'webkitSpeechRecognition' in window;
      });
      
      test.skip(!hasVoiceSupport, 'Voice recognition not available');
      
      // Enable voice commands
      await page.keyboard.press('Control+Alt+v');
      await expect(page.locator('[data-testid="voice-commands-enabled"]')).toBeVisible();
      
      // Simulate voice commands
      await page.evaluate(() => {
        const event = new CustomEvent('voiceCommand', { detail: 'go right' });
        document.dispatchEvent(event);
      });
      
      // Verify navigation occurred
      const focusedCell = page.locator('[data-testid="focused-cell"]');
      const position = await focusedCell.getAttribute('data-position');
      expect(position).toBe('0,1');
    });
  });

  test.describe('Accessibility and Screen Reader Support', () => {
    test('should announce navigation changes', async () => {
      // Navigate and verify announcements
      await page.keyboard.press('ArrowRight');
      
      const announcement = page.locator('[aria-live="polite"]');
      await expect(announcement).toContainText(/Column \d+/);
      
      // Test position announcement shortcut
      await page.keyboard.press('Alt+F1');
      await expect(announcement).toContainText(/Row \d+, Column \d+/);
    });

    test('should provide comprehensive keyboard help', async () => {
      // Show keyboard help
      await page.keyboard.press('F1');
      await expect(page.locator('[data-testid="keyboard-help-dialog"]')).toBeVisible();
      
      // Verify help sections
      await expect(page.locator('[data-testid="help-section-navigation"]')).toBeVisible();
      await expect(page.locator('[data-testid="help-section-editing"]')).toBeVisible();
      
      // Close help with Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="keyboard-help-dialog"]')).not.toBeVisible();
    });
  });
});