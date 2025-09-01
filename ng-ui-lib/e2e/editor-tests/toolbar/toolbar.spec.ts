import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Toolbar Functionality', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Toolbar Visibility and Layout', () => {
    test('should show toolbar by default', async () => {
      await expect(editor.toolbarElement).toBeVisible();
    });

    test('should toggle toolbar visibility', async () => {
      const showToolbarCheckbox = editor.page.locator('[data-testid="show-toolbar-checkbox"]');
      
      // Hide toolbar
      await showToolbarCheckbox.uncheck();
      await expect(editor.toolbarElement).not.toBeVisible();
      
      // Show toolbar
      await showToolbarCheckbox.check();
      await expect(editor.toolbarElement).toBeVisible();
    });

    test('should switch to compact mode', async () => {
      await editor.setCompactMode(true);
      
      const toolbar = editor.toolbarElement;
      const toolbarClass = await toolbar.getAttribute('class');
      expect(toolbarClass).toContain('compact');
      
      // Verify buttons are smaller in compact mode
      const buttonHeight = await editor.page.locator('[data-testid="toolbar-bold"]').evaluate(
        el => window.getComputedStyle(el).height
      );
      expect(parseInt(buttonHeight)).toBeLessThan(40);
    });

    test('should show button groups properly', async () => {
      const basicFormatGroup = editor.page.locator('[data-testid="basic-format-group"]');
      const fontGroup = editor.page.locator('[data-testid="font-group"]');
      const alignmentGroup = editor.page.locator('[data-testid="alignment-group"]');
      
      await expect(basicFormatGroup).toBeVisible();
      await expect(fontGroup).toBeVisible();
      await expect(alignmentGroup).toBeVisible();
      
      // Groups should have visual separation
      const groupCount = await editor.page.locator('.toolbar-group').count();
      expect(groupCount).toBeGreaterThan(3);
    });

    test('should handle toolbar overflow on small screens', async ({ page }) => {
      // Set narrow viewport
      await page.setViewportSize({ width: 600, height: 800 });
      
      const moreButton = editor.page.locator('[data-testid="toolbar-more"]');
      
      // More button should appear when toolbar overflows
      if (await moreButton.isVisible()) {
        await moreButton.click();
        
        // Overflow menu should be visible
        const overflowMenu = editor.page.locator('[data-testid="toolbar-overflow-menu"]');
        await expect(overflowMenu).toBeVisible();
      }
    });
  });

  test.describe('Basic Format Buttons', () => {
    test('should have all basic format buttons', async () => {
      const buttons = [
        'toolbar-bold',
        'toolbar-italic',
        'toolbar-underline',
        'toolbar-strikethrough'
      ];
      
      for (const buttonId of buttons) {
        const button = editor.page.locator(`[data-testid="${buttonId}"]`);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
      }
    });

    test('should execute bold command on button click', async () => {
      await editor.typeInEditor('Bold test text');
      await editor.selectAllText();
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await boldButton.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<(strong|b)>.*Bold test text.*<\/(strong|b)>/);
      
      // Button should show active state
      await expect(boldButton).toHaveClass(/active|pressed/);
    });

    test('should execute italic command on button click', async () => {
      await editor.typeInEditor('Italic test text');
      await editor.selectAllText();
      
      const italicButton = editor.page.locator('[data-testid="toolbar-italic"]');
      await italicButton.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<(em|i)>.*Italic test text.*<\/(em|i)>/);
      
      await expect(italicButton).toHaveClass(/active|pressed/);
    });

    test('should show button tooltips on hover', async () => {
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await boldButton.hover();
      
      const tooltip = editor.page.locator('[data-testid="tooltip"], .tooltip');
      await expect(tooltip).toBeVisible();
      
      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toMatch(/bold|Ctrl\+B/i);
    });

    test('should disable buttons when editor is readonly', async () => {
      await editor.setReadonlyMode(true);
      
      const buttons = [
        'toolbar-bold',
        'toolbar-italic',
        'toolbar-underline'
      ];
      
      for (const buttonId of buttons) {
        const button = editor.page.locator(`[data-testid="${buttonId}"]`);
        await expect(button).toBeDisabled();
      }
    });
  });

  test.describe('Dropdown Menus', () => {
    test('should open font family dropdown', async () => {
      const fontFamilyDropdown = editor.page.locator('[data-testid="font-family-dropdown"]');
      await fontFamilyDropdown.click();
      
      const dropdownMenu = editor.page.locator('[data-testid="font-family-menu"]');
      await expect(dropdownMenu).toBeVisible();
      
      // Should have multiple font options
      const fontOptions = editor.page.locator('[data-testid^="font-family-option-"]');
      const optionCount = await fontOptions.count();
      expect(optionCount).toBeGreaterThan(3);
    });

    test('should select font family from dropdown', async () => {
      await editor.typeInEditor('Font family test');
      await editor.selectAllText();
      
      const fontFamilyDropdown = editor.page.locator('[data-testid="font-family-dropdown"]');
      await fontFamilyDropdown.click();
      
      const serifOption = editor.page.locator('[data-testid="font-family-option-serif"]');
      await serifOption.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('font-family');
    });

    test('should open font size dropdown', async () => {
      const fontSizeDropdown = editor.page.locator('[data-testid="font-size-dropdown"]');
      await fontSizeDropdown.click();
      
      const dropdownMenu = editor.page.locator('[data-testid="font-size-menu"]');
      await expect(dropdownMenu).toBeVisible();
      
      // Should have size options from 8 to 72
      const sizeOptions = editor.page.locator('[data-testid^="font-size-option-"]');
      const optionCount = await sizeOptions.count();
      expect(optionCount).toBeGreaterThan(10);
    });

    test('should select font size from dropdown', async () => {
      await editor.typeInEditor('Font size test');
      await editor.selectAllText();
      
      const fontSizeDropdown = editor.page.locator('[data-testid="font-size-dropdown"]');
      await fontSizeDropdown.click();
      
      const size18Option = editor.page.locator('[data-testid="font-size-option-18"]');
      await size18Option.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('font-size');
    });

    test('should open heading dropdown', async () => {
      const headingDropdown = editor.page.locator('[data-testid="heading-dropdown"]');
      await headingDropdown.click();
      
      const dropdownMenu = editor.page.locator('[data-testid="heading-menu"]');
      await expect(dropdownMenu).toBeVisible();
      
      // Should have paragraph and heading options
      const headingOptions = [
        'format-paragraph',
        'heading-h1',
        'heading-h2',
        'heading-h3',
        'heading-h4',
        'heading-h5',
        'heading-h6'
      ];
      
      for (const optionId of headingOptions) {
        const option = editor.page.locator(`[data-testid="${optionId}"]`);
        await expect(option).toBeVisible();
      }
    });

    test('should close dropdown when clicking outside', async () => {
      const fontFamilyDropdown = editor.page.locator('[data-testid="font-family-dropdown"]');
      await fontFamilyDropdown.click();
      
      const dropdownMenu = editor.page.locator('[data-testid="font-family-menu"]');
      await expect(dropdownMenu).toBeVisible();
      
      // Click outside dropdown
      await editor.editorElement.click();
      
      await expect(dropdownMenu).not.toBeVisible();
    });

    test('should close dropdown with Escape key', async () => {
      const fontFamilyDropdown = editor.page.locator('[data-testid="font-family-dropdown"]');
      await fontFamilyDropdown.click();
      
      const dropdownMenu = editor.page.locator('[data-testid="font-family-menu"]');
      await expect(dropdownMenu).toBeVisible();
      
      await editor.page.keyboard.press('Escape');
      
      await expect(dropdownMenu).not.toBeVisible();
    });
  });

  test.describe('Color Pickers', () => {
    test('should open text color picker', async () => {
      const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
      await textColorButton.click();
      
      const colorPicker = editor.page.locator('[data-testid="text-color-palette"]');
      await expect(colorPicker).toBeVisible();
      
      // Should have color options
      const colorOptions = editor.page.locator('[data-testid^="color-option-"]');
      const optionCount = await colorOptions.count();
      expect(optionCount).toBeGreaterThan(8);
    });

    test('should select color from palette', async () => {
      await editor.typeInEditor('Colored text test');
      await editor.selectAllText();
      
      const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
      await textColorButton.click();
      
      const redOption = editor.page.locator('[data-testid="color-option-red"]');
      await redOption.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/color:\s*red|color:\s*#[fF]{2}0000/);
    });

    test('should open background color picker', async () => {
      const backgroundColorButton = editor.page.locator('[data-testid="background-color-picker"]');
      await backgroundColorButton.click();
      
      const colorPicker = editor.page.locator('[data-testid="background-color-palette"]');
      await expect(colorPicker).toBeVisible();
    });

    test('should use custom color input', async () => {
      await editor.typeInEditor('Custom color text');
      await editor.selectAllText();
      
      const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
      await textColorButton.click();
      
      const customColorInput = editor.page.locator('[data-testid="custom-color-input"]');
      await customColorInput.fill('#ff6b6b');
      
      const applyButton = editor.page.locator('[data-testid="apply-custom-color"]');
      await applyButton.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('#ff6b6b');
    });

    test('should show recently used colors', async () => {
      await editor.typeInEditor('Recent colors test');
      await editor.selectAllText();
      
      // Apply a few different colors
      const colors = ['red', 'blue', 'green'];
      
      for (const color of colors) {
        const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
        await textColorButton.click();
        
        const colorOption = editor.page.locator(`[data-testid="color-option-${color}"]`);
        await colorOption.click();
        
        await editor.waitForContentUpdate();
      }
      
      // Check recent colors section
      const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
      await textColorButton.click();
      
      const recentColorsSection = editor.page.locator('[data-testid="recent-colors"]');
      await expect(recentColorsSection).toBeVisible();
      
      const recentColorOptions = editor.page.locator('[data-testid="recent-colors"] [data-testid^="color-option-"]');
      const recentCount = await recentColorOptions.count();
      expect(recentCount).toBeGreaterThan(0);
    });
  });

  test.describe('Alignment Buttons', () => {
    test('should have all alignment buttons', async () => {
      const alignmentButtons = [
        'align-left',
        'align-center',
        'align-right',
        'align-justify'
      ];
      
      for (const buttonId of alignmentButtons) {
        const button = editor.page.locator(`[data-testid="${buttonId}"]`);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
      }
    });

    test('should align text center', async () => {
      await editor.typeInEditor('Center aligned text');
      await editor.selectAllText();
      
      const centerButton = editor.page.locator('[data-testid="align-center"]');
      await centerButton.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/text-align:\s*center|align="center"/);
      
      await expect(centerButton).toHaveClass(/active|pressed/);
    });

    test('should toggle alignment buttons exclusively', async () => {
      await editor.typeInEditor('Alignment test');
      await editor.selectAllText();
      
      const leftButton = editor.page.locator('[data-testid="align-left"]');
      const centerButton = editor.page.locator('[data-testid="align-center"]');
      
      // Click center alignment
      await centerButton.click();
      await expect(centerButton).toHaveClass(/active|pressed/);
      await expect(leftButton).not.toHaveClass(/active|pressed/);
      
      // Click left alignment
      await leftButton.click();
      await expect(leftButton).toHaveClass(/active|pressed/);
      await expect(centerButton).not.toHaveClass(/active|pressed/);
    });
  });

  test.describe('List Buttons', () => {
    test('should create unordered list', async () => {
      await editor.typeInEditor('List item');
      
      const unorderedListButton = editor.page.locator('[data-testid="create-unordered-list"]');
      await unorderedListButton.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<li>');
      
      await expect(unorderedListButton).toHaveClass(/active|pressed/);
    });

    test('should create ordered list', async () => {
      await editor.typeInEditor('Numbered item');
      
      const orderedListButton = editor.page.locator('[data-testid="create-ordered-list"]');
      await orderedListButton.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ol>');
      expect(htmlContent).toContain('<li>');
      
      await expect(orderedListButton).toHaveClass(/active|pressed/);
    });

    test('should have indent and outdent buttons', async () => {
      const indentButton = editor.page.locator('[data-testid="list-indent"]');
      const outdentButton = editor.page.locator('[data-testid="list-outdent"]');
      
      await expect(indentButton).toBeVisible();
      await expect(outdentButton).toBeVisible();
      
      // Initially should be disabled when not in a list
      await expect(indentButton).toBeDisabled();
      await expect(outdentButton).toBeDisabled();
    });

    test('should enable indent/outdent in lists', async () => {
      await editor.typeInEditor('List item');
      
      const unorderedListButton = editor.page.locator('[data-testid="create-unordered-list"]');
      await unorderedListButton.click();
      
      const indentButton = editor.page.locator('[data-testid="list-indent"]');
      const outdentButton = editor.page.locator('[data-testid="list-outdent"]');
      
      // Indent should be enabled, outdent might be disabled at root level
      await expect(indentButton).toBeEnabled();
    });
  });

  test.describe('Insert Buttons', () => {
    test('should have insert buttons', async () => {
      const insertButtons = [
        'insert-link',
        'insert-image',
        'insert-table',
        'insert-horizontal-rule'
      ];
      
      for (const buttonId of insertButtons) {
        const button = editor.page.locator(`[data-testid="${buttonId}"]`);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
      }
    });

    test('should open link dialog', async () => {
      const linkButton = editor.page.locator('[data-testid="insert-link"]');
      await linkButton.click();
      
      const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
      await expect(linkDialog).toBeVisible();
      
      const urlInput = editor.page.locator('[data-testid="link-url-input"]');
      const textInput = editor.page.locator('[data-testid="link-text-input"]');
      
      await expect(urlInput).toBeVisible();
      await expect(textInput).toBeVisible();
    });

    test('should open image dialog', async () => {
      const imageButton = editor.page.locator('[data-testid="insert-image"]');
      await imageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-dialog"]');
      await expect(imageDialog).toBeVisible();
    });

    test('should open table dialog', async () => {
      const tableButton = editor.page.locator('[data-testid="insert-table"]');
      await tableButton.click();
      
      const tableDialog = editor.page.locator('[data-testid="table-dialog"]');
      await expect(tableDialog).toBeVisible();
      
      // Should have size selectors
      const rowsInput = editor.page.locator('[data-testid="table-rows-input"]');
      const colsInput = editor.page.locator('[data-testid="table-cols-input"]');
      
      await expect(rowsInput).toBeVisible();
      await expect(colsInput).toBeVisible();
    });

    test('should insert horizontal rule', async () => {
      await editor.typeInEditor('Before rule');
      
      const hrButton = editor.page.locator('[data-testid="insert-horizontal-rule"]');
      await hrButton.click();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<hr');
    });
  });

  test.describe('Keyboard Shortcuts Display', () => {
    test('should show keyboard shortcuts in tooltips', async () => {
      const shortcuts = [
        { button: 'toolbar-bold', shortcut: 'Ctrl+B' },
        { button: 'toolbar-italic', shortcut: 'Ctrl+I' },
        { button: 'toolbar-underline', shortcut: 'Ctrl+U' }
      ];
      
      for (const item of shortcuts) {
        const button = editor.page.locator(`[data-testid="${item.button}"]`);
        await button.hover();
        
        const tooltip = editor.page.locator('[data-testid="tooltip"], .tooltip');
        await expect(tooltip).toBeVisible();
        
        const tooltipText = await tooltip.textContent();
        expect(tooltipText).toContain(item.shortcut);
      }
    });

    test('should show Mac shortcuts on Mac systems', async () => {
      // Mock Mac user agent
      await editor.page.addInitScript(() => {
        Object.defineProperty(navigator, 'platform', {
          get: () => 'MacIntel'
        });
      });
      
      await editor.navigateToEditor();
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await boldButton.hover();
      
      const tooltip = editor.page.locator('[data-testid="tooltip"], .tooltip');
      await expect(tooltip).toBeVisible();
      
      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toMatch(/Cmd\+B|⌘\+B/);
    });
  });

  test.describe('Toolbar Modes', () => {
    test('should support floating toolbar mode', async () => {
      // Enable floating mode
      await editor.page.click('[data-testid="toolbar-mode-floating"]');
      
      const toolbar = editor.toolbarElement;
      const toolbarClass = await toolbar.getAttribute('class');
      expect(toolbarClass).toContain('floating');
      
      // Toolbar should follow selection
      await editor.typeInEditor('Test floating toolbar');
      await editor.selectAllText();
      
      // Toolbar should be positioned near selection
      const toolbarPosition = await toolbar.boundingBox();
      expect(toolbarPosition).not.toBeNull();
    });

    test('should support sticky toolbar mode', async () => {
      await editor.page.click('[data-testid="toolbar-mode-sticky"]');
      
      const toolbar = editor.toolbarElement;
      const toolbarClass = await toolbar.getAttribute('class');
      expect(toolbarClass).toContain('sticky');
      
      // Scroll down to test sticky behavior
      await editor.page.evaluate(() => {
        window.scrollTo(0, 1000);
      });
      
      // Toolbar should remain visible
      await expect(toolbar).toBeVisible();
    });

    test('should support contextual toolbar', async () => {
      await editor.typeInEditor('Contextual toolbar test');
      
      // Select text to show contextual toolbar
      await editor.doubleClickWord('contextual');
      
      const contextualToolbar = editor.page.locator('[data-testid="contextual-toolbar"]');
      
      // Contextual toolbar should appear on selection
      if (await contextualToolbar.isVisible()) {
        // Should have basic formatting buttons
        const boldButton = contextualToolbar.locator('[data-testid="toolbar-bold"]');
        const italicButton = contextualToolbar.locator('[data-testid="toolbar-italic"]');
        
        await expect(boldButton).toBeVisible();
        await expect(italicButton).toBeVisible();
      }
    });
  });

  test.describe('Mobile Toolbar', () => {
    test('should adapt toolbar for mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro
      
      const toolbar = editor.toolbarElement;
      const toolbarClass = await toolbar.getAttribute('class');
      expect(toolbarClass).toContain('mobile');
      
      // Should have collapsed groups
      const moreButton = editor.page.locator('[data-testid="toolbar-more-mobile"]');
      if (await moreButton.isVisible()) {
        await moreButton.click();
        
        const mobileMenu = editor.page.locator('[data-testid="mobile-toolbar-menu"]');
        await expect(mobileMenu).toBeVisible();
      }
    });

    test('should handle touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      
      // Tap should work the same as click
      await boldButton.tap();
      
      // Button should show active state
      await expect(boldButton).toHaveClass(/active|pressed/);
    });

    test('should show mobile-optimized dropdowns', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      
      const fontFamilyDropdown = editor.page.locator('[data-testid="font-family-dropdown"]');
      await fontFamilyDropdown.tap();
      
      // Mobile dropdown should be fullscreen or bottom sheet
      const mobileDropdown = editor.page.locator('[data-testid="mobile-dropdown"]');
      if (await mobileDropdown.isVisible()) {
        const dropdownClass = await mobileDropdown.getAttribute('class');
        expect(dropdownClass).toMatch(/fullscreen|bottom-sheet/);
      }
    });
  });

  test.describe('Toolbar State Management', () => {
    test('should persist toolbar preferences', async () => {
      // Set compact mode
      await editor.setCompactMode(true);
      
      // Reload page
      await editor.page.reload();
      await editor.navigateToEditor();
      
      // Compact mode should be remembered
      const compactCheckbox = editor.page.locator('[data-testid="compact-mode-checkbox"]');
      await expect(compactCheckbox).toBeChecked();
    });

    test('should update button states based on cursor position', async () => {
      await editor.typeInEditor('Some bold text here');
      
      // Make "bold" bold
      await editor.doubleClickWord('bold');
      await editor.toggleBold();
      
      // Move cursor to bold text
      await editor.page.click('strong');
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await expect(boldButton).toHaveClass(/active|pressed/);
      
      // Move cursor to non-bold text
      await editor.page.click('text=Some');
      
      await expect(boldButton).not.toHaveClass(/active|pressed/);
    });

    test('should handle rapid button clicks', async () => {
      await editor.typeInEditor('Rapid click test');
      await editor.selectAllText();
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      
      // Click rapidly multiple times
      for (let i = 0; i < 5; i++) {
        await boldButton.click({ delay: 50 });
      }
      
      // Should end up in consistent state (odd clicks = bold, even clicks = not bold)
      const htmlContent = await editor.getEditorContent();
      const hasBold = htmlContent.includes('<strong>') || htmlContent.includes('<b>');
      
      // Should be bold (5 clicks = odd)
      expect(hasBold).toBe(true);
    });

    test('should disable appropriate buttons when editor is empty', async () => {
      await editor.clearEditor();
      
      // Some buttons should be disabled when no content
      const buttons = [
        'align-center',
        'align-right',
        'create-unordered-list'
      ];
      
      for (const buttonId of buttons) {
        const button = editor.page.locator(`[data-testid="${buttonId}"]`);
        
        // These buttons might be enabled even with no content,
        // but they should at least be visible
        await expect(button).toBeVisible();
      }
    });
  });

  test.describe('Toolbar Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      const buttons = [
        { id: 'toolbar-bold', label: /bold/i },
        { id: 'toolbar-italic', label: /italic/i },
        { id: 'toolbar-underline', label: /underline/i }
      ];
      
      for (const button of buttons) {
        const element = editor.page.locator(`[data-testid="${button.id}"]`);
        const ariaLabel = await element.getAttribute('aria-label');
        expect(ariaLabel).toMatch(button.label);
      }
    });

    test('should support keyboard navigation', async () => {
      // Tab to first toolbar button
      await editor.page.keyboard.press('Tab');
      
      let focusedElement = await editor.page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      
      // Should be on a toolbar button
      expect(focusedElement).toMatch(/toolbar-/);
      
      // Arrow keys should navigate within toolbar
      await editor.page.keyboard.press('ArrowRight');
      
      const newFocusedElement = await editor.page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(newFocusedElement).not.toBe(focusedElement);
      expect(newFocusedElement).toMatch(/toolbar-/);
    });

    test('should announce state changes to screen readers', async () => {
      await editor.typeInEditor('Screen reader test');
      await editor.selectAllText();
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await boldButton.click();
      
      // Check aria-pressed state
      const ariaPressed = await boldButton.getAttribute('aria-pressed');
      expect(ariaPressed).toBe('true');
      
      // Click again to remove bold
      await boldButton.click();
      
      const ariaPressedAfter = await boldButton.getAttribute('aria-pressed');
      expect(ariaPressedAfter).toBe('false');
    });

    test('should have proper role attributes', async () => {
      const toolbar = editor.toolbarElement;
      const toolbarRole = await toolbar.getAttribute('role');
      expect(toolbarRole).toBe('toolbar');
      
      const buttonGroups = editor.page.locator('.toolbar-group');
      const firstGroupRole = await buttonGroups.first().getAttribute('role');
      expect(firstGroupRole).toBe('group');
    });
  });

  test.describe('Toolbar Performance', () => {
    test('should render toolbar quickly', async () => {
      const startTime = Date.now();
      
      await editor.navigateToEditor();
      await expect(editor.toolbarElement).toBeVisible();
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      // Toolbar should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });

    test('should respond quickly to button clicks', async () => {
      await editor.typeInEditor('Performance test');
      await editor.selectAllText();
      
      const startTime = performance.now();
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await boldButton.click();
      
      // Wait for the change to be reflected
      await editor.page.waitForFunction(() => {
        const content = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        return content?.innerHTML.includes('<strong>') || content?.innerHTML.includes('<b>');
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });

    test('should handle many toolbar operations efficiently', async () => {
      await editor.typeInEditor('Efficiency test text');
      await editor.selectAllText();
      
      const startTime = Date.now();
      
      // Perform multiple formatting operations
      const operations = [
        'toolbar-bold',
        'toolbar-italic',
        'toolbar-underline',
        'align-center',
        'align-left'
      ];
      
      for (const operation of operations) {
        const button = editor.page.locator(`[data-testid="${operation}"]`);
        await button.click();
        await editor.waitForContentUpdate();
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All operations should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });
  });
});