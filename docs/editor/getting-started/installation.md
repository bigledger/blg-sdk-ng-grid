# Installation Guide

This guide covers different ways to install and set up BLG Editor in your Angular application.

## 📋 Requirements

### System Requirements
- **Node.js**: 18.0+ (LTS recommended)
- **npm**: 9.0+ or **yarn**: 1.22+
- **Angular**: 15.0+ (Angular 16+ recommended)
- **TypeScript**: 4.9+

### Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Opera**: 76+

## 🚀 Installation Methods

### Method 1: Core Package Only (Minimal)

Install just the core editor for basic functionality:

```bash
npm install @ng-ui/editor-core
```

This gives you:
- Basic rich text editing
- Content change events
- Core editor services

### Method 2: Essential Packages (Recommended)

Install core editor with essential features:

```bash
npm install @ng-ui/editor-core @ng-ui/editor-toolbar @ng-ui/editor-formats
```

This includes:
- Core editor functionality
- Customizable toolbar
- Rich text formatting

### Method 3: Full Feature Set

Install all available packages for complete functionality:

```bash
npm install @ng-ui/editor-core @ng-ui/editor-toolbar @ng-ui/editor-formats @ng-ui/editor-media @ng-ui/editor-tables @ng-ui/editor-themes @ng-ui/editor-plugins
```

This provides:
- All core features
- Media upload and handling
- Table creation and editing
- Theme system
- Plugin architecture

### Method 4: Using Yarn

If you prefer Yarn:

```bash
# Core only
yarn add @ng-ui/editor-core

# Essential packages
yarn add @ng-ui/editor-core @ng-ui/editor-toolbar @ng-ui/editor-formats

# Full feature set
yarn add @ng-ui/editor-core @ng-ui/editor-toolbar @ng-ui/editor-formats @ng-ui/editor-media @ng-ui/editor-tables @ng-ui/editor-themes @ng-ui/editor-plugins
```

## 🔧 Post-Installation Setup

### 1. Import Styles

Add the required styles to your `angular.json` or import them in your global styles:

```scss
// styles.scss
@import '@ng-ui/editor-core/styles/editor.scss';
@import '@ng-ui/editor-toolbar/styles/toolbar.scss'; // if using toolbar
@import '@ng-ui/editor-themes/styles/themes.scss'; // if using themes
```

Or in `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/@ng-ui/editor-core/styles/editor.scss",
              "node_modules/@ng-ui/editor-toolbar/styles/toolbar.scss",
              "node_modules/@ng-ui/editor-themes/styles/themes.scss",
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}
```

### 2. Configure TypeScript

Ensure your `tsconfig.json` includes the necessary configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  }
}
```

### 3. Angular Configuration

If you're using Angular 15 or below, you may need to add polyfills:

```typescript
// polyfills.ts
import 'zone.js/dist/zone';
```

For Angular 16+ with standalone components (recommended):

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // Your providers
  ]
});
```

## 🎛️ Package Details

### Core Packages

#### `@ng-ui/editor-core`
- **Size**: ~45KB (gzipped)
- **Dependencies**: Angular Common, Angular Forms
- **Features**: Basic editor, content management, events

#### `@ng-ui/editor-toolbar`
- **Size**: ~25KB (gzipped)
- **Dependencies**: @ng-ui/editor-core, Angular Common
- **Features**: Customizable toolbar, button groups, tooltips

#### `@ng-ui/editor-formats`
- **Size**: ~30KB (gzipped)
- **Dependencies**: @ng-ui/editor-core
- **Features**: Text formatting, styles, commands

### Feature Packages

#### `@ng-ui/editor-media`
- **Size**: ~20KB (gzipped)
- **Dependencies**: @ng-ui/editor-core
- **Features**: Image upload, media handling, resize

#### `@ng-ui/editor-tables`
- **Size**: ~35KB (gzipped)
- **Dependencies**: @ng-ui/editor-core
- **Features**: Table creation, editing, formatting

#### `@ng-ui/editor-themes`
- **Size**: ~15KB (gzipped)
- **Dependencies**: @ng-ui/editor-core
- **Features**: Theme system, dark mode, custom styling

#### `@ng-ui/editor-plugins`
- **Size**: ~10KB (gzipped)
- **Dependencies**: @ng-ui/editor-core
- **Features**: Plugin architecture, extensibility

## 🔧 Development Setup

For development with the editor source code:

### 1. Clone Repository

```bash
git clone https://github.com/blg/editor.git
cd blg-editor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Libraries

```bash
npm run build
```

### 4. Run Demo Application

```bash
npm run serve
```

### 5. Run Tests

```bash
npm run test
npm run e2e
```

## 🐛 Troubleshooting Installation

### Common Issues

#### Issue: `Cannot resolve @ng-ui/editor-core`

**Solution**: Ensure you've installed the package correctly:

```bash
npm install @ng-ui/editor-core --save
```

Clear node_modules and reinstall if necessary:

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Style imports not working

**Solution**: Check your build configuration and ensure the paths are correct:

```scss
// Correct path
@import '@ng-ui/editor-core/styles/editor.scss';

// If above doesn't work, try:
@import '~@ng-ui/editor-core/styles/editor.scss';
```

#### Issue: Angular version compatibility

**Solution**: Check version compatibility:

```bash
npm ls @angular/core
npm ls @ng-ui/editor-core
```

Update Angular if needed:

```bash
ng update @angular/core @angular/cli
```

#### Issue: Build errors with TypeScript

**Solution**: Ensure TypeScript configuration is compatible:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM"]
  }
}
```

### Getting Help

If you encounter issues not covered here:

1. Check the [Troubleshooting Guide](../troubleshooting/README.md)
2. Search [GitHub Issues](https://github.com/blg/editor/issues)
3. Ask on [GitHub Discussions](https://github.com/blg/editor/discussions)
4. Review the [FAQ](../troubleshooting/faq.md)

## 📦 Bundle Analysis

To analyze your bundle size after installation:

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Build your app with stats
ng build --stats-json

# Analyze the bundle
npx webpack-bundle-analyzer dist/your-app/stats.json
```

### Optimizing Bundle Size

1. **Import only what you need**:
   ```typescript
   // Good
   import { EditorCoreComponent } from '@ng-ui/editor-core';
   
   // Avoid
   import * as Editor from '@ng-ui/editor-core';
   ```

2. **Use lazy loading** for heavy features:
   ```typescript
   const EditorModule = () => import('@ng-ui/editor-tables').then(m => m.EditorTablesModule);
   ```

3. **Configure tree-shaking** in your build:
   ```json
   {
     "optimization": {
       "usedExports": true,
       "sideEffects": false
     }
   }
   ```

## ✅ Verification

After installation, verify everything works:

### 1. Import Test

```typescript
import { EditorCoreComponent } from '@ng-ui/editor-core';

// Should not throw any errors
console.log('Editor imported successfully:', EditorCoreComponent);
```

### 2. Build Test

```bash
ng build
```

Should complete without errors.

### 3. Runtime Test

Create a simple component:

```typescript
@Component({
  template: '<blg-editor-core></blg-editor-core>',
  imports: [EditorCoreComponent]
})
export class TestComponent {}
```

## 🚀 Next Steps

- [Basic Setup](./basic-setup.md) - Create your first editor instance
- [Angular Integration](./angular-integration.md) - Deep Angular integration
- [Configuration](../configuration/overview.md) - Customize your editor

---

*Having trouble? Check our [troubleshooting guide](../troubleshooting/README.md) or [open an issue](https://github.com/blg/editor/issues).*