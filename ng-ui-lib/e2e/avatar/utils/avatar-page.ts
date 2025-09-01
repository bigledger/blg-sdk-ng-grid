import { Page, Locator, expect } from '@playwright/test';
import { AvatarConfig, AvatarAppearance, AvatarBehavior } from '../../../libs/avatar-core/src/lib/interfaces/avatar-config.interface';

/**
 * Page Object Model for Avatar components testing
 */
export class AvatarPage {
  readonly page: Page;
  
  // Main avatar container
  readonly avatarContainer: Locator;
  
  // 2D Avatar elements
  readonly canvas2D: Locator;
  readonly svgContainer: Locator;
  readonly avatar2DContainer: Locator;
  
  // 3D Avatar elements
  readonly canvas3D: Locator;
  readonly avatar3DContainer: Locator;
  readonly webglContext: Locator;
  
  // TTS elements
  readonly audioElement: Locator;
  readonly ttsControls: Locator;
  readonly voiceSelector: Locator;
  
  // Control panels
  readonly controlPanel: Locator;
  readonly customizerPanel: Locator;
  readonly performanceOverlay: Locator;
  
  // Expression controls
  readonly expressionButtons: Locator;
  readonly gestureButtons: Locator;
  readonly lipSyncControls: Locator;
  
  // Loading states
  readonly loadingIndicator: Locator;
  readonly loadingText: Locator;
  
  // Error states
  readonly errorMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Main containers
    this.avatarContainer = page.locator('.avatar-container');
    this.avatar2DContainer = page.locator('ng-ui-avatar-2d');
    this.avatar3DContainer = page.locator('ng-ui-avatar-3d');
    
    // Rendering elements
    this.canvas2D = page.locator('.avatar-canvas');
    this.svgContainer = page.locator('.avatar-svg-container');
    this.canvas3D = page.locator('.avatar-3d-canvas');
    this.webglContext = page.locator('canvas[data-engine="three.js"]');
    
    // Audio elements
    this.audioElement = page.locator('audio');
    this.ttsControls = page.locator('.tts-controls');
    this.voiceSelector = page.locator('select[data-testid="voice-selector"]');
    
    // Control panels
    this.controlPanel = page.locator('.avatar-controls');
    this.customizerPanel = page.locator('.customizer-panel');
    this.performanceOverlay = page.locator('.performance-overlay');
    
    // Interactive elements
    this.expressionButtons = page.locator('.control-group:has-text("Expressions") .control-btn');
    this.gestureButtons = page.locator('.control-group:has-text("Gestures") .control-btn');
    this.lipSyncControls = page.locator('.control-group:has-text("Lip Sync")');
    
    // Loading and error states
    this.loadingIndicator = page.locator('.loading-spinner');
    this.loadingText = page.locator('.loading-text');
    this.errorMessage = page.locator('.error-message, .alert-danger');
  }

  /**
   * Navigate to avatar test page
   */
  async goto(path = '/avatar-demo'): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Allow for animations
  }

  /**
   * Wait for avatar to initialize
   */
  async waitForAvatarInit(): Promise<void> {
    await expect(this.loadingIndicator).toBeHidden({ timeout: 30000 });
    await this.page.waitForFunction(() => {
      const avatar = document.querySelector('lib-avatar-core, ng-ui-avatar-2d, ng-ui-avatar-3d');
      return avatar && avatar.classList.contains('initialized');
    }, { timeout: 30000 });
  }

  /**
   * Initialize 2D avatar with configuration
   */
  async init2DAvatar(config?: Partial<AvatarConfig>): Promise<void> {
    if (config) {
      await this.page.evaluate((config) => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.initializeAvatar) {
          avatar.initializeAvatar(config);
        }
      }, config);
    }
    
    await this.waitForAvatarInit();
    await expect(this.canvas2D.or(this.svgContainer)).toBeVisible();
  }

  /**
   * Initialize 3D avatar with configuration
   */
  async init3DAvatar(config?: Partial<AvatarConfig>): Promise<void> {
    if (config) {
      await this.page.evaluate((config) => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.initializeAvatar) {
          avatar.initializeAvatar(config);
        }
      }, config);
    }
    
    await this.waitForAvatarInit();
    await expect(this.canvas3D).toBeVisible();
  }

  /**
   * Change avatar expression
   */
  async changeExpression(expressionName: string): Promise<void> {
    const button = this.expressionButtons.filter({ hasText: expressionName });
    await button.click();
    await this.page.waitForTimeout(500); // Wait for animation
  }

  /**
   * Trigger gesture
   */
  async performGesture(gestureName: string): Promise<void> {
    const button = this.gestureButtons.filter({ hasText: gestureName });
    await button.click();
    await this.waitForGestureComplete();
  }

  /**
   * Wait for gesture animation to complete
   */
  async waitForGestureComplete(): Promise<void> {
    await this.page.waitForFunction(() => {
      const avatar = document.querySelector('.avatar-container') as any;
      return !avatar?.classList.contains('gesture-playing');
    }, { timeout: 10000 });
  }

  /**
   * Start text-to-speech
   */
  async speakText(text: string, voice?: string): Promise<void> {
    if (voice) {
      await this.voiceSelector.selectOption(voice);
    }
    
    await this.page.evaluate((text) => {
      const avatar = document.querySelector('lib-avatar-core') as any;
      if (avatar && avatar.speak) {
        avatar.speak(text);
      }
    }, text);
  }

  /**
   * Load audio file for lip sync
   */
  async loadAudioFile(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"][accept="audio/*"]');
    await fileInput.setInputFiles(filePath);
    await this.waitForAudioProcessing();
  }

  /**
   * Wait for audio processing to complete
   */
  async waitForAudioProcessing(): Promise<void> {
    await expect(this.loadingText).toHaveText(/processing audio/i, { timeout: 30000 });
    await expect(this.loadingIndicator).toBeHidden({ timeout: 30000 });
  }

  /**
   * Start lip sync
   */
  async startLipSync(): Promise<void> {
    const startButton = this.lipSyncControls.locator('button:has-text("Start")');
    await startButton.click();
    
    // Wait for lip sync to start
    await this.page.waitForFunction(() => {
      const avatar = document.querySelector('lib-avatar-core') as any;
      return avatar?.isLipSyncPlaying?.();
    }, { timeout: 5000 });
  }

  /**
   * Stop lip sync
   */
  async stopLipSync(): Promise<void> {
    const stopButton = this.lipSyncControls.locator('button:has-text("Stop")');
    await stopButton.click();
    
    // Wait for lip sync to stop
    await this.page.waitForFunction(() => {
      const avatar = document.querySelector('lib-avatar-core') as any;
      return !avatar?.isLipSyncPlaying?.();
    }, { timeout: 5000 });
  }

  /**
   * Switch render mode (canvas/svg for 2D)
   */
  async switchRenderMode(mode: 'canvas' | 'svg'): Promise<void> {
    const button = this.controlPanel.locator(`button:has-text("${mode === 'canvas' ? 'Canvas' : 'SVG'}")`);
    await button.click();
    await this.page.waitForTimeout(1000); // Wait for renderer switch
  }

  /**
   * Toggle customizer panel
   */
  async toggleCustomizer(): Promise<void> {
    const toggle = this.page.locator('[data-testid="customizer-toggle"]');
    await toggle.click();
  }

  /**
   * Customize avatar appearance
   */
  async customizeAppearance(options: Partial<AvatarAppearance>): Promise<void> {
    if (!await this.customizerPanel.isVisible()) {
      await this.toggleCustomizer();
    }

    if (options.model) {
      await this.page.locator(`[data-testid="model-${options.model}"]`).click();
    }

    if (options.skinTone) {
      await this.page.locator(`[data-testid="skin-${options.skinTone}"]`).click();
    }

    if (options.hair?.style) {
      await this.page.locator(`[data-testid="hair-style-${options.hair.style}"]`).click();
    }

    if (options.hair?.color) {
      await this.page.locator(`[data-testid="hair-color"]`).fill(options.hair.color);
    }

    // Wait for customization to apply
    await this.page.waitForTimeout(1000);
  }

  /**
   * Export avatar as image
   */
  async exportAsPNG(): Promise<void> {
    const exportButton = this.controlPanel.locator('button:has-text("PNG")');
    
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await exportButton.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('avatar.png');
  }

  /**
   * Export avatar as SVG
   */
  async exportAsSVG(): Promise<void> {
    const exportButton = this.controlPanel.locator('button:has-text("SVG")');
    
    const downloadPromise = this.page.waitForEvent('download');
    await exportButton.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('avatar.svg');
  }

  /**
   * Get avatar performance stats
   */
  async getPerformanceStats(): Promise<{
    fps: number;
    renderTime: number;
    layersRendered: number;
    totalFrames: number;
  }> {
    return await this.page.evaluate(() => {
      const fpsElement = document.querySelector('.fps-counter');
      const statsElement = document.querySelector('.render-stats');
      
      if (!fpsElement || !statsElement) {
        throw new Error('Performance stats not available');
      }

      const fps = parseInt(fpsElement.textContent?.match(/FPS: (\d+)/)?.[1] || '0');
      const renderTime = parseFloat(statsElement.textContent?.match(/Render Time: ([\d.]+)ms/)?.[1] || '0');
      const layersRendered = parseInt(statsElement.textContent?.match(/Layers: (\d+)/)?.[1] || '0');
      const totalFrames = parseInt(statsElement.textContent?.match(/Total Frames: (\d+)/)?.[1] || '0');

      return { fps, renderTime, layersRendered, totalFrames };
    });
  }

  /**
   * Take screenshot of avatar
   */
  async takeAvatarScreenshot(name: string): Promise<Buffer> {
    const element = this.avatarContainer;
    return await element.screenshot({ path: `test-results/${name}-avatar.png` });
  }

  /**
   * Get canvas rendering context info
   */
  async getCanvasInfo(): Promise<{
    width: number;
    height: number;
    type: 'canvas' | 'svg';
    isRendering: boolean;
  }> {
    return await this.page.evaluate(() => {
      const canvas = document.querySelector('.avatar-canvas') as HTMLCanvasElement;
      const svg = document.querySelector('.avatar-svg-container');
      
      if (canvas) {
        return {
          width: canvas.width,
          height: canvas.height,
          type: 'canvas' as const,
          isRendering: !canvas.classList.contains('paused')
        };
      } else if (svg) {
        const rect = svg.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          type: 'svg' as const,
          isRendering: true
        };
      }
      
      throw new Error('No rendering element found');
    });
  }

  /**
   * Wait for WebSocket connection
   */
  async waitForWebSocketConnection(): Promise<void> {
    await this.page.waitForFunction(() => {
      return (window as any).avatarWebSocket?.readyState === WebSocket.OPEN;
    }, { timeout: 10000 });
  }

  /**
   * Send WebSocket message
   */
  async sendWebSocketMessage(message: any): Promise<void> {
    await this.page.evaluate((msg) => {
      const ws = (window as any).avatarWebSocket;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      } else {
        throw new Error('WebSocket not connected');
      }
    }, message);
  }

  /**
   * Wait for avatar to be idle (not animating)
   */
  async waitForIdle(): Promise<void> {
    await this.page.waitForFunction(() => {
      const avatar = document.querySelector('.avatar-container') as any;
      return !avatar?.classList.contains('animating') && 
             !avatar?.classList.contains('lip-sync-playing') &&
             !avatar?.classList.contains('gesture-playing');
    }, { timeout: 10000 });
  }

  /**
   * Assert avatar is visible and rendered
   */
  async assertAvatarRendered(): Promise<void> {
    await expect(this.avatarContainer).toBeVisible();
    
    // Check that either canvas or SVG is present and has content
    const hasCanvas = await this.canvas2D.isVisible();
    const hasSVG = await this.svgContainer.isVisible();
    const has3D = await this.canvas3D.isVisible();
    
    expect(hasCanvas || hasSVG || has3D).toBe(true);
    
    // Verify no error messages
    await expect(this.errorMessage).not.toBeVisible();
  }

  /**
   * Assert expression is active
   */
  async assertExpressionActive(expressionName: string): Promise<void> {
    const button = this.expressionButtons.filter({ hasText: expressionName });
    await expect(button).toHaveClass(/active/);
  }

  /**
   * Assert gesture is playing
   */
  async assertGesturePlaying(gestureName: string): Promise<void> {
    const button = this.gestureButtons.filter({ hasText: gestureName });
    await expect(button).toHaveClass(/active/);
  }

  /**
   * Assert lip sync is active
   */
  async assertLipSyncActive(): Promise<void> {
    const isActive = await this.page.evaluate(() => {
      const avatar = document.querySelector('lib-avatar-core') as any;
      return avatar?.isLipSyncPlaying?.() || false;
    });
    expect(isActive).toBe(true);
  }

  /**
   * Get current avatar state
   */
  async getAvatarState(): Promise<any> {
    return await this.page.evaluate(() => {
      const avatar = document.querySelector('lib-avatar-core') as any;
      return avatar?.getStatistics?.() || {};
    });
  }

  /**
   * Wait for specific number of frames to render
   */
  async waitForFrames(frameCount: number, timeout = 10000): Promise<void> {
    const startTime = Date.now();
    
    await this.page.waitForFunction((count) => {
      const stats = document.querySelector('.render-stats');
      if (!stats) return false;
      
      const totalFrames = parseInt(stats.textContent?.match(/Total Frames: (\d+)/)?.[1] || '0');
      return totalFrames >= count;
    }, frameCount, { timeout });
  }

  /**
   * Monitor memory usage during operations
   */
  async monitorMemoryUsage(): Promise<{
    heapUsed: number;
    heapTotal: number;
    external: number;
  }> {
    return await this.page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          heapUsed: memory.usedJSHeapSize,
          heapTotal: memory.totalJSHeapSize,
          external: memory.externalJSHeapSize || 0
        };
      }
      return { heapUsed: 0, heapTotal: 0, external: 0 };
    });
  }
}