# Troubleshooting Guide

This comprehensive troubleshooting guide helps you diagnose and fix common issues with BLG Editor.

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Problems](#configuration-problems)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [Browser Compatibility](#browser-compatibility)
- [Styling Problems](#styling-problems)
- [Plugin Issues](#plugin-issues)
- [Content Issues](#content-issues)
- [Accessibility Problems](#accessibility-problems)
- [Debugging Tools](#debugging-tools)

## 🔧 Installation Issues

### Issue: Cannot resolve '@ng-ui/editor-core'

**Symptoms:**
- Build fails with module resolution error
- IDE shows red squiggles for imports

**Solutions:**

1. **Verify installation**:
   ```bash
   npm list @ng-ui/editor-core
   # or
   yarn list @ng-ui/editor-core
   ```

2. **Reinstall packages**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check package version**:
   ```bash
   npm install @ng-ui/editor-core@latest
   ```

4. **Verify TypeScript paths** in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

### Issue: Style imports not working

**Symptoms:**
- Editor appears unstyled
- Toolbar buttons have no styling

**Solutions:**

1. **Import styles in `angular.json`**:
   ```json
   {
     "styles": [
       "node_modules/@ng-ui/editor-core/styles/editor.scss",
       "src/styles.scss"
     ]
   }
   ```

2. **Import in global styles**:
   ```scss
   // styles.scss
   @import '@ng-ui/editor-core/styles/editor.scss';
   ```

3. **Check build configuration**:
   ```bash
   ng build --verbose
   ```

### Issue: Angular version compatibility

**Symptoms:**
- Peer dependency warnings
- Build errors mentioning Angular versions

**Solutions:**

1. **Check compatibility matrix**:
   | BLG Editor | Angular | TypeScript |
   |------------|---------|------------|
   | 3.x        | 16+     | 4.9+       |
   | 2.x        | 15+     | 4.8+       |
   | 1.x        | 14+     | 4.7+       |

2. **Update Angular**:
   ```bash
   ng update @angular/core @angular/cli
   ```

3. **Force resolution** (if needed):
   ```json
   // package.json
   {
     "overrides": {
       "@angular/core": "^16.0.0"
     }
   }
   ```

## ⚙️ Configuration Problems

### Issue: Toolbar not appearing

**Symptoms:**
- Editor shows but no toolbar
- Toolbar area is empty

**Solutions:**

1. **Check toolbar configuration**:
   ```typescript
   const config: EditorConfig = {
     toolbar: {
       enabled: true, // Must be true
       groups: [
         { id: 'basic', tools: ['bold', 'italic'] }
       ]
     }
   };
   ```

2. **Verify component imports**:
   ```typescript
   import { ToolbarComponent } from '@ng-ui/editor-toolbar';
   
   @Component({
     imports: [EditorCoreComponent, ToolbarComponent]
   })
   ```

3. **Check element reference**:
   ```typescript
   @ViewChild('editor') editorRef!: EditorCoreComponent;
   ```

### Issue: Configuration not taking effect

**Symptoms:**
- Settings appear ignored
- Default behavior persists

**Solutions:**

1. **Check change detection**:
   ```typescript
   // Force change detection
   constructor(private cdr: ChangeDetectorRef) {}
   
   updateConfig() {
     this.editorConfig = { ...this.editorConfig, newOption: value };
     this.cdr.detectChanges();
   }
   ```

2. **Verify object references**:
   ```typescript
   // Wrong - mutating reference
   this.config.readonly = true;
   
   // Correct - new reference
   this.config = { ...this.config, readonly: true };
   ```

3. **Use OnPush detection strategy correctly**:
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

## 🚨 Runtime Errors

### Issue: "Cannot read property of undefined"

**Common Causes:**

1. **Editor not initialized**:
   ```typescript
   ngAfterViewInit() {
     // Wait for editor to be ready
     if (this.editor) {
       this.editor.ready.subscribe(() => {
         // Now safe to use editor methods
       });
     }
   }
   ```

2. **ViewChild accessed too early**:
   ```typescript
   @ViewChild('editor') editor!: EditorCoreComponent;
   
   ngOnInit() {
     // ❌ Editor not available yet
     // this.editor.focus();
   }
   
   ngAfterViewInit() {
     // ✅ Editor available now
     this.editor.focus();
   }
   ```

3. **Async initialization**:
   ```typescript
   async ngAfterViewInit() {
     await this.editor.ready.toPromise();
     this.editor.setContent('<p>Initial content</p>');
   }
   ```

### Issue: Memory leaks

**Symptoms:**
- Increasing memory usage
- Browser becomes sluggish
- Page crashes on navigation

**Solutions:**

1. **Implement proper cleanup**:
   ```typescript
   export class EditorComponent implements OnDestroy {
     private subscription = new Subscription();
     
     ngOnInit() {
       this.subscription.add(
         this.editor.contentChange.subscribe(/* ... */)
       );
     }
     
     ngOnDestroy() {
       this.subscription.unsubscribe();
       this.editor?.destroy();
     }
   }
   ```

2. **Remove event listeners**:
   ```typescript
   ngOnDestroy() {
     this.editor.off('contentChange', this.handleContentChange);
     this.editor.destroy();
   }
   ```

3. **Clear timers and intervals**:
   ```typescript
   private autoSaveInterval?: number;
   
   ngOnInit() {
     this.autoSaveInterval = window.setInterval(() => {
       this.saveContent();
     }, 30000);
   }
   
   ngOnDestroy() {
     if (this.autoSaveInterval) {
       clearInterval(this.autoSaveInterval);
     }
   }
   ```

## ⚡ Performance Issues

### Issue: Slow typing/input lag

**Symptoms:**
- Delay between keypress and character appearing
- Editor feels unresponsive

**Solutions:**

1. **Optimize change detection**:
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   export class OptimizedEditorComponent {
     editorConfig: EditorConfig = {
       eventHandlers: {
         onChange: this.debounce((content: string) => {
           this.handleContentChange(content);
         }, 300)
       }
     };
     
     private debounce(func: Function, wait: number) {
       let timeout: any;
       return (...args: any[]) => {
         clearTimeout(timeout);
         timeout = setTimeout(() => func.apply(this, args), wait);
       };
     }
   }
   ```

2. **Limit DOM updates**:
   ```typescript
   // Use virtual scrolling for long content
   const performanceConfig: EditorConfig = {
     performance: {
       virtualScrolling: true,
       lazyRendering: true,
       debounceMs: 100
     }
   };
   ```

3. **Optimize toolbar**:
   ```typescript
   // Only show essential tools
   const minimalToolbar: EditorConfig = {
     toolbar: {
       groups: [
         { id: 'essential', tools: ['bold', 'italic', 'link'] }
       ]
     }
   };
   ```

### Issue: Large document performance

**Symptoms:**
- Slow scrolling
- High CPU usage
- Browser freezing

**Solutions:**

1. **Enable content pagination**:
   ```typescript
   const largeDocConfig: EditorConfig = {
     content: {
       pagination: {
         enabled: true,
         pageSize: 1000 // words per page
       }
     }
   };
   ```

2. **Use lazy loading**:
   ```typescript
   const lazyConfig: EditorConfig = {
     plugins: [
       {
         name: 'lazy-loading',
         options: {
           chunkSize: 500,
           renderThreshold: 100
         }
       }
     ]
   };
   ```

3. **Optimize images**:
   ```typescript
   const imageConfig: EditorConfig = {
     media: {
       lazyLoading: true,
       imageOptimization: {
         maxWidth: 800,
         quality: 0.8,
         format: 'webp'
       }
     }
   };
   ```

## 🌐 Browser Compatibility

### Issue: Editor not working in Safari

**Common Problems:**
- ContentEditable issues
- Selection problems
- Event handling differences

**Solutions:**

1. **Enable Safari polyfills**:
   ```typescript
   // polyfills.ts
   import 'web-animations-js';
   import 'intersection-observer';
   ```

2. **Configure for Safari**:
   ```typescript
   const safariConfig: EditorConfig = {
     browser: {
       safari: {
         usePolyfills: true,
         fixContentEditable: true
       }
     }
   };
   ```

3. **Test Safari-specific features**:
   ```typescript
   ngOnInit() {
     const isSafari = /Safari/.test(navigator.userAgent) && 
                     !/Chrome/.test(navigator.userAgent);
     
     if (isSafari) {
       this.editorConfig = {
         ...this.editorConfig,
         compatibility: { safari: true }
       };
     }
   }
   ```

### Issue: Internet Explorer support

**Note:** IE is not officially supported, but here are workarounds:

1. **Add polyfills**:
   ```typescript
   // polyfills.ts
   import 'core-js/es/promise';
   import 'core-js/es/array';
   import 'whatwg-fetch';
   ```

2. **Use compatibility mode**:
   ```typescript
   const ieConfig: EditorConfig = {
     compatibility: {
       ie: true,
       features: {
         modernJS: false,
         css3: false
       }
     }
   };
   ```

## 🎨 Styling Problems

### Issue: Styles not applying

**Symptoms:**
- Custom styles ignored
- Theme not loading
- CSS conflicts

**Solutions:**

1. **Check CSS specificity**:
   ```scss
   // Increase specificity
   .my-editor {
     .blg-editor-core {
       .editor-content {
         font-family: 'Custom Font' !important;
       }
     }
   }
   ```

2. **Use CSS custom properties**:
   ```scss
   .blg-editor-core {
     --editor-font-family: 'Custom Font';
     --editor-font-size: 16px;
     --editor-line-height: 1.6;
   }
   ```

3. **Load styles in correct order**:
   ```json
   {
     "styles": [
       "node_modules/@ng-ui/editor-core/styles/editor.scss",
       "node_modules/@ng-ui/editor-themes/styles/themes.scss",
       "src/styles.scss" // Custom styles last
     ]
   }
   ```

### Issue: Dark mode not working

**Solutions:**

1. **Configure dark mode properly**:
   ```typescript
   const darkModeConfig: EditorConfig = {
     theme: {
       darkMode: true,
       variables: {
         '--editor-bg': '#1a1a1a',
         '--editor-text': '#ffffff',
         '--editor-border': '#333333'
       }
     }
   };
   ```

2. **Handle system preference**:
   ```typescript
   ngOnInit() {
     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
     
     this.editorConfig = {
       theme: { darkMode: prefersDark.matches }
     };
     
     prefersDark.addEventListener('change', (e) => {
       this.updateTheme(e.matches);
     });
   }
   ```

## 🔌 Plugin Issues

### Issue: Plugin not loading

**Symptoms:**
- Plugin functionality missing
- No error messages
- Plugin not in registry

**Solutions:**

1. **Check plugin registration**:
   ```typescript
   import { CustomPlugin } from './custom-plugin';
   
   ngOnInit() {
     this.editor.pluginManager.registerPlugin(new CustomPlugin());
   }
   ```

2. **Verify plugin configuration**:
   ```typescript
   const pluginConfig: EditorConfig = {
     plugins: [
       {
         name: 'my-plugin',
         enabled: true, // Must be true
         options: { /* plugin options */ }
       }
     ]
   };
   ```

3. **Debug plugin loading**:
   ```typescript
   ngAfterViewInit() {
     console.log('Registered plugins:', this.editor.getPlugins());
     console.log('Plugin enabled:', this.editor.hasPlugin('my-plugin'));
   }
   ```

## 📄 Content Issues

### Issue: Content not saving properly

**Symptoms:**
- Content appears correct in editor
- Saved content is different
- HTML structure corrupted

**Solutions:**

1. **Sanitize content properly**:
   ```typescript
   import { DomSanitizer } from '@angular/platform-browser';
   
   saveContent() {
     const content = this.editor.getContent();
     const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, content);
     this.save(sanitized);
   }
   ```

2. **Validate HTML structure**:
   ```typescript
   const content = this.editor.getContent();
   if (this.isValidHTML(content)) {
     this.save(content);
   } else {
     console.error('Invalid HTML content');
   }
   ```

3. **Handle special characters**:
   ```typescript
   saveContent() {
     const content = this.editor.getContent()
       .replace(/'/g, '&apos;')
       .replace(/"/g, '&quot;');
     this.save(content);
   }
   ```

### Issue: Copy/paste formatting issues

**Solutions:**

1. **Configure paste handling**:
   ```typescript
   const pasteConfig: EditorConfig = {
     paste: {
       cleanupPastedHTML: true,
       removeFormatting: false,
       allowedTags: ['p', 'strong', 'em', 'ul', 'ol', 'li'],
       allowedAttributes: ['href', 'src', 'alt']
     }
   };
   ```

2. **Handle paste events**:
   ```typescript
   @HostListener('paste', ['$event'])
   onPaste(event: ClipboardEvent) {
     const pastedData = event.clipboardData?.getData('text/html');
     if (pastedData) {
       const cleaned = this.cleanHTML(pastedData);
       this.editor.insertContent(cleaned);
       event.preventDefault();
     }
   }
   ```

## ♿ Accessibility Problems

### Issue: Screen reader not announcing changes

**Solutions:**

1. **Enable accessibility features**:
   ```typescript
   const accessibilityConfig: EditorConfig = {
     accessibility: {
       ariaLabel: 'Rich text editor',
       announceChanges: true,
       liveRegion: true
     }
   };
   ```

2. **Add ARIA labels**:
   ```typescript
   @Component({
     template: `
       <div role="application" aria-label="Text Editor">
         <blg-editor-core 
           [config]="editorConfig"
           aria-label="Document content">
         </blg-editor-core>
       </div>
     `
   })
   ```

### Issue: Keyboard navigation not working

**Solutions:**

1. **Configure keyboard shortcuts**:
   ```typescript
   const keyboardConfig: EditorConfig = {
     accessibility: {
       keyboardShortcuts: {
         'Ctrl+B': 'bold',
         'Ctrl+I': 'italic',
         'F6': 'focusToolbar',
         'Escape': 'focusEditor'
       }
     }
   };
   ```

2. **Implement focus management**:
   ```typescript
   @HostListener('keydown', ['$event'])
   onKeyDown(event: KeyboardEvent) {
     if (event.key === 'F6') {
       this.focusNextRegion();
       event.preventDefault();
     }
   }
   ```

## 🔍 Debugging Tools

### Enable Debug Mode

```typescript
// Enable debugging in development
if (!environment.production) {
  const debugConfig: EditorConfig = {
    debug: {
      enabled: true,
      logLevel: 'verbose',
      showPerformanceStats: true
    }
  };
}
```

### Console Debugging

```typescript
// Debug editor state
console.log('Editor state:', this.editor.getState());
console.log('Current content:', this.editor.getContent());
console.log('Selection:', this.editor.getSelection());
console.log('Applied commands:', this.editor.getCommandHistory());
```

### Browser Developer Tools

1. **Inspect editor DOM**:
   ```javascript
   // In browser console
   const editor = document.querySelector('.blg-editor-core');
   console.log(editor);
   ```

2. **Monitor events**:
   ```javascript
   // Listen to all editor events
   window.addEventListener('editor-event', (e) => {
     console.log('Editor event:', e.detail);
   });
   ```

### Performance Monitoring

```typescript
export class PerformanceMonitor {
  private startTime = 0;
  
  startTimer(label: string) {
    this.startTime = performance.now();
    console.time(label);
  }
  
  endTimer(label: string) {
    const endTime = performance.now();
    console.timeEnd(label);
    console.log(`${label} took ${endTime - this.startTime} ms`);
  }
}
```

## 🆘 Getting Help

If you can't resolve your issue:

1. **Check the documentation** - [Full Documentation](../INDEX.md)
2. **Search GitHub Issues** - [Issues Page](https://github.com/blg/editor/issues)
3. **Ask the community** - [Discussions](https://github.com/blg/editor/discussions)
4. **Create a minimal reproduction** - Use StackBlitz or CodeSandbox
5. **Report bugs** with detailed information

### Bug Report Template

```markdown
**Environment:**
- BLG Editor version: 
- Angular version: 
- Browser: 
- OS: 

**Expected Behavior:**
Describe what should happen

**Actual Behavior:**
Describe what actually happens

**Steps to Reproduce:**
1. 
2. 
3. 

**Code Sample:**
```typescript
// Minimal reproduction code
```

**Additional Context:**
Any other relevant information
```

---

*For more specific issues, check our [FAQ](./faq.md) or [Browser Support](./browser-support.md) guides.*