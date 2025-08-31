import { Page, expect, Locator } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}
  
  // Wait helpers
  async waitForElement(selector: string, timeout = 5000): Promise<Locator> {
    await this.page.waitForSelector(selector, { timeout });
    return this.page.locator(selector);
  }
  
  async waitForText(selector: string, text: string, timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      (args) => {
        const element = document.querySelector(args.selector);
        return element && element.textContent && element.textContent.includes(args.text);
      },
      { selector, text },
      { timeout }
    );
  }
  
  async waitForAttributeValue(selector: string, attribute: string, value: string, timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      (args) => {
        const element = document.querySelector(args.selector);
        return element && element.getAttribute(args.attribute) === args.value;
      },
      { selector, attribute, value },
      { timeout }
    );
  }
  
  // Visibility helpers
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }
  
  async isElementHidden(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isHidden();
    } catch {
      return true;
    }
  }
  
  // Interaction helpers
  async clickAndWait(selector: string, waitForSelector?: string): Promise<void> {
    await this.page.locator(selector).click();
    if (waitForSelector) {
      await this.waitForElement(waitForSelector);
    }
  }
  
  async doubleClickAndWait(selector: string, waitForSelector?: string): Promise<void> {
    await this.page.locator(selector).dblclick();
    if (waitForSelector) {
      await this.waitForElement(waitForSelector);
    }
  }
  
  async rightClickAndWait(selector: string, waitForSelector?: string): Promise<void> {
    await this.page.locator(selector).click({ button: 'right' });
    if (waitForSelector) {
      await this.waitForElement(waitForSelector);
    }
  }
  
  async hoverAndWait(selector: string, waitForSelector?: string): Promise<void> {
    await this.page.locator(selector).hover();
    if (waitForSelector) {
      await this.waitForElement(waitForSelector);
    }
  }
  
  // Form helpers
  async fillAndValidate(selector: string, value: string, expectedValue?: string): Promise<void> {
    const input = this.page.locator(selector);
    await input.fill(value);
    
    const actualValue = await input.inputValue();
    const expected = expectedValue || value;
    expect(actualValue).toBe(expected);
  }
  
  async selectOption(selector: string, option: string): Promise<void> {
    await this.page.locator(selector).selectOption(option);
  }
  
  async checkCheckbox(selector: string): Promise<void> {
    const checkbox = this.page.locator(selector);
    if (!await checkbox.isChecked()) {
      await checkbox.check();
    }
  }
  
  async uncheckCheckbox(selector: string): Promise<void> {
    const checkbox = this.page.locator(selector);
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
  }
  
  // Keyboard helpers
  async pressKeyAndWait(key: string, waitForSelector?: string): Promise<void> {
    await this.page.keyboard.press(key);
    if (waitForSelector) {
      await this.waitForElement(waitForSelector);
    }
  }
  
  async pressKeySequence(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.page.keyboard.press(key);
      await this.page.waitForTimeout(50); // Small delay between key presses
    }
  }
  
  async typeText(text: string, delay = 50): Promise<void> {
    await this.page.keyboard.type(text, { delay });
  }
  
  // Drag and drop helpers
  async dragAndDrop(sourceSelector: string, targetSelector: string): Promise<void> {
    const source = this.page.locator(sourceSelector);
    const target = this.page.locator(targetSelector);
    await source.dragTo(target);
  }
  
  async dragAndDropWithCoordinates(
    sourceSelector: string, 
    targetX: number, 
    targetY: number
  ): Promise<void> {
    const source = this.page.locator(sourceSelector);
    const sourceBox = await source.boundingBox();
    
    if (sourceBox) {
      await this.page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(targetX, targetY);
      await this.page.mouse.up();
    }
  }
  
  // Screenshot helpers
  async takeElementScreenshot(selector: string, filename: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.screenshot({ path: `screenshots/${filename}` });
  }
  
  async takeFullPageScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${filename}`, fullPage: true });
  }
  
  // Performance helpers
  async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
    const startTime = Date.now();
    const result = await fn();
    const time = Date.now() - startTime;
    return { result, time };
  }
  
  async getMemoryUsage(): Promise<number> {
    return await this.page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
  }
  
  async getPerformanceMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      };
    });
  }
  
  // Validation helpers
  async expectElementToBeVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }
  
  async expectElementToBeHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }
  
  async expectElementToHaveText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(text);
  }
  
  async expectElementToContainText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }
  
  async expectElementToHaveAttribute(selector: string, attribute: string, value: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveAttribute(attribute, value);
  }
  
  async expectElementToHaveClass(selector: string, className: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveClass(new RegExp(className));
  }
  
  async expectElementToHaveValue(selector: string, value: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveValue(value);
  }
  
  async expectElementToBeChecked(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeChecked();
  }
  
  async expectElementToBeDisabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeDisabled();
  }
  
  async expectElementToBeEnabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeEnabled();
  }
  
  // Browser helpers
  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }
  
  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear());
  }
  
  async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      (args) => localStorage.setItem(args.key, args.value),
      { key, value }
    );
  }
  
  async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate(
      (key) => localStorage.getItem(key),
      key
    );
  }
  
  async reloadAndWaitForSelector(selector: string): Promise<void> {
    await this.page.reload();
    await this.waitForElement(selector);
  }
  
  async navigateToAndWaitForSelector(url: string, selector: string): Promise<void> {
    await this.page.goto(url);
    await this.waitForElement(selector);
  }
}