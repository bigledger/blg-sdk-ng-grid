import { FullConfig, chromium } from '@playwright/test';
import { TestDataManager } from './data/test-data-manager';

async function globalSetup(config: FullConfig) {
  // Initialize test data
  await TestDataManager.initialize();
  
  // Create a browser instance for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Pre-warm the application
  await page.goto('http://localhost:4200');
  await page.waitForLoadState('networkidle');
  
  // Any global authentication or setup can be done here
  console.log('Global setup completed');
  
  await browser.close();
}

export default globalSetup;