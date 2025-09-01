# Quick Start Guide

Get BLG Editor up and running in your Angular application in just a few minutes.

## 🚀 Installation

Install the core editor package:

```bash
npm install @ng-ui/editor-core @ng-ui/editor-toolbar @ng-ui/editor-formats
```

## 📝 Basic Usage

### 1. Import the Editor Component

```typescript
import { Component } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [EditorCoreComponent],
  template: `
    <blg-editor-core
      [config]="editorConfig"
      (contentChange)="onContentChange($event)">
    </blg-editor-core>
  `
})
export class MyComponent {
  editorConfig = {
    placeholder: 'Start writing...',
    minHeight: '200px'
  };

  onContentChange(content: string) {
    console.log('Content changed:', content);
  }
}
```

### 2. Add Toolbar (Optional)

For a complete editing experience, add the toolbar:

```typescript
import { Component } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';

@Component({
  selector: 'app-editor-with-toolbar',
  standalone: true,
  imports: [EditorCoreComponent, ToolbarComponent],
  template: `
    <div class="editor-container">
      <blg-toolbar [editorInstance]="editorRef"></blg-toolbar>
      <blg-editor-core 
        #editor
        [config]="editorConfig"
        (contentChange)="onContentChange($event)">
      </blg-editor-core>
    </div>
  `,
  styles: [`
    .editor-container {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
  `]
})
export class EditorWithToolbarComponent {
  @ViewChild('editor') editorRef!: EditorCoreComponent;

  editorConfig = {
    placeholder: 'Start writing...',
    minHeight: '300px',
    toolbar: {
      enabled: true,
      groups: [
        { id: 'formatting', tools: ['bold', 'italic', 'underline'] },
        { id: 'lists', tools: ['bulletList', 'orderedList'] },
        { id: 'insert', tools: ['link', 'image'] }
      ]
    }
  };

  onContentChange(content: string) {
    console.log('Content changed:', content);
  }
}
```

### 3. Advanced Configuration

For more features, configure additional options:

```typescript
import { EditorConfig } from '@ng-ui/editor-core';

export class AdvancedEditorComponent {
  editorConfig: EditorConfig = {
    // Content options
    content: '<p>Initial content</p>',
    placeholder: 'Enter your content here...',
    autoFocus: true,
    maxLength: 10000,

    // Layout options
    minHeight: '400px',
    maxHeight: '600px',

    // Toolbar configuration
    toolbar: {
      enabled: true,
      position: 'top',
      sticky: true,
      groups: [
        {
          id: 'text-formatting',
          label: 'Text Formatting',
          tools: ['bold', 'italic', 'underline', 'strikethrough']
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
          id: 'insert',
          label: 'Insert',
          tools: ['link', 'image', 'table', 'horizontalRule']
        }
      ]
    },

    // Media configuration
    media: {
      uploadEnabled: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
      uploadUrl: '/api/upload',
      imageResize: {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8
      }
    },

    // Table configuration
    tables: {
      enabled: true,
      defaultSize: { rows: 3, columns: 3 },
      resizable: true,
      maxSize: { rows: 20, columns: 10 }
    },

    // Theme configuration
    theme: {
      name: 'default',
      darkMode: false
    },

    // Event handlers
    eventHandlers: {
      onChange: (content) => this.handleContentChange(content),
      onFocus: (event) => this.handleFocus(event),
      onBlur: (event) => this.handleBlur(event)
    },

    // Accessibility
    accessibility: {
      ariaLabel: 'Rich text editor',
      announceChanges: true,
      keyboardShortcuts: {
        'Ctrl+B': 'bold',
        'Ctrl+I': 'italic',
        'Ctrl+U': 'underline'
      }
    }
  };

  handleContentChange(content: string) {
    // Handle content changes
    console.log('Content updated:', content);
  }

  handleFocus(event: FocusEvent) {
    console.log('Editor focused');
  }

  handleBlur(event: FocusEvent) {
    console.log('Editor blurred');
  }
}
```

## 🎨 Styling

Add basic styles for the editor:

```scss
// styles.scss or component styles
.editor-container {
  .blg-editor-core {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    
    .editor-content {
      padding: 16px;
      
      &:focus {
        outline: none;
      }
    }
  }
  
  .blg-toolbar {
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 8px;
    
    .toolbar-group {
      display: inline-flex;
      margin-right: 16px;
      
      .toolbar-button {
        padding: 6px 12px;
        margin: 0 2px;
        border: none;
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
        
        &:hover {
          background: #e9ecef;
        }
        
        &.active {
          background: #007bff;
          color: white;
        }
      }
    }
  }
}
```

## 🔧 Form Integration

Integrate with Angular forms:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EditorCoreComponent } from '@ng-ui/editor-core';

@Component({
  selector: 'app-form-integration',
  template: `
    <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="title">Title</label>
        <input id="title" formControlName="title" class="form-control">
      </div>
      
      <div class="form-group">
        <label>Content</label>
        <blg-editor-core
          [config]="editorConfig"
          [content]="myForm.get('content')?.value"
          (contentChange)="onEditorChange($event)">
        </blg-editor-core>
        <div *ngIf="myForm.get('content')?.invalid && myForm.get('content')?.touched" 
             class="error">
          Content is required
        </div>
      </div>
      
      <button type="submit" [disabled]="myForm.invalid">Save</button>
    </form>
  `
})
export class FormIntegrationComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  editorConfig = {
    placeholder: 'Enter article content...',
    minHeight: '300px'
  };

  onEditorChange(content: string) {
    this.myForm.patchValue({ content });
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log('Form data:', this.myForm.value);
    }
  }
}
```

## 🎯 Next Steps

Congratulations! You now have BLG Editor running in your application. Here's what to explore next:

### Essential Reading
- [Configuration Guide](../configuration/overview.md) - Customize your editor
- [Text Formatting](../features/text-formatting/README.md) - Rich text capabilities
- [Toolbar Customization](../features/toolbar/README.md) - Advanced toolbar features

### Common Use Cases
- [Adding Custom Plugins](../guides/plugin-development.md)
- [Server Integration](../guides/server-integration.md)
- [Performance Optimization](../guides/performance-optimization.md)

### Examples
- [Basic Examples](../examples/basic/README.md)
- [Advanced Use Cases](../examples/advanced/README.md)

## 💡 Tips for Success

1. **Start Simple**: Begin with basic configuration and add features as needed
2. **Test Early**: Test your editor in different browsers and devices
3. **Performance**: Monitor bundle size and rendering performance
4. **Accessibility**: Always include proper ARIA labels and keyboard navigation
5. **Security**: Sanitize content when saving to prevent XSS attacks

## 🔍 Common Issues

- **Editor not showing?** Check that you've imported the component and added it to your imports array
- **Toolbar not working?** Ensure you have a reference to the editor instance
- **Styles look off?** Make sure you've included the base styles

For more troubleshooting help, see our [Troubleshooting Guide](../troubleshooting/README.md).

---

*Need help? Check out our [full documentation](../INDEX.md) or [ask a question](https://github.com/blg/editor/discussions).*