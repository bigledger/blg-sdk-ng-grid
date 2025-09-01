import { FullConfig } from '@playwright/test';

/**
 * Global teardown for avatar tests
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up Avatar Library E2E Tests...');

  // Stop WebSocket mock server
  const mockServer = (global as any).avatarMockServer;
  if (mockServer) {
    try {
      await mockServer.stop();
      console.log('✅ WebSocket mock server stopped');
    } catch (error) {
      console.warn('⚠️ Failed to stop WebSocket mock server:', error);
    }
  }

  // Clean up any temporary files
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const tempDir = path.join(__dirname, '../temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('✅ Temporary files cleaned up');
    }
  } catch (error) {
    console.warn('⚠️ Failed to clean up temporary files:', error);
  }

  console.log('✅ Avatar Library E2E Tests cleanup complete');
}

export default globalTeardown;