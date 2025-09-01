import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Avatar Library E2E Tests
 */
export default defineConfig({
  testDir: './e2e/avatar',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. */
  reporter: [
    ['html', { outputFolder: 'test-results/avatar-html' }],
    ['junit', { outputFile: 'test-results/avatar-junit.xml' }],
    ['json', { outputFile: 'test-results/avatar-results.json' }]
  ],
  
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4200',
    
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    
    /* Take screenshot only on failures */
    screenshot: 'only-on-failure',
    
    /* Record video on first retry */
    video: 'retain-on-failure',
    
    /* Maximum time each action can take */
    actionTimeout: 10000,
    
    /* Maximum time each test can take */
    testTimeout: 60000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable performance API for memory monitoring
        launchOptions: {
          args: ['--enable-precise-memory-info', '--enable-chrome-browser-cloud-management']
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: [
        'performance.spec.ts', // Skip performance tests on mobile
        '3d-avatar.spec.ts'    // Skip 3D tests on mobile (may be resource intensive)
      ]
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: [
        'performance.spec.ts',
        '3d-avatar.spec.ts'
      ]
    },

    /* High performance testing project */
    {
      name: 'performance',
      testMatch: 'performance.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--enable-chrome-browser-cloud-management',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=TranslateUI',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
      timeout: 120000, // Longer timeout for performance tests
    },

    /* Accessibility testing project */
    {
      name: 'accessibility',
      testMatch: ['basic-avatar.spec.ts', 'customization.spec.ts', 'gestures.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        // Enable accessibility features
        launchOptions: {
          args: ['--force-prefers-reduced-motion', '--enable-features=AccessibilityExposeARIAAnnotations']
        }
      },
    },

    /* Visual regression testing project */
    {
      name: 'visual',
      testMatch: ['2d-avatar.spec.ts', '3d-avatar.spec.ts', 'customization.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        // Consistent viewport for visual tests
        viewport: { width: 1280, height: 720 },
      },
      expect: {
        // Visual comparison threshold
        threshold: 0.2,
      }
    },

    /* Streaming and real-time tests */
    {
      name: 'streaming',
      testMatch: ['streaming.spec.ts', 'lip-sync.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        // Allow microphone access for audio tests
        launchOptions: {
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
        }
      },
      timeout: 90000, // Longer timeout for streaming tests
    }
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./utils/global-setup.ts'),
  globalTeardown: require.resolve('./utils/global-teardown.ts'),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start:avatar-demo',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Test output directory */
  outputDir: 'test-results/avatar',
  
  /* Expect configuration */
  expect: {
    // Global timeout for expect assertions
    timeout: 10000,
  },

  /* Metadata */
  metadata: {
    'test-suite': 'Avatar Library E2E Tests',
    'version': '1.0.0',
    'framework': 'Playwright + Angular',
    'components': [
      'Avatar Core',
      '2D Avatar Rendering',
      '3D Avatar Rendering', 
      'Text-to-Speech & Lip Sync',
      'Avatar Customization',
      'WebSocket Streaming',
      'Gesture Animation',
      'Performance Monitoring'
    ]
  }
});