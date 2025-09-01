# Basic Examples

This section provides simple, straightforward examples to help you get started with BLG Editor quickly.

## 📋 Table of Contents

- [Minimal Editor](#minimal-editor)
- [Editor with Toolbar](#editor-with-toolbar)
- [Form Integration](#form-integration)
- [Content Initialization](#content-initialization)
- [Event Handling](#event-handling)
- [Readonly Mode](#readonly-mode)
- [Custom Styling](#custom-styling)
- [Mobile Responsive](#mobile-responsive)

## 🚀 Minimal Editor

The simplest possible editor setup:

```typescript
import { Component } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';

@Component({
  selector: 'app-minimal-editor',
  standalone: true,
  imports: [EditorCoreComponent],
  template: `
    <blg-editor-core
      placeholder="Start typing..."
      (contentChange)="onContentChange($event)">
    </blg-editor-core>
  `
})
export class MinimalEditorComponent {
  onContentChange(content: string) {
    console.log('Content:', content);
  }
}
```

**Features:**
- Basic rich text editing
- Placeholder text
- Content change events

## 🛠️ Editor with Toolbar

Adding a customizable toolbar:

```typescript
import { Component, ViewChild } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { ToolbarComponent } from '@ng-ui/editor-toolbar';

@Component({
  selector: 'app-toolbar-editor',
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
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ToolbarEditorComponent {
  @ViewChild('editor') editorRef!: EditorCoreComponent;

  editorConfig = {
    placeholder: 'Write your content here...',
    minHeight: '300px',
    toolbar: {
      enabled: true,
      groups: [
        {
          id: 'formatting',
          tools: ['bold', 'italic', 'underline']
        },
        {
          id: 'structure', 
          tools: ['heading1', 'heading2', 'paragraph']
        },
        {
          id: 'lists',
          tools: ['bulletList', 'orderedList']
        },
        {
          id: 'insert',
          tools: ['link', 'horizontalRule']
        }
      ]
    }
  };

  onContentChange(content: string) {
    console.log('Content updated:', content);
  }
}
```

**Features:**
- Complete toolbar with formatting options
- Grouped tools for better organization
- Custom container styling

## 📝 Form Integration

Integrating the editor with Angular reactive forms:

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditorCoreComponent],
  template: `
    <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="title">Article Title *</label>
        <input 
          id="title" 
          type="text"
          formControlName="title"
          class="form-control"
          placeholder="Enter article title">
        <div *ngIf="articleForm.get('title')?.invalid && articleForm.get('title')?.touched" 
             class="error-message">
          Title is required
        </div>
      </div>

      <div class="form-group">
        <label>Article Content *</label>
        <blg-editor-core
          [config]="editorConfig"
          [content]="articleForm.get('content')?.value || ''"
          (contentChange)="onEditorChange($event)">
        </blg-editor-core>
        <div *ngIf="articleForm.get('content')?.invalid && articleForm.get('content')?.touched" 
             class="error-message">
          Content is required
        </div>
      </div>

      <div class="form-group">
        <label for="category">Category</label>
        <select id="category" formControlName="category" class="form-control">
          <option value="">Select a category</option>
          <option value="technology">Technology</option>
          <option value="business">Business</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" (click)="saveDraft()">Save Draft</button>
        <button type="submit" [disabled]="articleForm.invalid">Publish</button>
      </div>
    </form>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
    }

    button[type="submit"] {
      background-color: #3b82f6;
      color: white;
    }

    button[type="submit"]:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    button[type="button"] {
      background-color: #f3f4f6;
      color: #374151;
    }
  `]
})
export class FormEditorComponent implements OnInit {
  articleForm!: FormGroup;

  editorConfig = {
    placeholder: 'Write your article content here...',
    minHeight: '350px',
    toolbar: {
      enabled: true,
      groups: [
        { id: 'formatting', tools: ['bold', 'italic', 'underline'] },
        { id: 'structure', tools: ['heading2', 'heading3', 'paragraph'] },
        { id: 'lists', tools: ['bulletList', 'orderedList'] },
        { id: 'insert', tools: ['link', 'blockquote'] }
      ]
    }
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: ['']
    });
  }

  onEditorChange(content: string) {
    this.articleForm.patchValue({ content }, { emitEvent: false });
    this.articleForm.get('content')?.markAsTouched();
  }

  saveDraft() {
    const formData = this.articleForm.value;
    localStorage.setItem('article-draft', JSON.stringify(formData));
    console.log('Draft saved:', formData);
  }

  onSubmit() {
    if (this.articleForm.valid) {
      const formData = this.articleForm.value;
      console.log('Article submitted:', formData);
      // Here you would typically send the data to your backend
    }
  }
}
```

**Features:**
- Full form validation
- Real-time content updates
- Draft saving functionality
- Professional form styling

## 📄 Content Initialization

Loading content from different sources:

```typescript
import { Component, OnInit } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-content-init',
  standalone: true,
  imports: [EditorCoreComponent],
  template: `
    <div class="content-options">
      <button (click)="loadSampleContent()">Load Sample</button>
      <button (click)="loadFromLocalStorage()">Load from Storage</button>
      <button (click)="loadFromServer()">Load from Server</button>
      <button (click)="clearContent()">Clear Content</button>
    </div>

    <blg-editor-core
      [config]="editorConfig"
      [content]="currentContent"
      (contentChange)="onContentChange($event)">
    </blg-editor-core>

    <div class="content-info">
      <p>Characters: {{ characterCount }}</p>
      <p>Words: {{ wordCount }}</p>
    </div>
  `,
  styles: [`
    .content-options {
      margin-bottom: 1rem;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .content-options button {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .content-options button:hover {
      background: #e5e7eb;
    }

    .content-info {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .content-info p {
      margin: 0.25rem 0;
    }
  `]
})
export class ContentInitComponent implements OnInit {
  currentContent = '';
  characterCount = 0;
  wordCount = 0;

  editorConfig = {
    placeholder: 'Content will appear here...',
    minHeight: '300px',
    toolbar: { enabled: true }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load any previously saved content
    this.loadFromLocalStorage();
  }

  loadSampleContent() {
    this.currentContent = `
      <h1>Welcome to BLG Editor</h1>
      <p>This is a sample document with <strong>rich formatting</strong>.</p>
      <ul>
        <li>Bold and <em>italic</em> text</li>
        <li>Lists and headings</li>
        <li>Links and <a href="#">hyperlinks</a></li>
      </ul>
      <blockquote>
        <p>This is a blockquote with some inspiring content.</p>
      </blockquote>
      <p>You can edit this content or clear it to start fresh.</p>
    `;
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('editor-content');
    if (saved) {
      this.currentContent = saved;
    }
  }

  loadFromServer() {
    // Example API call
    this.http.get<{content: string}>('/api/document/123').subscribe({
      next: (response) => {
        this.currentContent = response.content;
      },
      error: (error) => {
        console.error('Failed to load content from server:', error);
        alert('Failed to load content from server');
      }
    });
  }

  clearContent() {
    this.currentContent = '';
    localStorage.removeItem('editor-content');
  }

  onContentChange(content: string) {
    this.currentContent = content;
    
    // Auto-save to localStorage
    localStorage.setItem('editor-content', content);
    
    // Update stats
    this.characterCount = content.length;
    this.wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  }
}
```

**Features:**
- Multiple content loading options
- Auto-save functionality
- Real-time character and word count
- Server integration example

## 🎧 Event Handling

Comprehensive event handling example:

```typescript
import { Component, ViewChild } from '@angular/core';
import { EditorCoreComponent, EditorSelection } from '@ng-ui/editor-core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events-editor',
  standalone: true,
  imports: [CommonModule, EditorCoreComponent],
  template: `
    <div class="editor-with-events">
      <div class="event-log">
        <h3>Event Log</h3>
        <div class="log-entries">
          <div *ngFor="let event of eventLog.slice(-10)" 
               [class]="'log-entry log-' + event.type">
            <span class="timestamp">{{ event.timestamp | date:'HH:mm:ss' }}</span>
            <span class="event-type">{{ event.type }}</span>
            <span class="event-data">{{ event.data }}</span>
          </div>
        </div>
        <button (click)="clearLog()">Clear Log</button>
      </div>

      <blg-editor-core
        #editor
        [config]="editorConfig"
        (contentChange)="onContentChange($event)"
        (focusEvent)="onFocus($event)"
        (blurEvent)="onBlur($event)"
        (selectionChange)="onSelectionChange($event)"
        (ready)="onReady($event)">
      </blg-editor-core>

      <div class="editor-status">
        <div class="status-item">
          <strong>Status:</strong> {{ editorStatus }}
        </div>
        <div class="status-item">
          <strong>Selection:</strong> {{ selectionInfo }}
        </div>
        <div class="status-item">
          <strong>Word Count:</strong> {{ wordCount }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-with-events {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
      height: 600px;
    }

    .event-log {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      background: #f9fafb;
    }

    .event-log h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      color: #374151;
    }

    .log-entries {
      height: 400px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .log-entry {
      display: grid;
      grid-template-columns: auto auto 1fr;
      gap: 0.5rem;
      padding: 0.5rem;
      margin-bottom: 0.25rem;
      background: white;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .log-content { color: #059669; }
    .log-focus { color: #dc2626; }
    .log-blur { color: #7c3aed; }
    .log-selection { color: #ea580c; }
    .log-ready { color: #0284c7; }

    .timestamp {
      font-weight: 600;
      color: #6b7280;
    }

    .event-type {
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.75rem;
    }

    .event-data {
      color: #4b5563;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .editor-status {
      grid-column: 1 / -1;
      display: flex;
      gap: 2rem;
      padding: 1rem;
      background: #f3f4f6;
      border-radius: 0.5rem;
      margin-top: 1rem;
    }

    .status-item {
      font-size: 0.875rem;
      color: #374151;
    }

    button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }
  `]
})
export class EventsEditorComponent {
  @ViewChild('editor') editor!: EditorCoreComponent;

  eventLog: Array<{
    timestamp: Date;
    type: string;
    data: string;
  }> = [];

  editorStatus = 'Not Ready';
  selectionInfo = 'No Selection';
  wordCount = 0;

  editorConfig = {
    placeholder: 'Start typing to see events...',
    minHeight: '300px',
    toolbar: { enabled: true }
  };

  onContentChange(content: string) {
    this.logEvent('content', `Length: ${content.length} chars`);
    this.wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  }

  onFocus(event: FocusEvent) {
    this.logEvent('focus', 'Editor gained focus');
    this.editorStatus = 'Focused';
  }

  onBlur(event: FocusEvent) {
    this.logEvent('blur', 'Editor lost focus');
    this.editorStatus = 'Blurred';
  }

  onSelectionChange(selection: EditorSelection | null) {
    if (selection) {
      const info = `Start: ${selection.start}, End: ${selection.end}`;
      this.logEvent('selection', info);
      this.selectionInfo = selection.collapsed ? 
        `Cursor at ${selection.start}` : 
        `Selected ${selection.end - selection.start} chars`;
    } else {
      this.selectionInfo = 'No Selection';
    }
  }

  onReady(editor: EditorCoreComponent) {
    this.logEvent('ready', 'Editor initialized');
    this.editorStatus = 'Ready';
  }

  private logEvent(type: string, data: string) {
    this.eventLog.push({
      timestamp: new Date(),
      type,
      data
    });
  }

  clearLog() {
    this.eventLog = [];
  }
}
```

**Features:**
- Complete event logging
- Real-time status updates
- Selection tracking
- Event history management

## 🔒 Readonly Mode

Creating a readonly viewer:

```typescript
import { Component, Input } from '@angular/core';
import { EditorCoreComponent } from '@ng-ui/editor-core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-readonly-viewer',
  standalone: true,
  imports: [CommonModule, EditorCoreComponent],
  template: `
    <div class="document-viewer">
      <div class="viewer-header">
        <h2>{{ documentTitle }}</h2>
        <div class="viewer-controls">
          <button (click)="toggleEditMode()" *ngIf="allowEdit">
            {{ isReadonly ? 'Edit' : 'View' }}
          </button>
          <button (click)="printDocument()">Print</button>
          <button (click)="exportDocument()">Export</button>
        </div>
      </div>

      <div class="viewer-metadata" *ngIf="metadata">
        <span>Author: {{ metadata.author }}</span>
        <span>Modified: {{ metadata.lastModified | date }}</span>
        <span>Words: {{ metadata.wordCount }}</span>
      </div>

      <blg-editor-core
        [config]="editorConfig"
        [content]="content"
        (contentChange)="onContentChange($event)">
      </blg-editor-core>

      <div class="viewer-footer" *ngIf="isReadonly">
        <p class="readonly-notice">
          This document is in read-only mode. 
          <button (click)="requestEdit()" *ngIf="allowEdit">Request Edit Access</button>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .document-viewer {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .viewer-header h2 {
      margin: 0;
      color: #374151;
    }

    .viewer-controls {
      display: flex;
      gap: 0.5rem;
    }

    .viewer-controls button {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .viewer-controls button:hover {
      background: #e5e7eb;
    }

    .viewer-metadata {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 0.75rem 1rem;
      background: #f9fafb;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .viewer-footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .readonly-notice {
      text-align: center;
      color: #6b7280;
      font-style: italic;
    }

    .readonly-notice button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      margin-left: 0.5rem;
      cursor: pointer;
    }
  `]
})
export class ReadonlyViewerComponent {
  @Input() documentTitle = 'Untitled Document';
  @Input() content = '';
  @Input() allowEdit = false;
  @Input() metadata?: {
    author: string;
    lastModified: Date;
    wordCount: number;
  };

  isReadonly = true;

  get editorConfig() {
    return {
      readonly: this.isReadonly,
      minHeight: '400px',
      toolbar: { enabled: !this.isReadonly },
      theme: {
        name: this.isReadonly ? 'readonly' : 'default'
      }
    };
  }

  toggleEditMode() {
    if (this.allowEdit) {
      this.isReadonly = !this.isReadonly;
    }
  }

  requestEdit() {
    console.log('Edit access requested');
    // Implement your edit request logic
  }

  printDocument() {
    window.print();
  }

  exportDocument() {
    const blob = new Blob([this.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.documentTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onContentChange(content: string) {
    if (!this.isReadonly) {
      this.content = content;
      console.log('Document modified');
    }
  }
}
```

**Features:**
- Readonly viewing mode
- Edit mode toggle
- Document metadata display
- Print and export functionality

---

*For more advanced examples, check out our [Advanced Examples](../advanced/README.md) section.*