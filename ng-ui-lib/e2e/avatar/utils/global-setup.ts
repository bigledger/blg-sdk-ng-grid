import { chromium, FullConfig } from '@playwright/test';
import { generateTestAudioFiles } from '../fixtures/test-audio';
import { AvatarWebSocketMock } from './websocket-mock';

/**
 * Global setup for avatar tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Avatar Library E2E Tests...');

  // Generate test audio files
  try {
    console.log('📄 Generating test audio files...');
    await generateTestAudioFiles();
    console.log('✅ Test audio files generated');
  } catch (error) {
    console.warn('⚠️ Failed to generate test audio files:', error);
  }

  // Start WebSocket mock server for streaming tests
  const mockServer = new AvatarWebSocketMock(8081);
  try {
    await mockServer.start();
    console.log('✅ WebSocket mock server started on port 8081');
    
    // Store server instance for cleanup
    (global as any).avatarMockServer = mockServer;
  } catch (error) {
    console.warn('⚠️ Failed to start WebSocket mock server:', error);
  }

  // Warm up browser for consistent performance measurements
  console.log('🔥 Warming up browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('data:text/html,<html><body>Warmup</body></html>');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.warn('⚠️ Browser warmup failed:', error);
  } finally {
    await browser.close();
  }

  console.log('✅ Avatar Library E2E Tests setup complete');
}

export default globalSetup;