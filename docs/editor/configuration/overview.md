# Configuration Overview

BLG Editor provides extensive configuration options to customize the editor's behavior, appearance, and features. This guide covers the core configuration concepts and patterns.

## 🎯 Configuration Philosophy

BLG Editor follows these configuration principles:

1. **Sensible Defaults** - Works out of the box with minimal configuration
2. **Progressive Enhancement** - Add features as you need them
3. **Type Safety** - Full TypeScript support for all options
4. **Modular Configuration** - Configure features independently
5. **Runtime Updates** - Many settings can be changed after initialization

## 📋 Configuration Structure

The main configuration is defined through the `EditorConfig` interface:

```typescript
import { EditorConfig } from '@ng-ui/editor-core';

const config: EditorConfig = {
  // Core editor settings
  readonly: false,
  content: '<p>Initial content</p>',
  placeholder: 'Start typing...',
  
  // Layout settings
  minHeight: '200px',
  maxHeight: '600px',
  
  // Feature configurations
  toolbar: { /* toolbar config */ },
  media: { /* media config */ },
  tables: { /* table config */ },
  // ... more features
};
```

## 🔧 Core Configuration Options

### Basic Settings

```typescript
interface CoreEditorSettings {
  /** Whether the editor is readonly */
  readonly?: boolean;
  
  /** Initial HTML content */
  content?: string;
  
  /** Placeholder text when empty */
  placeholder?: string;
  
  /** Auto-focus on initialization */
  autoFocus?: boolean;
  
  /** Maximum character limit */
  maxLength?: number;
  
  /** Minimum editor height */
  minHeight?: string | number;
  
  /** Maximum editor height */
  maxHeight?: string | number;
}
```

**Example:**
```typescript
const basicConfig: EditorConfig = {
  placeholder: 'Enter your story...',
  autoFocus: true,
  maxLength: 5000,
  minHeight: '300px',
  maxHeight: '500px'
};
```

### Event Handlers

```typescript
interface EventHandlerConfig {
  /** Content change handler */
  onChange?: (content: string) => void;
  
  /** Focus event handler */
  onFocus?: (event: FocusEvent) => void;
  
  /** Blur event handler */
  onBlur?: (event: FocusEvent) => void;
  
  /** Key event handler */
  onKeyDown?: (event: KeyboardEvent) => void;
  
  /** Selection change handler */
  onSelectionChange?: (selection: EditorSelection) => void;
}
```

**Example:**
```typescript
const eventConfig: EditorConfig = {
  eventHandlers: {
    onChange: (content) => {
      console.log('Content length:', content.length);
      localStorage.setItem('draft', content);
    },
    onFocus: () => console.log('Editor focused'),
    onSelectionChange: (selection) => {
      if (selection) {
        console.log('Selected text:', selection.text);
      }
    }
  }
};
```

## 🎛️ Feature Configuration

### Toolbar Configuration

The toolbar is highly customizable with groups and individual tools:

```typescript
interface ToolbarConfig {
  enabled?: boolean;
  position?: 'top' | 'bottom' | 'floating';
  sticky?: boolean;
  groups?: ToolbarGroup[];
}

interface ToolbarGroup {
  id: string;
  label?: string;
  tools: string[];
  collapsible?: boolean;
}
```

**Example:**
```typescript
const toolbarConfig: EditorConfig = {
  toolbar: {
    enabled: true,
    position: 'top',
    sticky: true,
    groups: [
      {
        id: 'formatting',
        label: 'Text Formatting',
        tools: ['bold', 'italic', 'underline', 'strikethrough']
      },
      {
        id: 'structure',
        label: 'Document Structure', 
        tools: ['heading1', 'heading2', 'heading3', 'paragraph']
      },
      {
        id: 'lists',
        label: 'Lists',
        tools: ['bulletList', 'orderedList']
      },
      {
        id: 'insert',
        label: 'Insert Content',
        tools: ['link', 'image', 'table', 'horizontalRule']
      }
    ]
  }
};
```

### Media Configuration

Configure image uploads, resizing, and media handling:

```typescript
interface MediaConfig {
  uploadEnabled?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadUrl?: string;
  imageResize?: ImageResizeConfig;
}
```

**Example:**
```typescript
const mediaConfig: EditorConfig = {
  media: {
    uploadEnabled: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadUrl: '/api/editor/upload',
    imageResize: {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.9
    }
  }
};
```

### Table Configuration

Configure table creation and editing features:

```typescript
interface TableConfig {
  enabled?: boolean;
  defaultSize?: { rows: number; columns: number };
  resizable?: boolean;
  maxSize?: { rows: number; columns: number };
}
```

**Example:**
```typescript
const tableConfig: EditorConfig = {
  tables: {
    enabled: true,
    defaultSize: { rows: 3, columns: 3 },
    resizable: true,
    maxSize: { rows: 50, columns: 20 }
  }
};
```

## 🎨 Theme Configuration

Customize the visual appearance:

```typescript
interface ThemeConfig {
  name?: string;
  variables?: Record<string, string>;
  darkMode?: boolean;
}
```

**Example:**
```typescript
const themeConfig: EditorConfig = {
  theme: {
    name: 'custom',
    darkMode: false,
    variables: {
      '--editor-font-family': 'Inter, sans-serif',
      '--editor-font-size': '16px',
      '--editor-line-height': '1.6',
      '--editor-border-color': '#e2e8f0',
      '--editor-focus-color': '#3b82f6'
    }
  }
};
```

## 🔌 Plugin Configuration

Configure plugins and extensions:

```typescript
interface PluginConfig {
  name: string;
  options?: Record<string, any>;
  enabled?: boolean;
}
```

**Example:**
```typescript
const pluginConfig: EditorConfig = {
  plugins: [
    {
      name: 'word-count',
      enabled: true,
      options: {
        showCharacterCount: true,
        showWordCount: true,
        position: 'bottom-right'
      }
    },
    {
      name: 'auto-save',
      enabled: true,
      options: {
        interval: 30000, // 30 seconds
        key: 'editor-content'
      }
    },
    {
      name: 'spell-check',
      enabled: true,
      options: {
        language: 'en-US'
      }
    }
  ]
};
```

## ♿ Accessibility Configuration

Ensure your editor is accessible:

```typescript
interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescription?: string;
  announceChanges?: boolean;
  keyboardShortcuts?: Record<string, string>;
}
```

**Example:**
```typescript
const accessibilityConfig: EditorConfig = {
  accessibility: {
    ariaLabel: 'Rich text editor for article content',
    ariaDescription: 'Use toolbar buttons or keyboard shortcuts to format text',
    announceChanges: true,
    keyboardShortcuts: {
      'Ctrl+B': 'bold',
      'Ctrl+I': 'italic',
      'Ctrl+U': 'underline',
      'Ctrl+K': 'link',
      'Ctrl+Z': 'undo',
      'Ctrl+Y': 'redo'
    }
  }
};
```

## 🎯 Complete Configuration Example

Here's a comprehensive configuration example:

```typescript
import { EditorConfig } from '@ng-ui/editor-core';

export const productionEditorConfig: EditorConfig = {
  // Basic settings
  placeholder: 'Write your article here...',
  autoFocus: false,
  minHeight: '400px',
  maxHeight: '80vh',
  maxLength: 50000,

  // Toolbar configuration
  toolbar: {
    enabled: true,
    position: 'top',
    sticky: true,
    groups: [
      {
        id: 'history',
        tools: ['undo', 'redo']
      },
      {
        id: 'formatting',
        label: 'Text Formatting',
        tools: ['bold', 'italic', 'underline', 'strikethrough', 'code']
      },
      {
        id: 'headings',
        label: 'Headings',
        tools: ['heading1', 'heading2', 'heading3']
      },
      {
        id: 'lists',
        label: 'Lists',
        tools: ['bulletList', 'orderedList']
      },
      {
        id: 'alignment',
        label: 'Alignment',
        tools: ['alignLeft', 'alignCenter', 'alignRight']
      },
      {
        id: 'insert',
        label: 'Insert',
        tools: ['link', 'image', 'table', 'blockquote', 'horizontalRule']
      },
      {
        id: 'advanced',
        label: 'Advanced',
        tools: ['sourceCode', 'fullscreen'],
        collapsible: true
      }
    ]
  },

  // Media handling
  media: {
    uploadEnabled: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    uploadUrl: '/api/v1/editor/upload',
    imageResize: {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85
    }
  },

  // Table support
  tables: {
    enabled: true,
    defaultSize: { rows: 3, columns: 3 },
    resizable: true,
    maxSize: { rows: 100, columns: 20 }
  },

  // Theme customization
  theme: {
    name: 'professional',
    darkMode: false,
    variables: {
      '--editor-font-family': 'system-ui, -apple-system, sans-serif',
      '--editor-font-size': '16px',
      '--editor-line-height': '1.7',
      '--editor-max-width': '65ch',
      '--editor-padding': '24px',
      '--editor-border-radius': '8px',
      '--editor-border-color': '#e5e7eb',
      '--editor-focus-color': '#2563eb',
      '--editor-background': '#ffffff'
    }
  },

  // Plugin configuration
  plugins: [
    {
      name: 'auto-save',
      enabled: true,
      options: {
        interval: 60000, // 1 minute
        debounce: 2000   // 2 seconds
      }
    },
    {
      name: 'word-count',
      enabled: true,
      options: {
        position: 'bottom-right',
        showCharacterCount: true,
        showWordCount: true,
        showReadingTime: true
      }
    },
    {
      name: 'link-preview',
      enabled: true,
      options: {
        showPreview: true,
        openInNewTab: true
      }
    }
  ],

  // Accessibility
  accessibility: {
    ariaLabel: 'Article content editor',
    ariaDescription: 'Rich text editor with formatting tools',
    announceChanges: true,
    keyboardShortcuts: {
      'Ctrl+B': 'bold',
      'Ctrl+I': 'italic',
      'Ctrl+U': 'underline',
      'Ctrl+K': 'link',
      'Ctrl+Shift+L': 'bulletList',
      'Ctrl+Shift+O': 'orderedList',
      'Ctrl+Z': 'undo',
      'Ctrl+Y': 'redo',
      'F11': 'fullscreen',
      'Escape': 'exitFullscreen'
    }
  },

  // Event handlers
  eventHandlers: {
    onChange: (content) => {
      // Auto-save to localStorage
      localStorage.setItem('editor-draft', content);
      
      // Update word count
      const wordCount = content.split(/\s+/).length;
      console.log(`Content updated: ${wordCount} words`);
    },
    
    onFocus: () => {
      console.log('Editor focused - user started editing');
    },
    
    onBlur: () => {
      console.log('Editor blurred - user stopped editing');
    }
  },

  // Formatting restrictions
  formatting: {
    allowedFormats: [
      'bold', 'italic', 'underline', 'strikethrough',
      'heading1', 'heading2', 'heading3',
      'bulletList', 'orderedList',
      'link', 'image', 'table', 'blockquote'
    ],
    defaultFontFamily: 'system-ui, sans-serif',
    defaultFontSize: '16px'
  },

  // Custom CSS classes
  customClasses: {
    editor: 'my-editor-styles',
    toolbar: 'my-toolbar-styles',
    content: 'my-content-styles'
  }
};
```

## 🔄 Dynamic Configuration

You can update configuration after initialization:

```typescript
import { Component, ViewChild } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';

@Component({
  template: `
    <blg-editor-core #editor [config]="editorConfig"></blg-editor-core>
    <button (click)="toggleReadonly()">Toggle Readonly</button>
    <button (click)="changeTheme()">Change Theme</button>
  `
})
export class DynamicConfigComponent {
  @ViewChild('editor') editor!: EditorCoreComponent;
  
  editorConfig: EditorConfig = {
    readonly: false,
    theme: { name: 'light' }
  };

  toggleReadonly() {
    this.editorConfig = {
      ...this.editorConfig,
      readonly: !this.editorConfig.readonly
    };
  }

  changeTheme() {
    const isDark = this.editorConfig.theme?.name === 'dark';
    this.editorConfig = {
      ...this.editorConfig,
      theme: { name: isDark ? 'light' : 'dark' }
    };
  }
}
```

## ⚡ Performance Configuration Tips

1. **Disable unused features**:
   ```typescript
   const minimalConfig: EditorConfig = {
     toolbar: { enabled: false }, // If you don't need toolbar
     media: { uploadEnabled: false }, // If no image uploads
     tables: { enabled: false } // If no table support needed
   };
   ```

2. **Optimize toolbar**:
   ```typescript
   const optimizedToolbar: EditorConfig = {
     toolbar: {
       groups: [
         { id: 'essential', tools: ['bold', 'italic', 'link'] }
         // Only include essential tools
       ]
     }
   };
   ```

3. **Configure debouncing**:
   ```typescript
   const debouncedConfig: EditorConfig = {
     plugins: [
       {
         name: 'auto-save',
         options: {
           debounce: 1000 // Wait 1s after typing stops
         }
       }
     ]
   };
   ```

## 🔍 Configuration Validation

The editor validates configuration and provides helpful warnings:

```typescript
// Invalid configuration will show console warnings
const invalidConfig: EditorConfig = {
  minHeight: '500px',
  maxHeight: '200px', // ⚠️ Warning: maxHeight is less than minHeight
  
  media: {
    maxFileSize: -1 // ⚠️ Warning: Invalid file size
  }
};
```

## 📚 Next Steps

- [Editor Config Details](./editor-config.md) - Deep dive into core options
- [Toolbar Configuration](./toolbar.md) - Advanced toolbar setup
- [Theme Configuration](./themes.md) - Visual customization
- [Plugin Configuration](./plugins.md) - Managing plugins

---

*For specific configuration scenarios, check out our [Examples](../examples/) section.*