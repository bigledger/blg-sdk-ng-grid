import { Component, ViewChild, ElementRef, AfterViewInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { EditorCommandService } from '../services/editor-command.service';
import { EditorContext } from '../interfaces/editor-context.interface';
import { CommandRegistry, setupKeyboardShortcuts } from '../utils/command-registry';

/**
 * Example component demonstrating the editor with formatting capabilities
 */
@Component({
  selector: 'ng-ui-editor-example',
  standalone: true,
  imports: [CommonModule, ToolbarComponent],
  template: `
    <div class="editor-container">
      <ng-ui-editor-toolbar
        [commands]="commands()"
        [compact]="compact()"
        [showText]="showText()"
        [showShortcuts]="showShortcuts()"
        [groupLayout]="groupLayout()"
        (commandExecuted)="onCommandExecuted($event)"
      />
      
      <div 
        #editorElement
        class="editor-content"
        contenteditable="true"
        [attr.placeholder]="placeholder()"
        (focus)="onEditorFocus()"
        (blur)="onEditorBlur()"
        (selectionchange)="onSelectionChange()"
        (input)="onEditorInput()"
        (keydown)="onEditorKeyDown($event)"
      >
        <p>Start typing to see the formatting features in action...</p>
      </div>
      
      <div class="editor-status" *ngIf="showStatus()">
        <span class="status-item">Words: {{ wordCount() }}</span>
        <span class="status-item">Characters: {{ charCount() }}</span>
        <span class="status-item" *ngIf="selectedText()">Selected: {{ selectedText() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      display: flex;
      flex-direction: column;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      overflow: hidden;
    }
    
    .editor-content {
      min-height: 300px;
      padding: 16px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333333;
      background: #ffffff;
      outline: none;
      overflow-y: auto;
      
      &:empty::before {
        content: attr(placeholder);
        color: #999999;
        pointer-events: none;
      }
      
      &:focus {
        box-shadow: inset 0 0 0 2px #2196f3;
      }
      
      /* Styling for formatted content */
      h1, h2, h3, h4, h5, h6 {
        margin: 16px 0 8px 0;
        font-weight: bold;
      }
      
      h1 { font-size: 28px; }
      h2 { font-size: 24px; }
      h3 { font-size: 20px; }
      h4 { font-size: 18px; }
      h5 { font-size: 16px; }
      h6 { font-size: 14px; }
      
      p {
        margin: 8px 0;
      }
      
      blockquote {
        margin: 16px 0;
        padding: 8px 16px;
        border-left: 4px solid #2196f3;
        background: #f5f5f5;
        font-style: italic;
      }
      
      pre {
        margin: 16px 0;
        padding: 12px;
        background: #f8f8f8;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
      }
      
      code {
        background: #f0f0f0;
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
      
      ul, ol {
        margin: 8px 0;
        padding-left: 24px;
      }
      
      li {
        margin: 4px 0;
      }
      
      a {
        color: #2196f3;
        text-decoration: underline;
        
        &:hover {
          color: #1976d2;
        }
      }
      
      hr {
        margin: 20px 0;
        border: none;
        border-top: 1px solid #e0e0e0;
      }
      
      .page-break {
        margin: 20px 0;
        border-top: 1px dashed #ccc;
        text-align: center;
        color: #666;
        font-size: 12px;
      }
    }
    
    .editor-status {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 16px;
      background: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666666;
    }
    
    .status-item {
      white-space: nowrap;
    }
    
    @media (max-width: 768px) {
      .editor-content {
        min-height: 200px;
        padding: 12px;
        font-size: 16px; /* Prevent zoom on mobile */
      }
      
      .editor-status {
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  `]
})
export class EditorExampleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorElement') editorElement!: ElementRef<HTMLDivElement>;
  
  // Configuration
  compact = signal(false);
  showText = signal(false);
  showShortcuts = signal(true);
  groupLayout = signal(true);
  showStatus = signal(true);
  placeholder = signal('Start typing...');
  
  // State
  private _isFocused = signal(false);
  private _wordCount = signal(0);
  private _charCount = signal(0);
  private _selectedText = signal('');
  
  readonly isFocused = this._isFocused.asReadonly();
  readonly wordCount = this._wordCount.asReadonly();
  readonly charCount = this._charCount.asReadonly();
  readonly selectedText = this._selectedText.asReadonly();
  
  private commandService = inject(EditorCommandService);
  private keyboardShortcutCleanup?: () => void;
  
  readonly commands = this.commandService.commands;
  
  ngAfterViewInit(): void {
    this.setupEditor();
  }
  
  ngOnDestroy(): void {
    if (this.keyboardShortcutCleanup) {
      this.keyboardShortcutCleanup();
    }
  }
  
  private setupEditor(): void {
    // Register all default commands
    CommandRegistry.registerDefaultCommands(this.commandService);
    
    // Setup keyboard shortcuts
    this.keyboardShortcutCleanup = setupKeyboardShortcuts(
      this.editorElement.nativeElement,
      this.commandService
    );
    
    // Setup editor context
    this.updateEditorContext();
    
    // Update statistics
    this.updateStatistics();
  }
  
  onEditorFocus(): void {
    this._isFocused.set(true);
    this.updateEditorContext();
  }
  
  onEditorBlur(): void {
    this._isFocused.set(false);
  }
  
  onSelectionChange(): void {
    this.updateEditorContext();
    this.updateSelectedText();
  }
  
  onEditorInput(): void {
    this.updateStatistics();
    this.commandService.updateCommandStates();
  }
  
  onEditorKeyDown(event: KeyboardEvent): void {
    // Handle special keys like Tab for list indentation
    if (event.key === 'Tab') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const listItem = this.findAncestorByTagName(range.commonAncestorContainer, 'LI');
        
        if (listItem) {
          event.preventDefault();
          const commandId = event.shiftKey ? 'listOutdent' : 'listIndent';
          this.commandService.executeCommand(commandId);
        }
      }
    }
  }
  
  onCommandExecuted(event: { command: any; value?: any }): void {
    console.log('Command executed:', event.command.id, event.value);
    
    // Update context after command execution
    setTimeout(() => {
      this.updateEditorContext();
      this.updateStatistics();
    });
  }
  
  private updateEditorContext(): void {
    const element = this.editorElement.nativeElement;
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    const context: EditorContext = {
      element,
      selection,
      range,
      isFocused: this._isFocused(),
      document: element.ownerDocument
    };
    
    this.commandService.setContext(context);
  }
  
  private updateStatistics(): void {
    const content = this.editorElement.nativeElement.textContent || '';
    
    // Word count (split by whitespace, filter empty)
    const words = content.trim().split(/\\s+/).filter(word => word.length > 0);
    this._wordCount.set(words.length);
    
    // Character count
    this._charCount.set(content.length);
  }
  
  private updateSelectedText(): void {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    this._selectedText.set(selectedText);
  }
  
  private findAncestorByTagName(node: Node, tagName: string): Element | null {
    let current: Node | null = node;
    
    while (current && current !== this.editorElement.nativeElement) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        if (element.tagName === tagName) {
          return element;
        }
      }
      current = current.parentNode;
    }
    
    return null;
  }
  
  // Public methods for external control
  
  /**
   * Get the current HTML content
   */
  getHtml(): string {
    return this.editorElement.nativeElement.innerHTML;
  }
  
  /**
   * Set the HTML content
   */
  setHtml(html: string): void {
    this.editorElement.nativeElement.innerHTML = html;
    this.updateStatistics();
  }
  
  /**
   * Get the plain text content
   */
  getText(): string {
    return this.editorElement.nativeElement.textContent || '';
  }
  
  /**
   * Clear all content
   */
  clear(): void {
    this.editorElement.nativeElement.innerHTML = '<p><br></p>';
    this.updateStatistics();
  }
  
  /**
   * Focus the editor
   */
  focus(): void {
    this.editorElement.nativeElement.focus();
  }
  
  /**
   * Insert HTML at current cursor position
   */
  insertHtml(html: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    const fragment = range.createContextualFragment(html);
    range.insertNode(fragment);
    
    // Move cursor to end of inserted content
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    this.updateStatistics();
  }
}