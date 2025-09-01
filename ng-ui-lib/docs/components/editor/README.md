# BLG Rich Text Editor Component

The BLG Rich Text Editor is a comprehensive WYSIWYG editor for Angular applications, providing powerful text editing capabilities with modern UI/UX and extensive customization options.

## 🚀 Features

### Core Editing Features
- **Rich Text Formatting** - Bold, italic, underline, strikethrough, code
- **Font Styling** - Font family, size, color, highlight color
- **Text Alignment** - Left, center, right, justify
- **Lists** - Bulleted and numbered lists with nesting
- **Links** - Insert and edit hyperlinks with validation
- **Images** - Upload, insert, resize, and position images
- **Tables** - Insert and edit tables with advanced features
- **Code Blocks** - Syntax highlighting for multiple languages
- **Special Characters** - Insert symbols and special characters

### Advanced Features
- **Collaborative Editing** - Real-time collaboration support
- **Version History** - Track and restore document versions
- **Auto-Save** - Automatic content saving with conflict resolution
- **Spell Check** - Built-in spell checking with custom dictionaries
- **Word Count** - Live word/character counting
- **Find & Replace** - Advanced search and replace functionality
- **Keyboard Shortcuts** - Extensive keyboard support

### Export Capabilities
- **HTML Export** - Clean, semantic HTML output
- **PDF Export** - Professional PDF documents with styling
- **Word Export** - Microsoft Word (.docx) format
- **Markdown Export** - GitHub-flavored markdown
- **Plain Text Export** - Stripped text content

## 🔧 Installation

### Basic Installation
```bash
npm install @ng-ui-lib/core @ng-ui-lib/editor-core @ng-ui-lib/editor-toolbar @ng-ui-lib/editor-formats @ng-ui-lib/theme
```

### Full Installation
For all editor features:
```bash
npm install @ng-ui-lib/core @ng-ui-lib/editor-core @ng-ui-lib/editor-toolbar @ng-ui-lib/editor-formats @ng-ui-lib/editor-media @ng-ui-lib/editor-tables @ng-ui-lib/editor-plugins @ng-ui-lib/editor-themes @ng-ui-lib/theme
```

### Import Styles
```css
/* styles.css */
@import '@ng-ui-lib/theme/styles/default-theme.css';
@import '@ng-ui-lib/editor-themes/styles/default-editor.css';
```

## 🎯 Quick Start

### Basic Editor Setup

```typescript
import { Component } from '@angular/core';
import { RichTextEditor } from '@ng-ui-lib/editor-core';
import { EditorConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-document-editor',
  standalone: true,
  imports: [RichTextEditor],
  template: `
    <div class="editor-container">
      <ng-ui-lib-editor
        [config]="editorConfig"
        [initialContent]="documentContent"
        (contentChanged)="onContentChanged($event)"
        (documentExported)="onDocumentExported($event)"
        (selectionChanged)="onSelectionChanged($event)">
      </ng-ui-lib-editor>
    </div>
  `,
  styles: [`
    .editor-container {
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class DocumentEditorComponent {
  documentContent = `
    <h1>Welcome to BLG Editor</h1>
    <p>This is a <strong>rich text editor</strong> with powerful features.</p>
    <ul>
      <li>Easy to use toolbar</li>
      <li>Multiple export formats</li>
      <li>Collaborative editing</li>
    </ul>
  `;

  editorConfig: EditorConfig = {
    toolbar: {
      items: [
        // Text formatting
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'fontFamily', 'fontSize', 'fontColor', 'backgroundColor', '|',
        
        // Paragraph formatting
        'alignment', 'outdent', 'indent', '|',
        'bulletedList', 'numberedList', '|',
        
        // Insert features
        'link', 'imageUpload', 'insertTable', 'horizontalLine', '|',
        'codeBlock', 'blockQuote', 'specialCharacters', '|',
        
        // Tools
        'findAndReplace', 'spellChecker', 'wordCount', '|',
        'undo', 'redo', '|',
        
        // Export options
        'export'
      ],
      floating: false,
      sticky: true
    },
    
    // Export configuration
    exportFormats: ['html', 'pdf', 'docx', 'markdown'],
    
    // Media upload settings
    mediaUpload: {
      enabled: true,
      maxFileSize: 10485760, // 10MB
      allowedTypes: ['image/*'],
      uploadUrl: '/api/upload',
      resizeImages: true,
      maxImageWidth: 800,
      maxImageHeight: 600
    },
    
    // Collaboration settings
    collaboration: {
      enabled: true,
      websocketUrl: 'ws://localhost:3001',
      userId: 'user123',
      userName: 'John Doe'
    },
    
    // Auto-save configuration
    autoSave: {
      enabled: true,
      interval: 5000, // 5 seconds
      saveUrl: '/api/save-document'
    },
    
    // Accessibility
    accessibility: {
      enabled: true,
      announceChanges: true,
      keyboardShortcuts: true
    }
  };

  onContentChanged(content: string) {
    console.log('Content updated:', content);
    // Auto-save logic here
  }

  onDocumentExported(result: any) {
    console.log('Document exported:', result);
  }

  onSelectionChanged(selection: any) {
    console.log('Selection changed:', selection);
  }
}
```

## 🛠️ Toolbar Configuration

### Standard Toolbar
```typescript
const toolbarConfig = {
  items: [
    'bold', 'italic', 'underline', '|',
    'fontSize', 'fontColor', '|',
    'bulletedList', 'numberedList', '|',
    'link', 'imageUpload', '|',
    'undo', 'redo'
  ],
  floating: false,
  sticky: true,
  grouping: true
};
```

### Custom Toolbar Buttons
```typescript
import { ToolbarButton } from '@ng-ui-lib/editor-toolbar';

@Component({
  selector: 'app-custom-button',
  template: `
    <button (click)="insertTemplate()">
      Insert Template
    </button>
  `
})
export class CustomButtonComponent extends ToolbarButton {
  insertTemplate() {
    this.editor.insertHtml(`
      <div class="template">
        <h3>Meeting Notes</h3>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Attendees:</strong></p>
        <ul><li></li></ul>
        <p><strong>Action Items:</strong></p>
        <ul><li></li></ul>
      </div>
    `);
  }
}

// Register custom button
const editorConfig: EditorConfig = {
  toolbar: {
    items: [
      'bold', 'italic', '|',
      CustomButtonComponent, // Custom button
      '|',
      'export'
    ]
  }
};
```

### Floating Toolbar
```typescript
const floatingToolbarConfig = {
  items: ['bold', 'italic', 'link', 'fontColor'],
  floating: true,
  showOnSelection: true,
  position: 'top' // 'top', 'bottom', 'auto'
};
```

## 📝 Content Formatting

### Text Formatting
```typescript
export class EditorComponent {
  // Apply formatting programmatically
  formatText() {
    this.editor.format('bold', true);
    this.editor.format('fontSize', '16px');
    this.editor.format('color', '#ff0000');
  }
  
  // Check current formatting
  getCurrentFormat() {
    const format = this.editor.getFormat();
    console.log('Current format:', format);
    // { bold: true, italic: false, fontSize: '14px', ... }
  }
}
```

### Lists and Indentation
```typescript
// Create lists
this.editor.insertList('ordered'); // or 'bullet'
this.editor.indent(1); // Increase indent
this.editor.indent(-1); // Decrease indent

// Custom list styles
const listConfig = {
  bulletStyles: ['disc', 'circle', 'square'],
  numberedStyles: ['decimal', 'lower-alpha', 'upper-roman']
};
```

### Tables
```typescript
// Insert table
this.editor.insertTable({
  rows: 3,
  columns: 4,
  headerRow: true,
  headerColumn: false,
  style: {
    borderColor: '#ddd',
    borderWidth: '1px',
    cellPadding: '8px'
  }
});

// Table manipulation
this.editor.table.insertRow('above'); // or 'below'
this.editor.table.insertColumn('left'); // or 'right' 
this.editor.table.deleteRow();
this.editor.table.deleteColumn();
this.editor.table.mergeCells();
this.editor.table.splitCell();
```

## 🖼️ Media Handling

### Image Upload
```typescript
const mediaConfig = {
  mediaUpload: {
    enabled: true,
    maxFileSize: 10485760, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadUrl: '/api/upload-image',
    
    // Image processing
    resizeImages: true,
    maxImageWidth: 1200,
    maxImageHeight: 800,
    imageQuality: 0.8,
    
    // Upload progress
    showProgress: true,
    onUploadStart: (file: File) => {
      console.log('Upload started:', file.name);
    },
    onUploadProgress: (progress: number) => {
      console.log('Upload progress:', progress);
    },
    onUploadComplete: (url: string) => {
      console.log('Upload complete:', url);
    }
  }
};
```

### Custom Image Handling
```typescript
export class EditorComponent {
  // Insert image from URL
  insertImage(url: string, alt: string = '') {
    this.editor.insertImage({
      src: url,
      alt: alt,
      width: 'auto',
      height: 'auto'
    });
  }
  
  // Handle image selection
  onImageSelected(imageElement: HTMLImageElement) {
    // Show image properties panel
    this.showImageProperties(imageElement);
  }
  
  // Resize image
  resizeImage(element: HTMLImageElement, width: number, height: number) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  }
}
```

### Video Embedding
```typescript
// Embed video
this.editor.insertVideo({
  src: 'https://youtube.com/watch?v=VIDEO_ID',
  width: 560,
  height: 315,
  controls: true,
  autoplay: false
});
```

## 📤 Export Features

### HTML Export
```typescript
exportToHTML() {
  this.editor.exportToHTML({
    filename: 'document.html',
    includeStyles: true,
    inlineStyles: false,
    cleanOutput: true,
    preserveFormatting: true,
    template: 'modern' // 'basic', 'modern', 'custom'
  });
}
```

### PDF Export
```typescript
exportToPDF() {
  this.editor.exportToPDF({
    filename: 'document.pdf',
    pageFormat: 'A4',
    orientation: 'portrait',
    margins: {
      top: 20,
      right: 20, 
      bottom: 20,
      left: 20
    },
    header: {
      text: 'Company Document',
      fontSize: 12,
      alignment: 'center'
    },
    footer: {
      text: 'Page {PAGE} of {TOTAL}',
      fontSize: 10,
      alignment: 'right'
    },
    styling: {
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4
    }
  });
}
```

### Word Export
```typescript
exportToDocx() {
  this.editor.exportToDocx({
    filename: 'document.docx',
    author: 'John Doe',
    title: 'Project Report',
    subject: 'Monthly Status',
    preserveFormatting: true,
    includeImages: true,
    templatePath: '/assets/templates/document-template.docx'
  });
}
```

### Markdown Export
```typescript
exportToMarkdown() {
  this.editor.exportToMarkdown({
    filename: 'document.md',
    flavor: 'github', // 'standard', 'github', 'commonmark'
    includeImages: true,
    imageBaseUrl: 'https://mysite.com/images/',
    preserveHtml: false // Convert HTML to markdown equivalent
  });
}
```

## 🤝 Collaborative Editing

### Setup Collaboration
```typescript
const collaborationConfig = {
  collaboration: {
    enabled: true,
    websocketUrl: 'wss://collab-server.com/ws',
    documentId: 'doc-123',
    userId: 'user-456', 
    userName: 'John Doe',
    userColor: '#2196F3',
    
    // Conflict resolution
    conflictResolution: 'operational-transform', // or 'last-writer-wins'
    
    // Presence indicators
    showCursors: true,
    showSelections: true,
    showUsers: true,
    
    // Comments and suggestions
    enableComments: true,
    enableSuggestions: true
  }
};
```

### Real-time Events
```typescript
export class CollaborativeEditorComponent {
  onUserJoined(user: any) {
    console.log(`${user.name} joined the document`);
  }
  
  onUserLeft(user: any) {
    console.log(`${user.name} left the document`);
  }
  
  onCursorPositionChanged(user: any, position: any) {
    // Update cursor position for other users
    this.updateUserCursor(user.id, position);
  }
  
  onCommentAdded(comment: any) {
    console.log('New comment:', comment);
  }
  
  onSuggestionMade(suggestion: any) {
    console.log('New suggestion:', suggestion);
  }
}
```

## 🎨 Theming and Styling

### Built-in Themes
```typescript
const editorConfig: EditorConfig = {
  theme: 'default' | 'dark' | 'minimal' | 'professional' | 'creative'
};
```

### Custom Theme
```scss
// custom-editor-theme.scss
.blg-editor.theme-custom {
  --editor-bg-color: #fafafa;
  --editor-text-color: #333;
  --editor-border-color: #ddd;
  --toolbar-bg-color: #ffffff;
  --toolbar-button-hover: #f0f0f0;
  --toolbar-button-active: #e0e0e0;
  
  .blg-editor__toolbar {
    background: var(--toolbar-bg-color);
    border-bottom: 1px solid var(--editor-border-color);
  }
  
  .blg-editor__content {
    background: var(--editor-bg-color);
    color: var(--editor-text-color);
    font-family: 'Georgia', serif;
    line-height: 1.6;
  }
}
```

### Dynamic Styling
```typescript
export class ThemedEditorComponent {
  currentTheme = 'default';
  
  switchTheme(theme: string) {
    this.currentTheme = theme;
    this.editor.setTheme(theme);
  }
  
  customizeStyle() {
    this.editor.setStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5',
      backgroundColor: '#ffffff',
      textColor: '#333333'
    });
  }
}
```

## ♿ Accessibility Features

### ARIA Support
```typescript
const accessibilityConfig = {
  accessibility: {
    enabled: true,
    ariaLabel: 'Rich text editor',
    ariaDescription: 'Use toolbar buttons or keyboard shortcuts to format text',
    announceChanges: true,
    announceFormatting: true,
    keyboardShortcuts: true,
    skipLinks: true
  }
};
```

### Keyboard Shortcuts
```typescript
const shortcuts = {
  'Ctrl+B': 'bold',
  'Ctrl+I': 'italic', 
  'Ctrl+U': 'underline',
  'Ctrl+K': 'link',
  'Ctrl+Z': 'undo',
  'Ctrl+Y': 'redo',
  'Ctrl+S': 'save',
  'Ctrl+P': 'print',
  'Tab': 'indent',
  'Shift+Tab': 'outdent'
};

// Custom shortcuts
this.editor.addKeyboardShortcut('Ctrl+Shift+X', () => {
  this.insertCustomContent();
});
```

## 🧪 Testing

### Component Testing
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RichTextEditor } from '@ng-ui-lib/editor-core';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextEditor]
    }).compileComponents();
    
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format text as bold', () => {
    component.editor.setContent('<p>Hello World</p>');
    component.editor.selectAll();
    component.editor.format('bold', true);
    
    expect(component.editor.getContent()).toContain('<strong>Hello World</strong>');
  });

  it('should insert image', () => {
    const imageUrl = 'https://example.com/image.jpg';
    component.editor.insertImage({ src: imageUrl, alt: 'Test image' });
    
    expect(component.editor.getContent()).toContain(`<img src="${imageUrl}"`);
  });
});
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('editor functionality', async ({ page }) => {
  await page.goto('/editor-demo');
  
  // Check editor loads
  await expect(page.locator('.blg-editor')).toBeVisible();
  
  // Test text input
  await page.locator('.blg-editor__content').fill('Hello World');
  await expect(page.locator('.blg-editor__content')).toContainText('Hello World');
  
  // Test formatting
  await page.locator('.blg-editor__content').selectText();
  await page.click('.toolbar-button[data-command="bold"]');
  await expect(page.locator('strong')).toContainText('Hello World');
  
  // Test export
  await page.click('.export-button[data-format="pdf"]');
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('.pdf');
});
```

## 📚 API Reference

### Main Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `initialContent` | `string` | `''` | Initial HTML content |
| `config` | `EditorConfig` | `{}` | Editor configuration |
| `readonly` | `boolean` | `false` | Read-only mode |
| `placeholder` | `string` | `''` | Placeholder text |
| `maxLength` | `number` | `null` | Maximum character limit |
| `autoFocus` | `boolean` | `false` | Auto focus on load |

### Events

| Event | Type | Description |
|-------|------|-------------|
| `contentChanged` | `string` | Fired when content changes |
| `selectionChanged` | `SelectionEvent` | Fired when text selection changes |
| `formatChanged` | `FormatEvent` | Fired when formatting changes |
| `imageUploaded` | `ImageUploadEvent` | Fired when image upload completes |
| `documentExported` | `ExportResult` | Fired when document export completes |
| `collaboratorJoined` | `CollaboratorEvent` | Fired when user joins collaboration |
| `commentAdded` | `CommentEvent` | Fired when comment is added |

### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `setContent` | `content: string` | `void` | Set editor content |
| `getContent` | - | `string` | Get current content |
| `insertHtml` | `html: string` | `void` | Insert HTML at cursor |
| `format` | `command: string, value?: any` | `void` | Apply formatting |
| `getFormat` | - | `FormatState` | Get current format state |
| `selectAll` | - | `void` | Select all content |
| `focus` | - | `void` | Focus editor |
| `blur` | - | `void` | Blur editor |
| `undo` | - | `void` | Undo last action |
| `redo` | - | `void` | Redo last undone action |

## 🔗 Related Documentation

- **[Installation Guide](../../GETTING_STARTED.md)** - Getting started with BLG Editor
- **[Export Features](../../features/export/editor-export.md)** - Detailed export documentation
- **[Theming Guide](../../features/themes/)** - Custom theme creation
- **[API Reference](../../API_REFERENCE.md)** - Complete API documentation
- **[Examples](../../examples/editor-examples/)** - More examples and demos

## 🆘 Troubleshooting

### Common Issues

**Editor not loading content**
- Check that `initialContent` is valid HTML
- Verify editor configuration is correct
- Ensure theme CSS is loaded

**Image upload failing**
- Check upload URL and server endpoint
- Verify file size and type restrictions
- Check network connectivity and CORS settings

**Export not working**
- Verify export format is supported
- Check browser popup blockers
- Ensure proper server-side export handlers

**Collaboration issues**
- Check WebSocket connection
- Verify user authentication
- Check firewall and network settings

For more troubleshooting help, see the [Troubleshooting Guide](../../support/troubleshooting.md).