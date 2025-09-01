# Test Assets

This directory contains test assets used by the editor E2E tests.

## 📁 Directory Structure

```
test-assets/
├── images/           # Test images for upload testing
├── videos/          # Test videos for media testing
├── documents/       # Test documents for file handling
└── data/           # Test data files and fixtures
```

## 🖼️ Test Images

Sample images for testing image upload and handling:

- `sample-image-1.jpg` - Small JPEG image (< 1MB)
- `sample-image-2.png` - PNG with transparency
- `sample-image-3.gif` - Animated GIF
- `sample-image-4.webp` - WebP format image
- `large-image.jpg` - Large image for size validation testing
- `corrupted-image.jpg` - Corrupted file for error handling tests

## 🎥 Test Videos

Sample videos for media embedding tests:

- `sample-video-1.mp4` - MP4 video file
- `sample-video-2.webm` - WebM video file
- `sample-video-3.ogg` - OGG video file

## 📄 Test Documents

Sample documents for comprehensive media testing:

- `sample-document.pdf` - PDF document
- `sample-spreadsheet.xlsx` - Excel spreadsheet
- `sample-presentation.pptx` - PowerPoint presentation

## 🔧 Setup Instructions

To set up test assets for local development:

1. Run the asset generation script:
   ```bash
   npm run setup:test-assets
   ```

2. Or manually create test files:
   ```bash
   # Create a simple test image
   convert -size 100x100 xc:blue test-assets/images/sample-image-1.jpg
   
   # Create test data files
   echo "Test content" > test-assets/documents/sample-text.txt
   ```

## 🤖 Automated Generation

Most test assets are generated automatically during test execution using:

- Base64-encoded sample images
- Mock video content
- Generated test data

This ensures tests can run in any environment without external dependencies.

## 📝 Usage in Tests

```typescript
import { EditorTestData } from '../utils/test-data-generator';

// Get test file paths
const testFiles = EditorTestData.getTestFilePaths();

// Use in image upload tests
await editorPage.insertImage(testFiles.images[0], 'Test alt text');

// Use in video embed tests
await editorPage.insertVideo(testFiles.videos[0]);
```

## 🚫 .gitignore

Large binary assets are not committed to git. They are either:
- Generated during test execution
- Downloaded from external sources during CI setup
- Mocked using data URIs

## 🔍 Asset Validation

Tests include validation for:
- File type checking
- File size limits  
- Image dimensions
- Video format support
- Corrupted file handling