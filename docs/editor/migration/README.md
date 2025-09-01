# Migration Guide

This guide helps you migrate from other rich text editors to BLG Editor, providing step-by-step instructions and code examples.

## 📋 Table of Contents

- [Migration from TinyMCE](#migration-from-tinymce)
- [Migration from CKEditor](#migration-from-ckeditor)
- [Migration from Froala](#migration-from-froala)
- [Migration from Quill](#migration-from-quill)
- [Migration from Angular Editor](#migration-from-angular-editor)
- [General Migration Tips](#general-migration-tips)
- [Troubleshooting Migration Issues](#troubleshooting-migration-issues)

## 🔄 Migration from TinyMCE

TinyMCE is one of the most popular rich text editors. Here's how to migrate:

### Before (TinyMCE 6)

```typescript
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  template: `
    <textarea #tinymceEditor></textarea>
  `
})
export class TinyMCEComponent implements OnInit {
  @ViewChild('tinymceEditor') editorRef!: ElementRef;

  ngOnInit() {
    tinymce.init({
      target: this.editorRef.nativeElement,
      plugins: 'lists link image table code',
      toolbar: 'undo redo | bold italic | bullist numlist | link image',
      height: 300,
      setup: (editor) => {
        editor.on('change', () => {
          this.onContentChange(editor.getContent());
        });
      }
    });
  }

  onContentChange(content: string) {
    console.log('Content changed:', content);
  }
}
```

### After (BLG Editor)

```typescript
import { Component } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';

@Component({
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
  `
})
export class BLGEditorComponent {
  @ViewChild('editor') editorRef!: EditorCoreComponent;

  editorConfig = {
    minHeight: '300px',
    toolbar: {
      enabled: true,
      groups: [
        { id: 'history', tools: ['undo', 'redo'] },
        { id: 'formatting', tools: ['bold', 'italic'] },
        { id: 'lists', tools: ['bulletList', 'orderedList'] },
        { id: 'insert', tools: ['link', 'image'] }
      ]
    },
    media: { uploadEnabled: true },
    tables: { enabled: true }
  };

  onContentChange(content: string) {
    console.log('Content changed:', content);
  }
}
```

### Configuration Migration

| TinyMCE Option | BLG Editor Equivalent |
|----------------|----------------------|
| `height: 300` | `minHeight: '300px'` |
| `plugins: 'lists'` | `toolbar.groups[].tools: ['bulletList', 'orderedList']` |
| `toolbar: 'bold italic'` | `toolbar.groups[].tools: ['bold', 'italic']` |
| `setup: (editor) => {}` | `(ready)="onReady($event)"` |
| `images_upload_url` | `media.uploadUrl` |
| `table_toolbar` | `tables.enabled: true` |

### Plugin Migration

```typescript
// TinyMCE custom plugin
tinymce.PluginManager.add('myplugin', (editor) => {
  editor.addButton('mybutton', {
    text: 'My Button',
    onclick: () => {
      editor.insertContent('<strong>Hello World!</strong>');
    }
  });
});

// BLG Editor equivalent
export class MyCustomPlugin implements EditorPlugin {
  name = 'my-plugin';
  
  init(editor: EditorCoreComponent) {
    editor.registerCommand('insertHello', () => {
      editor.insertContent('<strong>Hello World!</strong>');
      return true;
    });
    
    // Add to toolbar configuration
    // toolbar.groups.push({
    //   id: 'custom',
    //   tools: ['insertHello']
    // });
  }
  
  destroy() {}
}
```

## 📝 Migration from CKEditor

CKEditor has different architecture patterns. Here's the migration path:

### Before (CKEditor 5)

```typescript
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  template: `
    <div #ckeditor></div>
  `
})
export class CKEditorComponent implements OnInit {
  @ViewChild('ckeditor') editorRef!: ElementRef;
  private editor: any;

  ngOnInit() {
    ClassicEditor.create(this.editorRef.nativeElement, {
      toolbar: {
        items: [
          'heading', '|',
          'bold', 'italic', 'link', '|',
          'bulletedList', 'numberedList', '|',
          'imageUpload', 'blockQuote', 'insertTable', '|',
          'undo', 'redo'
        ]
      },
      image: {
        toolbar: ['imageStyle:full', 'imageStyle:side', 'imageTextAlternative']
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
      }
    }).then(editor => {
      this.editor = editor;
      editor.model.document.on('change:data', () => {
        this.onContentChange(editor.getData());
      });
    });
  }

  onContentChange(content: string) {
    console.log('Content:', content);
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }
}
```

### After (BLG Editor)

```typescript
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';

@Component({
  standalone: true,
  imports: [EditorCoreComponent, ToolbarComponent],
  template: `
    <div class="editor-container">
      <blg-toolbar [editorInstance]="editorRef"></blg-toolbar>
      <blg-editor-core
        #editor
        [config]="editorConfig"
        (contentChange)="onContentChange($event)"
        (ready)="onReady($event)">
      </blg-editor-core>
    </div>
  `
})
export class BLGEditorComponent implements OnDestroy {
  @ViewChild('editor') editorRef!: EditorCoreComponent;

  editorConfig = {
    toolbar: {
      enabled: true,
      groups: [
        { id: 'structure', tools: ['heading1', 'heading2'] },
        { id: 'formatting', tools: ['bold', 'italic', 'link'] },
        { id: 'lists', tools: ['bulletList', 'orderedList'] },
        { id: 'insert', tools: ['image', 'blockquote', 'table'] },
        { id: 'history', tools: ['undo', 'redo'] }
      ]
    },
    media: {
      uploadEnabled: true,
      imageResize: {
        maxWidth: 800,
        quality: 0.9
      }
    },
    tables: {
      enabled: true,
      resizable: true
    }
  };

  onContentChange(content: string) {
    console.log('Content:', content);
  }

  onReady(editor: EditorCoreComponent) {
    console.log('Editor ready:', editor);
  }

  ngOnDestroy() {
    // BLG Editor handles cleanup automatically
  }
}
```

### Feature Mapping

| CKEditor 5 Feature | BLG Editor Equivalent |
|-------------------|----------------------|
| `ClassicEditor` | `EditorCoreComponent` |
| `toolbar.items` | `toolbar.groups[].tools` |
| `image.toolbar` | `media.imageResize` |
| `table.contentToolbar` | `tables.enabled` |
| `getData()` | `getContent()` |
| `setData()` | `setContent()` |
| `model.document.on('change:data')` | `(contentChange)` |

## 🎨 Migration from Froala

Froala has extensive customization options. Here's how to migrate:

### Before (Froala Editor)

```typescript
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  template: `
    <textarea #froalaEditor></textarea>
  `
})
export class FroalaComponent implements OnInit {
  @ViewChild('froalaEditor') editorRef!: ElementRef;

  ngOnInit() {
    new FroalaEditor(this.editorRef.nativeElement, {
      toolbarButtons: {
        'moreText': {
          'buttons': ['bold', 'italic', 'underline', 'strikeThrough']
        },
        'moreParagraph': {
          'buttons': ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify']
        },
        'moreRich': {
          'buttons': ['insertLink', 'insertImage', 'insertTable']
        }
      },
      imageUploadURL: '/api/upload',
      imageMaxSize: 5 * 1024 * 1024,
      events: {
        'contentChanged': () => {
          this.onContentChange(this.editorRef.nativeElement.innerHTML);
        }
      }
    });
  }

  onContentChange(content: string) {
    console.log('Content:', content);
  }
}
```

### After (BLG Editor)

```typescript
import { Component, ViewChild } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';

@Component({
  standalone: true,
  imports: [EditorCoreComponent, ToolbarComponent],
  template: `
    <blg-toolbar [editorInstance]="editorRef"></blg-toolbar>
    <blg-editor-core
      #editor
      [config]="editorConfig"
      (contentChange)="onContentChange($event)">
    </blg-editor-core>
  `
})
export class BLGEditorComponent {
  @ViewChild('editor') editorRef!: EditorCoreComponent;

  editorConfig = {
    toolbar: {
      enabled: true,
      groups: [
        {
          id: 'text-formatting',
          label: 'Text Formatting',
          tools: ['bold', 'italic', 'underline', 'strikethrough']
        },
        {
          id: 'alignment',
          label: 'Alignment',
          tools: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify']
        },
        {
          id: 'insert-content',
          label: 'Insert',
          tools: ['link', 'image', 'table']
        }
      ]
    },
    media: {
      uploadEnabled: true,
      uploadUrl: '/api/upload',
      maxFileSize: 5 * 1024 * 1024
    }
  };

  onContentChange(content: string) {
    console.log('Content:', content);
  }
}
```

## 📜 Migration from Quill

Quill uses a different approach with deltas. Here's the migration:

### Before (Quill)

```typescript
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Quill from 'quill';

@Component({
  template: `
    <div #quillEditor></div>
  `
})
export class QuillComponent implements OnInit {
  @ViewChild('quillEditor') editorRef!: ElementRef;
  private quill!: Quill;

  ngOnInit() {
    this.quill = new Quill(this.editorRef.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image']
        ]
      }
    });

    this.quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        this.onContentChange(this.quill.root.innerHTML);
      }
    });
  }

  onContentChange(content: string) {
    console.log('Content:', content);
  }
}
```

### After (BLG Editor)

```typescript
import { Component, ViewChild } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';

@Component({
  standalone: true,
  imports: [EditorCoreComponent, ToolbarComponent],
  template: `
    <blg-toolbar [editorInstance]="editorRef"></blg-toolbar>
    <blg-editor-core
      #editor
      [config]="editorConfig"
      (contentChange)="onContentChange($event)">
    </blg-editor-core>
  `
})
export class BLGEditorComponent {
  @ViewChild('editor') editorRef!: EditorCoreComponent;

  editorConfig = {
    theme: { name: 'snow' }, // Similar to Quill's snow theme
    toolbar: {
      enabled: true,
      groups: [
        { id: 'headers', tools: ['heading1', 'heading2', 'paragraph'] },
        { id: 'formatting', tools: ['bold', 'italic', 'underline'] },
        { id: 'lists', tools: ['orderedList', 'bulletList'] },
        { id: 'insert', tools: ['link', 'image'] }
      ]
    }
  };

  onContentChange(content: string) {
    console.log('Content:', content);
  }
}
```

## 🅰️ Migration from Angular Editor

For those using ngx-editor or similar Angular-specific editors:

### Before (ngx-editor)

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  template: `
    <form [formGroup]="form">
      <ngx-editor-menu [editor]="editor"></ngx-editor-menu>
      <ngx-editor 
        [editor]="editor" 
        formControlName="content"
        placeholder="Type here...">
      </ngx-editor>
    </form>
  `
})
export class NgxEditorComponent {
  editor = new Editor();
  
  form = new FormGroup({
    content: new FormControl('')
  });

  ngOnDestroy() {
    this.editor.destroy();
  }
}
```

### After (BLG Editor)

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, EditorCoreComponent, ToolbarComponent],
  template: `
    <form [formGroup]="form">
      <blg-toolbar [editorInstance]="editorRef"></blg-toolbar>
      <blg-editor-core
        #editor
        [config]="editorConfig"
        [content]="form.get('content')?.value || ''"
        (contentChange)="updateFormControl($event)">
      </blg-editor-core>
    </form>
  `
})
export class BLGEditorComponent {
  @ViewChild('editor') editorRef!: EditorCoreComponent;

  form = new FormGroup({
    content: new FormControl('')
  });

  editorConfig = {
    placeholder: 'Type here...',
    toolbar: { enabled: true }
  };

  updateFormControl(content: string) {
    this.form.patchValue({ content }, { emitEvent: false });
  }

  // BLG Editor handles cleanup automatically
}
```

## 💡 General Migration Tips

### 1. Content Compatibility

Most HTML content should work directly, but you may need to clean up:

```typescript
// Content migration utility
export class ContentMigrator {
  static migrateFromTinyMCE(content: string): string {
    return content
      .replace(/<p>&nbsp;<\/p>/g, '<p></p>') // Remove non-breaking spaces
      .replace(/data-mce-[^=]*="[^"]*"/g, '') // Remove TinyMCE attributes
      .replace(/<span[^>]*><\/span>/g, ''); // Remove empty spans
  }

  static migrateFromCKEditor(content: string): string {
    return content
      .replace(/<figure[^>]*class="[^"]*image[^"]*"[^>]*>/g, '<figure>')
      .replace(/data-ck-[^=]*="[^"]*"/g, '') // Remove CKEditor attributes
      .replace(/<ck-[^>]*>/g, '') // Remove CKEditor elements
      .replace(/<\/ck-[^>]*>/g, '');
  }

  static migrateFromQuill(content: string): string {
    return content
      .replace(/<div class="ql-[^"]*"[^>]*>/g, '<div>')
      .replace(/<span class="ql-[^"]*"[^>]*>/g, '<span>')
      .replace(/class="ql-[^"]*"/g, ''); // Remove Quill classes
  }
}
```

### 2. Configuration Mapping

Create a mapping utility for configuration:

```typescript
export class ConfigMigrator {
  static fromTinyMCE(tinyConfig: any): EditorConfig {
    return {
      minHeight: tinyConfig.height ? `${tinyConfig.height}px` : '300px',
      toolbar: {
        enabled: !!tinyConfig.toolbar,
        groups: this.parseToolbarButtons(tinyConfig.toolbar)
      },
      media: {
        uploadEnabled: !!tinyConfig.images_upload_url,
        uploadUrl: tinyConfig.images_upload_url,
        maxFileSize: tinyConfig.images_max_size
      }
    };
  }

  static fromCKEditor(ckConfig: any): EditorConfig {
    return {
      toolbar: {
        enabled: true,
        groups: this.parseCKToolbar(ckConfig.toolbar?.items || [])
      },
      media: {
        uploadEnabled: !!ckConfig.image?.upload,
        imageResize: {
          maxWidth: ckConfig.image?.resizeOptions?.maxWidth || 800
        }
      }
    };
  }

  private static parseToolbarButtons(toolbar: string): ToolbarGroup[] {
    // Implementation for parsing toolbar configuration
    // This would be specific to each editor's format
    return [];
  }
}
```

### 3. Event Migration

Map event handlers:

```typescript
export class EventMigrator {
  static mapTinyMCEEvents(editor: EditorCoreComponent, tinyEvents: any) {
    if (tinyEvents.change) {
      editor.contentChange.subscribe(tinyEvents.change);
    }
    if (tinyEvents.focus) {
      editor.focusEvent.subscribe(tinyEvents.focus);
    }
    if (tinyEvents.blur) {
      editor.blurEvent.subscribe(tinyEvents.blur);
    }
  }

  static mapCKEditorEvents(editor: EditorCoreComponent, ckEvents: any) {
    if (ckEvents['change:data']) {
      editor.contentChange.subscribe(ckEvents['change:data']);
    }
    if (ckEvents.focus) {
      editor.focusEvent.subscribe(ckEvents.focus);
    }
  }
}
```

### 4. Plugin Migration

Create a plugin adapter:

```typescript
export class PluginAdapter {
  static adaptTinyMCEPlugin(tinyPlugin: any): EditorPlugin {
    return {
      name: tinyPlugin.name,
      version: '1.0.0',
      
      init(editor: EditorCoreComponent) {
        // Adapt TinyMCE plugin logic
        if (tinyPlugin.init) {
          tinyPlugin.init({
            addButton: (name: string, config: any) => {
              editor.registerCommand(name, config.onclick);
            },
            insertContent: (content: string) => {
              editor.insertContent(content);
            }
          });
        }
      },
      
      destroy() {
        if (tinyPlugin.destroy) {
          tinyPlugin.destroy();
        }
      }
    };
  }
}
```

## 🐛 Troubleshooting Migration Issues

### Common Issues

1. **Styles not applying correctly**:
   ```scss
   // Add compatibility styles
   .blg-editor-core {
     // Reset previous editor styles
     .mce-content-body,
     .ck-content,
     .ql-editor {
       all: unset;
     }
   }
   ```

2. **Content not displaying**:
   ```typescript
   // Clean content before setting
   ngOnInit() {
     const cleanContent = this.sanitizeContent(this.originalContent);
     this.editorConfig = {
       ...this.editorConfig,
       content: cleanContent
     };
   }
   ```

3. **Event handlers not working**:
   ```typescript
   // Ensure proper event binding
   ngAfterViewInit() {
     this.editor.ready.subscribe(() => {
       // Set up event handlers after editor is ready
       this.setupEventHandlers();
     });
   }
   ```

### Migration Checklist

- [ ] Install BLG Editor packages
- [ ] Update component imports
- [ ] Migrate configuration options
- [ ] Convert event handlers
- [ ] Adapt custom plugins
- [ ] Clean up old dependencies
- [ ] Test all functionality
- [ ] Update build scripts
- [ ] Verify accessibility
- [ ] Performance testing

### Getting Help

If you encounter issues during migration:

1. Check our [Troubleshooting Guide](../troubleshooting/README.md)
2. Search [GitHub Issues](https://github.com/blg/editor/issues)
3. Ask on [GitHub Discussions](https://github.com/blg/editor/discussions)
4. Contact support for complex migrations

---

*For specific migration scenarios not covered here, please [open an issue](https://github.com/blg/editor/issues/new) with your use case.*