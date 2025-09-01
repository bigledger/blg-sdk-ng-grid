import { TestDataManager } from './data/test-data-manager';

async function globalTeardown() {
  // Clean up test data
  await TestDataManager.cleanup();
  
  console.log('Global teardown completed');
}

export default globalTeardown;