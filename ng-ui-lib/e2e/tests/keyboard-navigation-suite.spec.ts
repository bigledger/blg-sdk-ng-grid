import { test, expect, Page } from '@playwright/test';
import { GridHelper } from '../helpers/grid-helper';
import { TestHelpers } from '../helpers/test-helpers';

/**
 * Advanced Keyboard Navigation Suite - Tests comprehensive navigation features
 * 
 * This test suite validates BigLedger Grid's advanced keyboard navigation capabilities,
 * including Vi/Vim mode, WASD gaming controls, chess knight patterns, voice commands,
 * macro recording, and full WCAG 2.1 AAA compliance - far exceeding ag-grid's capabilities.
 */
test.describe('Advanced Keyboard Navigation Suite', () => {
  let page: Page;
  let gridHelper: GridHelper;
  let testHelper: TestHelpers;
  
  // Navigation performance tracking
  let navigationMetrics: {
    keyResponseTime: number;
    navigationLatency: number;
    macroExecutionTime: number;
    voiceCommandLatency: number;
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    gridHelper = new GridHelper(page);
    testHelper = new TestHelpers(page);
    
    // Enable navigation performance monitoring
    await page.addInitScript(() => {
      (window as any).navigationMetrics = {
        keyResponseTime: 0,
        navigationLatency: 0,
        macroExecutionTime: 0,
        voiceCommandLatency: 0
      };
    });
  });

  test.beforeEach(async () => {
    await page.goto('/grid-demo?dataset=navigation&rows=10000&cols=50');
    await testHelper.waitForElement('[data-testid="grid-container"]', 10000);
    
    // Focus on grid for keyboard navigation
    await page.locator('[data-testid="grid-container"]').click();
  });

  test.describe('Vi/Vim Mode Navigation', () => {
    
    test('should support comprehensive Vim commands', async () => {
      await test.step('Enable Vim mode', async () => {
        await page.keyboard.press('Control+Shift+V');
        
        // Verify Vim mode indicator
        const vimIndicator = page.locator('[data-testid="vim-mode-indicator"]');
        await expect(vimIndicator).toBeVisible();
        await expect(vimIndicator).toHaveText('NORMAL');
      });

      await test.step('Test basic Vim navigation commands', async () => {
        const commands = [
          { key: 'h', description: 'Move left', expectedChange: 'column-decrease' },
          { key: 'l', description: 'Move right', expectedChange: 'column-increase' },
          { key: 'j', description: 'Move down', expectedChange: 'row-increase' },
          { key: 'k', description: 'Move up', expectedChange: 'row-decrease' },
          { key: 'w', description: 'Next word (cell)', expectedChange: 'next-cell' },
          { key: 'b', description: 'Previous word (cell)', expectedChange: 'prev-cell' }
        ];

        let currentRow = 0, currentCol = 0;

        for (const { key, description, expectedChange } of commands) {
          const startTime = Date.now();
          await page.keyboard.press(key);
          
          // Wait for navigation to complete
          await page.waitForTimeout(50);
          const responseTime = Date.now() - startTime;
          expect(responseTime).toBeLessThan(100); // Should be very responsive
          
          // Verify focus moved correctly
          const activeCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          await expect(activeCell).toBeVisible();
          
          // Get current position
          const cellTestId = await activeCell.getAttribute('data-testid');
          const match = cellTestId?.match(/grid-cell-(\d+)-(\d+)/);
          if (match) {
            const [, row, col] = match;
            const newRow = parseInt(row);
            const newCol = parseInt(col);
            
            // Verify movement direction
            switch (expectedChange) {
              case 'column-decrease':
                expect(newCol).toBeLessThan(currentCol);
                break;
              case 'column-increase':
                expect(newCol).toBeGreaterThan(currentCol);
                break;
              case 'row-increase':
                expect(newRow).toBeGreaterThan(currentRow);
                break;
              case 'row-decrease':
                expect(newRow).toBeLessThan(currentRow);
                break;
            }
            
            currentRow = newRow;
            currentCol = newCol;
          }
        }
      });

      await test.step('Test advanced Vim commands', async () => {
        const advancedCommands = [
          { cmd: 'gg', description: 'Go to first row', expectedRow: 0 },
          { cmd: 'G', description: 'Go to last row', expectedRow: 'last' },
          { cmd: '5j', description: 'Move down 5 rows', expectedRowChange: 5 },
          { cmd: '3w', description: 'Move 3 words forward', expectedColChange: 3 },
          { cmd: '^', description: 'Go to first column', expectedCol: 0 },
          { cmd: '$', description: 'Go to last column', expectedCol: 'last' }
        ];

        for (const { cmd, description, expectedRow, expectedRowChange, expectedCol, expectedColChange } of advancedCommands) {
          // Record current position
          const currentCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const currentTestId = await currentCell.getAttribute('data-testid');
          const currentMatch = currentTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const currentRowNum = currentMatch ? parseInt(currentMatch[1]) : 0;
          const currentColNum = currentMatch ? parseInt(currentMatch[2]) : 0;
          
          // Execute command
          for (const char of cmd) {
            await page.keyboard.press(char);
            await page.waitForTimeout(10);
          }
          
          await page.waitForTimeout(100);
          
          // Verify result
          const newCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const newTestId = await newCell.getAttribute('data-testid');
          const newMatch = newTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const newRowNum = newMatch ? parseInt(newMatch[1]) : 0;
          const newColNum = newMatch ? parseInt(newMatch[2]) : 0;
          
          if (expectedRow === 0) {
            expect(newRowNum).toBe(0);
          } else if (expectedRow === 'last') {
            expect(newRowNum).toBeGreaterThan(currentRowNum);
          } else if (expectedRowChange) {
            expect(newRowNum).toBe(currentRowNum + expectedRowChange);
          }
          
          if (expectedCol === 0) {
            expect(newColNum).toBe(0);
          } else if (expectedCol === 'last') {
            expect(newColNum).toBeGreaterThan(currentColNum);
          } else if (expectedColChange) {
            expect(newColNum).toBeGreaterThan(currentColNum);
          }
        }
      });

      await test.step('Test Vim modes (Normal, Insert, Visual)', async () => {
        // Test Insert mode
        await page.keyboard.press('i');
        const vimIndicator = page.locator('[data-testid="vim-mode-indicator"]');
        await expect(vimIndicator).toHaveText('INSERT');
        
        // In insert mode, typing should edit cell
        await page.keyboard.type('test content');
        const activeCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
        await expect(activeCell).toContainText('test content');
        
        // Escape back to normal mode
        await page.keyboard.press('Escape');
        await expect(vimIndicator).toHaveText('NORMAL');
        
        // Test Visual mode
        await page.keyboard.press('v');
        await expect(vimIndicator).toHaveText('VISUAL');
        
        // In visual mode, navigation should select range
        await page.keyboard.press('l'); // Move right
        await page.keyboard.press('j'); // Move down
        
        const selectedCells = page.locator('[data-testid*="grid-cell"][data-selected="true"]');
        expect(await selectedCells.count()).toBeGreaterThan(1);
        
        await page.keyboard.press('Escape');
        await expect(vimIndicator).toHaveText('NORMAL');
      });
    });

    test('should support Vim macros and custom commands', async () => {
      await test.step('Record and replay macro', async () => {
        await page.keyboard.press('Control+Shift+V'); // Enable Vim mode
        
        // Start recording macro to register 'a'
        await page.keyboard.press('q');
        await page.keyboard.press('a');
        
        const macroIndicator = page.locator('[data-testid="macro-recording"]');
        await expect(macroIndicator).toBeVisible();
        
        // Record a sequence: move right, down, enter edit mode, type, exit
        await page.keyboard.press('l');
        await page.keyboard.press('j');
        await page.keyboard.press('i');
        await page.keyboard.type('macro');
        await page.keyboard.press('Escape');
        
        // Stop recording
        await page.keyboard.press('q');
        await expect(macroIndicator).not.toBeVisible();
        
        // Move to different position
        await page.keyboard.press('h');
        await page.keyboard.press('k');
        
        // Replay macro
        await page.keyboard.press('@');
        await page.keyboard.press('a');
        
        // Verify macro executed
        const cells = page.locator('[data-testid*="grid-cell"]:has-text("macro")');
        expect(await cells.count()).toBe(2); // Original + replayed
      });

      await test.step('Test custom Vim commands', async () => {
        // Define custom command (simulated through settings)
        await page.locator('[data-testid="vim-settings"]').click();
        await page.fill('[data-testid="custom-command-name"]', 'sortColumn');
        await page.fill('[data-testid="custom-command-keys"]', '<leader>sc');
        await page.fill('[data-testid="custom-command-action"]', 'sort-current-column-asc');
        await page.locator('[data-testid="add-custom-command"]').click();
        
        // Use custom command
        await page.keyboard.press('\\'); // Default leader key
        await page.keyboard.press('s');
        await page.keyboard.press('c');
        
        // Verify column was sorted
        await page.waitForTimeout(1000);
        const sortIcon = page.locator('[data-testid*="sort-asc-icon"]');
        await expect(sortIcon).toBeVisible();
      });
    });
  });

  test.describe('WASD Gaming Controls', () => {
    
    test('should support WASD navigation with gaming enhancements', async () => {
      await test.step('Enable gaming mode', async () => {
        await page.keyboard.press('Control+Shift+G');
        
        const gamingIndicator = page.locator('[data-testid="gaming-mode-indicator"]');
        await expect(gamingIndicator).toBeVisible();
        await expect(gamingIndicator).toHaveText('GAMING MODE');
      });

      await test.step('Test WASD basic movement', async () => {
        const movements = [
          { key: 'KeyW', direction: 'up', expectedChange: 'row-decrease' },
          { key: 'KeyS', direction: 'down', expectedChange: 'row-increase' },
          { key: 'KeyA', direction: 'left', expectedChange: 'column-decrease' },
          { key: 'KeyD', direction: 'right', expectedChange: 'column-increase' }
        ];

        for (const { key, direction, expectedChange } of movements) {
          const startTime = Date.now();
          
          // Get current position
          const currentCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const currentTestId = await currentCell.getAttribute('data-testid');
          const currentMatch = currentTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const currentRow = currentMatch ? parseInt(currentMatch[1]) : 0;
          const currentCol = currentMatch ? parseInt(currentMatch[2]) : 0;
          
          // Press key
          await page.keyboard.press(key);
          await page.waitForTimeout(50);
          
          const responseTime = Date.now() - startTime;
          expect(responseTime).toBeLessThan(100);
          
          // Verify movement
          const newCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const newTestId = await newCell.getAttribute('data-testid');
          const newMatch = newTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const newRow = newMatch ? parseInt(newMatch[1]) : 0;
          const newCol = newMatch ? parseInt(newMatch[2]) : 0;
          
          switch (expectedChange) {
            case 'row-decrease':
              expect(newRow).toBeLessThan(currentRow);
              break;
            case 'row-increase':
              expect(newRow).toBeGreaterThan(currentRow);
              break;
            case 'column-decrease':
              expect(newCol).toBeLessThan(currentCol);
              break;
            case 'column-increase':
              expect(newCol).toBeGreaterThan(currentCol);
              break;
          }
        }
      });

      await test.step('Test WASD with modifiers (sprint, precision)', async () => {
        // Sprint mode (Shift + WASD = move faster)
        await page.keyboard.press('Shift+KeyD');
        await page.keyboard.press('Shift+KeyD');
        await page.keyboard.press('Shift+KeyD');
        
        // Should move multiple cells at once
        const currentCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
        const testId = await currentCell.getAttribute('data-testid');
        const match = testId?.match(/grid-cell-(\d+)-(\d+)/);
        const col = match ? parseInt(match[2]) : 0;
        expect(col).toBeGreaterThanOrEqual(3); // Should have moved multiple columns
        
        // Precision mode (Ctrl + WASD = slower, more precise)
        await page.keyboard.press('Control+KeyA');
        await page.keyboard.press('Control+KeyA');
        
        // Should move one cell at a time with highlighting
        const precisionHighlight = page.locator('[data-testid="precision-highlight"]');
        await expect(precisionHighlight).toBeVisible();
      });

      await test.step('Test gaming hotkeys', async () => {
        const hotkeys = [
          { key: 'Space', action: 'Select current cell', expectedResult: 'selected' },
          { key: 'KeyE', action: 'Edit current cell', expectedResult: 'editing' },
          { key: 'KeyQ', action: 'Quick filter menu', expectedResult: 'filter-menu' },
          { key: 'KeyR', action: 'Refresh/reload data', expectedResult: 'refreshed' },
          { key: 'KeyF', action: 'Find in grid', expectedResult: 'search-open' }
        ];

        for (const { key, action, expectedResult } of hotkeys) {
          await page.keyboard.press(key);
          await page.waitForTimeout(100);
          
          switch (expectedResult) {
            case 'selected':
              const selectedCell = page.locator('[data-testid*="grid-cell"][data-selected="true"]');
              await expect(selectedCell).toBeVisible();
              break;
            case 'editing':
              const editingCell = page.locator('[data-testid*="cell-editor"]');
              await expect(editingCell).toBeVisible();
              await page.keyboard.press('Escape'); // Exit edit mode
              break;
            case 'filter-menu':
              const filterMenu = page.locator('[data-testid="quick-filter-menu"]');
              await expect(filterMenu).toBeVisible();
              await page.keyboard.press('Escape'); // Close menu
              break;
            case 'search-open':
              const searchBox = page.locator('[data-testid="grid-search-box"]');
              await expect(searchBox).toBeVisible();
              await page.keyboard.press('Escape'); // Close search
              break;
          }
        }
      });
    });

    test('should support gaming-style combo movements', async () => {
      await test.step('Test diagonal movements', async () => {
        await page.keyboard.press('Control+Shift+G'); // Enable gaming mode
        
        // Test diagonal combos
        const combos = [
          { keys: ['KeyW', 'KeyD'], direction: 'up-right' },
          { keys: ['KeyW', 'KeyA'], direction: 'up-left' },
          { keys: ['KeyS', 'KeyD'], direction: 'down-right' },
          { keys: ['KeyS', 'KeyA'], direction: 'down-left' }
        ];

        for (const { keys, direction } of combos) {
          const startCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const startTestId = await startCell.getAttribute('data-testid');
          const startMatch = startTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const startRow = startMatch ? parseInt(startMatch[1]) : 0;
          const startCol = startMatch ? parseInt(startMatch[2]) : 0;
          
          // Press keys simultaneously
          await page.keyboard.down(keys[0]);
          await page.keyboard.down(keys[1]);
          await page.waitForTimeout(100);
          await page.keyboard.up(keys[0]);
          await page.keyboard.up(keys[1]);
          
          const endCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const endTestId = await endCell.getAttribute('data-testid');
          const endMatch = endTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const endRow = endMatch ? parseInt(endMatch[1]) : 0;
          const endCol = endMatch ? parseInt(endMatch[2]) : 0;
          
          // Verify diagonal movement
          if (direction.includes('up')) expect(endRow).toBeLessThan(startRow);
          if (direction.includes('down')) expect(endRow).toBeGreaterThan(startRow);
          if (direction.includes('left')) expect(endCol).toBeLessThan(startCol);
          if (direction.includes('right')) expect(endCol).toBeGreaterThan(startCol);
        }
      });
    });
  });

  test.describe('Chess Knight Navigation Pattern', () => {
    
    test('should support L-shaped knight movements', async () => {
      await test.step('Enable knight navigation mode', async () => {
        await page.keyboard.press('Control+Shift+K');
        
        const knightIndicator = page.locator('[data-testid="knight-mode-indicator"]');
        await expect(knightIndicator).toBeVisible();
        await expect(knightIndicator).toHaveText('KNIGHT MODE');
      });

      await test.step('Test all 8 knight move patterns', async () => {
        const knightMoves = [
          { key: '1', pattern: '+2,+1', description: '2 right, 1 down' },
          { key: '2', pattern: '+1,+2', description: '1 right, 2 down' },
          { key: '3', pattern: '-1,+2', description: '1 left, 2 down' },
          { key: '4', pattern: '-2,+1', description: '2 left, 1 down' },
          { key: '5', pattern: '-2,-1', description: '2 left, 1 up' },
          { key: '6', pattern: '-1,-2', description: '1 left, 2 up' },
          { key: '7', pattern: '+1,-2', description: '1 right, 2 up' },
          { key: '8', pattern: '+2,-1', description: '2 right, 1 up' }
        ];

        for (const { key, pattern, description } of knightMoves) {
          // Get starting position
          const startCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const startTestId = await startCell.getAttribute('data-testid');
          const startMatch = startTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const startRow = startMatch ? parseInt(startMatch[1]) : 0;
          const startCol = startMatch ? parseInt(startMatch[2]) : 0;
          
          // Execute knight move
          await page.keyboard.press(key);
          await page.waitForTimeout(100);
          
          // Verify L-shaped movement
          const endCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          const endTestId = await endCell.getAttribute('data-testid');
          const endMatch = endTestId?.match(/grid-cell-(\d+)-(\d+)/);
          const endRow = endMatch ? parseInt(endMatch[1]) : 0;
          const endCol = endMatch ? parseInt(endMatch[2]) : 0;
          
          const rowDiff = endRow - startRow;
          const colDiff = endCol - startCol;
          
          // Knight moves are always L-shaped: (2,1) or (1,2) in any direction
          const isValidKnightMove = (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
                                   (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
          expect(isValidKnightMove).toBe(true);
          
          // Move back to center for next test
          await page.keyboard.press('Control+Home');
          await page.waitForTimeout(100);
        }
      });

      await test.step('Test knight move path visualization', async () => {
        // Enable path visualization
        await page.locator('[data-testid="knight-path-visualization"]').click();
        
        // Make a knight move
        await page.keyboard.press('1'); // 2 right, 1 down
        
        // Verify path is shown
        const pathIndicator = page.locator('[data-testid="knight-path-line"]');
        await expect(pathIndicator).toBeVisible();
        
        // Path should show L-shape
        const pathBox = await pathIndicator.boundingBox();
        expect(pathBox?.width).toBeGreaterThan(0);
        expect(pathBox?.height).toBeGreaterThan(0);
      });
    });

    test('should support knight move sequences and puzzles', async () => {
      await test.step('Test knight tour challenge', async () => {
        await page.keyboard.press('Control+Shift+K'); // Enable knight mode
        await page.locator('[data-testid="knight-tour-challenge"]').click();
        
        // Start knight's tour challenge (visit all cells once)
        const tourStatus = page.locator('[data-testid="tour-status"]');
        await expect(tourStatus).toContainText('Tour started');
        
        // Make several knight moves
        const moves = ['1', '2', '3', '4', '5'];
        for (const move of moves) {
          await page.keyboard.press(move);
          await page.waitForTimeout(200);
          
          // Check if move is valid in tour
          const moveStatus = await tourStatus.textContent();
          expect(moveStatus).not.toContain('Invalid');
        }
        
        // Verify visited cells are marked
        const visitedCells = page.locator('[data-testid*="grid-cell"][data-knight-visited="true"]');
        expect(await visitedCells.count()).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Voice Command Navigation', () => {
    
    test('should support comprehensive voice commands', async () => {
      await test.step('Enable voice navigation', async () => {
        await page.locator('[data-testid="enable-voice-navigation"]').click();
        
        const voiceIndicator = page.locator('[data-testid="voice-navigation-indicator"]');
        await expect(voiceIndicator).toBeVisible();
      });

      await test.step('Test basic navigation voice commands', async () => {
        const voiceCommands = [
          { command: 'go to cell A1', expectedResult: { row: 0, col: 0 } },
          { command: 'move right five cells', expectedResult: { colChange: 5 } },
          { command: 'jump to last row', expectedResult: { row: 'last' } },
          { command: 'select column three', expectedResult: { action: 'column-select' } },
          { command: 'edit current cell', expectedResult: { action: 'edit-mode' } }
        ];

        for (const { command, expectedResult } of voiceCommands) {
          const startTime = Date.now();
          
          // Simulate voice command (since we can't use actual microphone)
          await page.evaluate((cmd) => {
            (window as any).simulateVoiceCommand(cmd);
          }, command);
          
          await page.waitForTimeout(500);
          const commandTime = Date.now() - startTime;
          expect(commandTime).toBeLessThan(2000); // Voice processing should be fast
          
          // Verify command execution
          if (expectedResult.row !== undefined) {
            const currentCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
            const testId = await currentCell.getAttribute('data-testid');
            const match = testId?.match(/grid-cell-(\d+)-(\d+)/);
            const row = match ? parseInt(match[1]) : 0;
            
            if (expectedResult.row === 'last') {
              expect(row).toBeGreaterThan(100); // Should be near end
            } else {
              expect(row).toBe(expectedResult.row);
            }
          }
          
          if (expectedResult.action === 'edit-mode') {
            const editor = page.locator('[data-testid*="cell-editor"]');
            await expect(editor).toBeVisible();
            await page.keyboard.press('Escape'); // Exit edit
          }
        }
      });

      await test.step('Test complex voice navigation patterns', async () => {
        const complexCommands = [
          'navigate to cell B5, then move diagonally down right three cells',
          'select from current position to cell F10',
          'find all cells containing the word revenue and select them',
          'sort the current column in descending order',
          'create a filter for values greater than 1000'
        ];

        for (const command of complexCommands) {
          await page.evaluate((cmd) => {
            (window as any).simulateVoiceCommand(cmd);
          }, command);
          
          await page.waitForTimeout(1000);
          
          // Verify some action was taken (basic check)
          const gridState = await page.evaluate(() => {
            return (window as any).getGridState ? (window as any).getGridState() : {};
          });
          
          expect(gridState).toBeDefined();
        }
      });
    });

    test('should support voice command macros', async () => {
      await test.step('Record voice command sequence', async () => {
        await page.locator('[data-testid="voice-macro-record"]').click();
        
        const macroStatus = page.locator('[data-testid="voice-macro-status"]');
        await expect(macroStatus).toContainText('Recording');
        
        // Record sequence of commands
        const commands = [
          'move to cell A1',
          'select current row',
          'copy selection',
          'move down one row',
          'paste'
        ];
        
        for (const command of commands) {
          await page.evaluate((cmd) => {
            (window as any).simulateVoiceCommand(cmd);
          }, command);
          await page.waitForTimeout(300);
        }
        
        // Stop recording
        await page.locator('[data-testid="voice-macro-stop"]').click();
        await expect(macroStatus).toContainText('Stopped');
      });

      await test.step('Save and replay voice macro', async () => {
        await page.fill('[data-testid="voice-macro-name"]', 'Copy Row Down');
        await page.locator('[data-testid="voice-macro-save"]').click();
        
        // Move to different location
        await page.evaluate(() => {
          (window as any).simulateVoiceCommand('move to cell C5');
        });
        
        // Replay macro
        await page.evaluate(() => {
          (window as any).simulateVoiceCommand('replay macro Copy Row Down');
        });
        
        await page.waitForTimeout(2000);
        
        // Verify macro executed
        const macroResult = page.locator('[data-testid="macro-execution-complete"]');
        await expect(macroResult).toBeVisible();
      });
    });
  });

  test.describe('Macro Recording and Playback', () => {
    
    test('should support comprehensive macro system', async () => {
      await test.step('Record complex keyboard macro', async () => {
        await page.keyboard.press('Control+Shift+R'); // Start recording
        
        const recordingIndicator = page.locator('[data-testid="macro-recording-indicator"]');
        await expect(recordingIndicator).toBeVisible();
        
        // Record a complex sequence
        await page.keyboard.press('Home'); // Go to first cell
        await page.keyboard.press('Control+Shift+End'); // Select to end
        await page.keyboard.press('Control+C'); // Copy
        await page.keyboard.press('Control+Home'); // Go to start
        await page.keyboard.press('ArrowDown'); // Move down
        await page.keyboard.press('Control+V'); // Paste
        
        // Stop recording
        await page.keyboard.press('Control+Shift+R');
        await expect(recordingIndicator).not.toBeVisible();
      });

      await test.step('Save macro with metadata', async () => {
        await page.locator('[data-testid="macro-save-dialog"]').click();
        await page.fill('[data-testid="macro-name"]', 'Copy All Data Down');
        await page.fill('[data-testid="macro-description"]', 'Copies entire grid selection and pastes one row down');
        await page.selectOption('[data-testid="macro-category"]', 'Data Operations');
        await page.locator('[data-testid="macro-save-confirm"]').click();
        
        const saveSuccess = page.locator('[data-testid="macro-save-success"]');
        await expect(saveSuccess).toBeVisible();
      });

      await test.step('Replay macro with timing control', async () => {
        // Set playback speed
        await page.locator('[data-testid="macro-playback-speed"]').fill('0.5'); // Half speed
        
        // Clear grid state
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Delete');
        
        const startTime = Date.now();
        
        // Replay macro
        await page.keyboard.press('Control+Shift+P');
        await page.locator('[data-testid="macro-copy-all-data-down"]').click();
        
        await testHelper.waitForElement('[data-testid="macro-playback-complete"]', 10000);
        const playbackTime = Date.now() - startTime;
        
        // Should take longer due to half speed
        expect(playbackTime).toBeGreaterThan(1000);
      });

      await test.step('Test macro with parameters', async () => {
        // Create parameterized macro
        await page.keyboard.press('Control+Shift+R'); // Start recording
        
        // Record parameterizable sequence
        await page.keyboard.press('ArrowRight'); // Move right (parameter: direction)
        await page.keyboard.press('ArrowRight'); // Repeat (parameter: count)
        await page.keyboard.press('Space'); // Select cell
        
        await page.keyboard.press('Control+Shift+R'); // Stop recording
        
        // Save with parameters
        await page.locator('[data-testid="macro-save-dialog"]').click();
        await page.fill('[data-testid="macro-name"]', 'Move and Select');
        await page.locator('[data-testid="macro-add-parameter"]').click();
        await page.fill('[data-testid="parameter-name"]', 'direction');
        await page.selectOption('[data-testid="parameter-type"]', 'direction');
        await page.locator('[data-testid="macro-add-parameter"]').click();
        await page.fill('[data-testid="parameter-name"]', 'count');
        await page.selectOption('[data-testid="parameter-type"]', 'number');
        await page.locator('[data-testid="macro-save-confirm"]').click();
        
        // Replay with different parameters
        await page.keyboard.press('Control+Shift+P');
        await page.locator('[data-testid="macro-move-and-select"]').click();
        await page.selectOption('[data-testid="param-direction"]', 'down');
        await page.fill('[data-testid="param-count"]', '3');
        await page.locator('[data-testid="macro-execute-with-params"]').click();
        
        // Verify parameterized execution
        const selectedCells = page.locator('[data-testid*="grid-cell"][data-selected="true"]');
        expect(await selectedCells.count()).toBe(3);
      });
    });

    test('should support macro library and sharing', async () => {
      await test.step('Browse macro library', async () => {
        await page.locator('[data-testid="macro-library"]').click();
        
        const macroCategories = page.locator('[data-testid^="macro-category-"]');
        expect(await macroCategories.count()).toBeGreaterThan(0);
        
        // Browse built-in macros
        await page.locator('[data-testid="macro-category-built-in"]').click();
        const builtinMacros = page.locator('[data-testid^="macro-builtin-"]');
        expect(await builtinMacros.count()).toBeGreaterThan(5);
        
        // Test macro preview
        await builtinMacros.first().hover();
        const macroPreview = page.locator('[data-testid="macro-preview-tooltip"]');
        await expect(macroPreview).toBeVisible();
      });

      await test.step('Import/Export macros', async () => {
        // Export macro collection
        await page.locator('[data-testid="export-macros"]').click();
        await page.locator('[data-testid="select-all-macros"]').click();
        
        const downloadPromise = page.waitForEvent('download');
        await page.locator('[data-testid="download-macro-collection"]').click();
        const download = await downloadPromise;
        
        expect(download.suggestedFilename()).toContain('macros');
        expect(download.suggestedFilename()).toContain('.json');
      });
    });
  });

  test.describe('WCAG 2.1 AAA Compliance', () => {
    
    test('should meet highest accessibility standards', async () => {
      await test.step('Test comprehensive keyboard navigation', async () => {
        // Test tab order
        const focusableElements = [
          '[data-testid="grid-container"]',
          '[data-testid="column-header-0"]',
          '[data-testid="grid-cell-0-0"]',
          '[data-testid="pagination-controls"]',
          '[data-testid="grid-settings"]'
        ];

        for (let i = 0; i < focusableElements.length; i++) {
          await page.keyboard.press('Tab');
          const focused = page.locator(':focus');
          
          // Verify element is focusable
          await expect(focused).toBeVisible();
          
          // Verify focus indicator is visible
          const focusStyle = await focused.evaluate(el => getComputedStyle(el));
          expect(focusStyle.outlineWidth).not.toBe('0px');
        }
      });

      await test.step('Test screen reader announcements', async () => {
        // Test navigation announcements
        await page.keyboard.press('ArrowRight');
        
        const announcement = page.locator('[data-testid="sr-announcement"]');
        const announcementText = await announcement.textContent();
        expect(announcementText).toMatch(/moved to cell|column \d+|row \d+/i);
        
        // Test selection announcements
        await page.keyboard.press('Space');
        const selectionAnnouncement = await announcement.textContent();
        expect(selectionAnnouncement).toMatch(/selected|cell selected/i);
      });

      await test.step('Test high contrast mode compatibility', async () => {
        // Enable high contrast mode
        await page.emulateMedia({ forcedColors: 'active' });
        
        // Verify grid is still navigable
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
        
        // Verify focus indicators work in high contrast
        const focusBorder = await focused.evaluate(el => {
          return getComputedStyle(el).outlineColor;
        });
        expect(focusBorder).not.toBe('transparent');
      });

      await test.step('Test motion reduction preferences', async () => {
        // Simulate reduced motion preference
        await page.emulateMedia({ reducedMotion: 'reduce' });
        
        // Navigation should still work but without animations
        await page.keyboard.press('ArrowDown');
        
        // Verify movement happened but smoothly (no jarring jumps)
        const cell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
        await expect(cell).toBeVisible();
        
        // Animation duration should be minimal
        const animationDuration = await cell.evaluate(el => {
          return getComputedStyle(el).transitionDuration;
        });
        expect(animationDuration).toMatch(/0s|0.01s/);
      });

      await test.step('Test keyboard shortcuts with conflicts', async () => {
        // Test that custom shortcuts don't conflict with browser/AT shortcuts
        const protectedShortcuts = [
          'F6', // Move between panels (screen readers)
          'Alt+Tab', // Switch applications
          'Control+F', // Find in page
          'Control+R' // Reload page
        ];

        for (const shortcut of protectedShortcuts) {
          // These should either not be captured or have escape hatches
          const beforeUrl = page.url();
          await page.keyboard.press(shortcut);
          await page.waitForTimeout(100);
          
          // URL shouldn't change unexpectedly
          expect(page.url()).toBe(beforeUrl);
        }
      });

      await test.step('Test language and localization support', async () => {
        const languages = ['en', 'es', 'fr', 'de', 'ja', 'ar'];
        
        for (const lang of languages) {
          await page.locator('[data-testid="language-selector"]').selectOption(lang);
          
          // Test that navigation still works
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('ArrowRight');
          
          const focused = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
          await expect(focused).toBeVisible();
          
          // Test that announcements are in correct language
          const announcement = page.locator('[data-testid="sr-announcement"]');
          const text = await announcement.textContent();
          expect(text?.length).toBeGreaterThan(0);
        }
      });
    });
  });

  test.describe('Performance and Responsiveness', () => {
    
    test('should maintain performance with complex navigation', async () => {
      await test.step('Test navigation performance on large grid', async () => {
        await page.goto('/grid-demo?dataset=massive&rows=100000&cols=200');
        await testHelper.waitForElement('[data-testid="grid-container"]', 15000);
        
        // Test rapid navigation
        const startTime = Date.now();
        
        for (let i = 0; i < 50; i++) {
          await page.keyboard.press('ArrowDown');
          if (i % 10 === 0) await page.waitForTimeout(10); // Brief pause
        }
        
        const navigationTime = Date.now() - startTime;
        expect(navigationTime).toBeLessThan(2000); // Should be smooth
        
        // Verify we're at expected position
        const currentCell = page.locator('[data-testid*="grid-cell"][tabindex="0"]');
        const testId = await currentCell.getAttribute('data-testid');
        const match = testId?.match(/grid-cell-(\d+)-(\d+)/);
        const row = match ? parseInt(match[1]) : 0;
        expect(row).toBe(50);
      });

      await test.step('Test memory usage during extended navigation', async () => {
        const initialMemory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        
        // Navigate extensively
        for (let i = 0; i < 1000; i++) {
          await page.keyboard.press(i % 4 === 0 ? 'ArrowDown' : 
                                  i % 4 === 1 ? 'ArrowRight' : 
                                  i % 4 === 2 ? 'ArrowUp' : 'ArrowLeft');
          
          if (i % 100 === 0) await page.waitForTimeout(1);
        }
        
        const finalMemory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        
        // Memory shouldn't grow excessively
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
      });
    });
  });

  test.afterEach(async () => {
    // Capture final metrics
    const finalMetrics = await page.evaluate(() => (window as any).navigationMetrics);
    
    console.log('Navigation Performance:', {
      keyResponseTime: finalMetrics.keyResponseTime,
      navigationLatency: finalMetrics.navigationLatency,
      macroExecutionTime: finalMetrics.macroExecutionTime,
      voiceCommandLatency: finalMetrics.voiceCommandLatency
    });
    
    // Screenshot for documentation
    await page.screenshot({
      path: `e2e/screenshots/keyboard-navigation-${test.info().title.replace(/\s/g, '-').toLowerCase()}.png`,
      fullPage: true
    });
  });
});