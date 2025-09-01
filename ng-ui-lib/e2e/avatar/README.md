# Avatar Library E2E Tests

Comprehensive end-to-end testing suite for the Avatar Library using Playwright, covering all avatar functionality including 2D/3D rendering, TTS, lip sync, gestures, customization, and performance.

## 🎯 Test Coverage Overview

### ✅ **Basic Avatar Rendering** (`basic-avatar.spec.ts`)
- Avatar core initialization and configuration
- State management and lifecycle
- Error handling and recovery
- Accessibility compliance
- Cross-browser compatibility
- Resource cleanup and memory management

### ✅ **2D Avatar Functionality** (`2d-avatar.spec.ts`)
- Canvas and SVG rendering modes
- Facial expression animations
- Character template switching
- Real-time customization
- Quality settings and performance optimization
- Animation blending and transitions

### ✅ **3D Avatar Functionality** (`3d-avatar.spec.ts`)
- 3D model loading and WebGL rendering
- Skeletal animations and inverse kinematics
- Camera controls and lighting systems
- Level of Detail (LOD) optimization
- Material system and PBR rendering
- WebGL compatibility and fallbacks

### ✅ **TTS & Lip Sync** (`lip-sync.spec.ts`)
- Text-to-speech synthesis with multiple providers
- Real-time audio processing and analysis
- Phoneme detection and viseme mapping
- Lip sync accuracy and timing
- Multi-language support
- Audio format compatibility

### ✅ **Avatar Customization** (`customization.spec.ts`)
- Appearance customization (models, skin, hair, clothing)
- Behavior and animation settings
- Advanced customization tools
- Preset saving and loading
- Real-time preview and validation
- Accessibility in customization interface

### ✅ **WebSocket Streaming** (`streaming.spec.ts`)
- Real-time WebSocket communication
- Message queuing and prioritization
- Connection management and recovery
- High-throughput message processing
- Security and input validation
- Performance under streaming load

### ✅ **Gesture Animation** (`gestures.spec.ts`)
- Predefined gesture playback
- Custom gesture creation and editing
- Automatic gesture generation during speech
- Motion capture data import
- Gesture blending and coordination
- Performance optimization

### ✅ **Performance Benchmarks** (`performance.spec.ts`)
- Initialization and runtime performance
- Memory management and leak detection
- Scalability with multiple avatars
- Stress testing and recovery
- Cross-browser performance comparison
- Regression detection

## 🏗️ Test Architecture

### Page Object Model
- **`AvatarPage`**: Main page object with avatar interaction methods
- **`AvatarTestDataGenerator`**: Test data and configuration factory
- **`AvatarWebSocketMock`**: Mock WebSocket server for streaming tests
- **`TestAudioGenerator`**: Audio test data generation utilities

### Test Structure
```
e2e/avatar/
├── utils/                    # Test utilities and helpers
│   ├── avatar-page.ts       # Page object model
│   ├── test-data-generator.ts # Test data factory
│   ├── websocket-mock.ts    # WebSocket mock server
│   ├── global-setup.ts      # Global test setup
│   └── global-teardown.ts   # Global test cleanup
├── fixtures/                # Test fixtures and data
│   ├── test-audio.ts       # Audio generation utilities
│   └── audio/              # Generated audio files
├── data/                    # Test data files
├── basic-avatar.spec.ts     # Core avatar tests
├── 2d-avatar.spec.ts        # 2D rendering tests
├── 3d-avatar.spec.ts        # 3D rendering tests
├── lip-sync.spec.ts         # TTS and lip sync tests
├── customization.spec.ts    # Customization tests
├── streaming.spec.ts        # WebSocket streaming tests
├── gestures.spec.ts         # Gesture animation tests
├── performance.spec.ts      # Performance benchmarks
└── playwright.config.ts     # Playwright configuration
```

## 🚀 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Test Execution
```bash
# Run all avatar tests
npx playwright test --config=e2e/avatar/playwright.config.ts

# Run specific test suites
npx playwright test --config=e2e/avatar/playwright.config.ts basic-avatar
npx playwright test --config=e2e/avatar/playwright.config.ts performance

# Run with specific browser
npx playwright test --config=e2e/avatar/playwright.config.ts --project=chromium

# Run performance tests only
npx playwright test --config=e2e/avatar/playwright.config.ts --project=performance

# Run visual regression tests
npx playwright test --config=e2e/avatar/playwright.config.ts --project=visual

# Run streaming tests
npx playwright test --config=e2e/avatar/playwright.config.ts --project=streaming

# Debug mode
npx playwright test --config=e2e/avatar/playwright.config.ts --debug

# UI mode
npx playwright test --config=e2e/avatar/playwright.config.ts --ui
```

### Test Reports
```bash
# View HTML report
npx playwright show-report test-results/avatar-html

# Generate and view coverage report
npm run test:avatar:coverage
```

## 📊 Test Metrics and Benchmarks

### Performance Baselines
- **Initialization**: < 5 seconds
- **Frame Rate**: > 25 FPS sustained
- **Render Time**: < 40ms per frame
- **Memory Usage**: < 150MB base usage
- **Expression Changes**: < 1 second
- **Gesture Start**: < 500ms

### Coverage Targets
- **Functional Coverage**: 95%+ of avatar features tested
- **Browser Coverage**: Chrome, Firefox, Safari (desktop + mobile)
- **Performance Coverage**: All major operations benchmarked
- **Accessibility Coverage**: WCAG 2.1 AA compliance verified

## 🔧 Test Configuration

### Browser Projects
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile
- **Performance**: Chrome with performance monitoring
- **Accessibility**: Chrome with accessibility features
- **Visual**: Chrome with consistent viewport
- **Streaming**: Chrome with media permissions

### Environment Variables
```bash
# CI mode (affects retries and parallelization)
CI=true

# Base URL for tests
PLAYWRIGHT_BASE_URL=http://localhost:4200

# WebSocket mock server port
AVATAR_WEBSOCKET_PORT=8081

# Performance test duration (ms)
PERFORMANCE_TEST_DURATION=60000

# Enable verbose logging
DEBUG=avatar:*
```

## 🎭 Visual Regression Testing

### Screenshot Comparison
- Avatar appearance across different configurations
- Expression and gesture states
- Customization options
- Render mode comparisons (canvas vs SVG vs 3D)
- Cross-browser visual consistency

### Updating Baselines
```bash
# Update all visual baselines
npx playwright test --config=e2e/avatar/playwright.config.ts --project=visual --update-snapshots

# Update specific test baselines
npx playwright test --config=e2e/avatar/playwright.config.ts 2d-avatar --update-snapshots
```

## 🔊 Audio Testing

### Test Audio Files
- **Short Speech**: 2 seconds, basic phonemes
- **Medium Speech**: 5 seconds, varied content
- **Long Speech**: 15 seconds, extended testing
- **Multilingual**: Multiple language samples
- **Edge Cases**: Silence, whispers, loud speech
- **Musical**: Singing and tonal content

### Lip Sync Accuracy Testing
- Phoneme detection accuracy > 85%
- Viseme mapping correctness
- Timing synchronization within 100ms
- Multi-language support verification

## 🌐 Streaming and Real-time Testing

### WebSocket Mock Server
- Configurable message types and payloads
- Network condition simulation
- Connection failure and recovery testing
- High-throughput message processing
- Security and validation testing

### Real-time Performance
- Message latency < 200ms average
- High-frequency updates (20+ messages/second)
- Connection stability over extended periods
- Memory efficiency during streaming

## 🎮 Gesture Testing

### Gesture Categories
- **Basic**: Wave, nod, shrug, point
- **Emotional**: Thumbs up, clap, thinking pose
- **Custom**: User-created gestures
- **Motion Capture**: Imported mocap data
- **Additive**: Multiple concurrent gestures

### Animation Quality
- Smooth transitions and blending
- Timing accuracy and synchronization
- Performance optimization
- Cross-platform consistency

## 🎨 Customization Testing

### Customization Options
- **Models**: 4 base character types
- **Appearance**: Skin tone, hair style/color, clothing
- **Behavior**: Animation speed, gesture intensity, blinking
- **Advanced**: Custom expressions, lighting, proportions

### Validation Testing
- Input constraint validation
- Real-time preview updates
- Configuration import/export
- Preset management

## 🚨 Error Handling and Recovery

### Error Scenarios
- Network failures and recovery
- Resource loading errors
- Memory pressure handling
- Invalid input processing
- Browser compatibility issues
- Performance degradation recovery

### Resilience Testing
- Graceful degradation under constraints
- Error reporting and logging
- User experience during failures
- System stability under stress

## 📈 Performance Monitoring

### Automated Benchmarks
- Initialization time measurement
- Runtime performance tracking
- Memory usage monitoring
- Frame rate analysis
- Resource loading optimization

### Regression Detection
- Performance baseline comparisons
- Automated alerts for degradation
- Historical performance tracking
- Cross-version performance analysis

## ♿ Accessibility Testing

### WCAG Compliance
- Keyboard navigation support
- Screen reader compatibility
- ARIA attribute validation
- Focus management
- Color contrast verification
- Motion sensitivity handling

### Assistive Technology
- Screen reader announcements
- Keyboard shortcut support
- High contrast mode compatibility
- Reduced motion preferences
- Voice control integration

## 🏁 Test Execution Strategy

### Development Workflow
1. **Pre-commit**: Fast smoke tests
2. **PR Validation**: Full test suite
3. **Nightly**: Extended performance and stability tests
4. **Release**: Complete regression testing

### CI/CD Integration
- Parallel test execution
- Test result reporting
- Performance monitoring alerts
- Visual regression detection
- Cross-browser validation

## 📝 Contributing to Tests

### Adding New Tests
1. Follow existing test patterns and structure
2. Use the provided page object model and utilities
3. Include performance considerations
4. Add accessibility checks where relevant
5. Document test scenarios and expected outcomes

### Test Maintenance
- Regular baseline updates for visual tests
- Performance benchmark adjustments
- Test data refresh and expansion
- Documentation updates

---

**Total Test Coverage**: 8 test suites, 200+ individual tests, covering all avatar functionality with comprehensive performance, accessibility, and cross-browser validation.

This test suite ensures the avatar library delivers a high-quality, performant, and accessible user experience across all supported platforms and browsers.