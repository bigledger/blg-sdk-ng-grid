import {
  Directive,
  ElementRef,
  input,
  output,
  inject,
  OnInit,
  OnDestroy,
  effect,
  signal,
  computed
} from '@angular/core';

/**
 * ContentEditable Directive
 * Handles contenteditable functionality with proper event handling and content synchronization
 */
@Directive({
  selector: '[blgContentEditable]',
  standalone: true,
  host: {
    '[contenteditable]': 'editable()',
    '[attr.data-placeholder]': 'placeholder()',
    '(input)': 'onInput($event)',
    '(keydown)': 'onKeyDown($event)',
    '(keyup)': 'onKeyUp($event)',
    '(focus)': 'onFocus($event)',
    '(blur)': 'onBlur($event)',
    '(paste)': 'onPaste($event)',
    '(cut)': 'onCut($event)',
    '(copy)': 'onCopy($event)',
    '(dragstart)': 'onDragStart($event)',
    '(drop)': 'onDrop($event)',
    '(mouseup)': 'onMouseUp($event)',
    '(selectionchange)': 'onSelectionChange($event)'
  }
})
export class ContentEditableDirective implements OnInit, OnDestroy {
  // Input signals
  content = input<string>('');
  readonly = input<boolean>(false);
  placeholder = input<string>('');
  autoFocus = input<boolean>(false);

  // Output signals
  contentChange = output<string>();
  selectionChange = output<Selection | null>();
  focus = output<FocusEvent>();
  blur = output<FocusEvent>();
  keydown = output<KeyboardEvent>();
  keyup = output<KeyboardEvent>();
  paste = output<ClipboardEvent>();
  cut = output<ClipboardEvent>();
  copy = output<ClipboardEvent>();

  // Element reference
  private elementRef = inject(ElementRef);

  // Internal signals
  private focused = signal(false);
  private lastContent = signal('');
  private mutationObserver: MutationObserver | null = null;

  // Computed values
  readonly editable = computed(() => !this.readonly());
  readonly element = computed(() => this.elementRef.nativeElement as HTMLElement);

  constructor() {
    // Effect to sync content changes
    effect(() => {
      const newContent = this.content();
      const currentContent = this.getElementContent();
      
      if (newContent !== currentContent && newContent !== this.lastContent()) {
        this.setElementContent(newContent);
        this.lastContent.set(newContent);
      }
    });

    // Effect to handle auto-focus
    effect(() => {
      if (this.autoFocus() && !this.focused()) {
        setTimeout(() => this.focusElement(), 0);
      }
    });

    // Effect to handle readonly state
    effect(() => {
      const element = this.element();
      const readonly = this.readonly();
      
      if (element) {
        element.contentEditable = readonly ? 'false' : 'true';
        element.setAttribute('aria-readonly', readonly.toString());
      }
    });
  }

  ngOnInit(): void {
    this.setupMutationObserver();
    this.initializeContent();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Initialize content
   */
  private initializeContent(): void {
    const initialContent = this.content();
    if (initialContent) {
      this.setElementContent(initialContent);
      this.lastContent.set(initialContent);
    }
  }

  /**
   * Set up mutation observer for content changes
   */
  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver(() => {
      this.handleContentChange();
    });

    this.mutationObserver.observe(this.element(), {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false
    });
  }

  /**
   * Handle input events
   */
  onInput(event: Event): void {
    if (this.readonly()) {
      event.preventDefault();
      return;
    }

    this.handleContentChange();
  }

  /**
   * Handle content changes
   */
  private handleContentChange(): void {
    const currentContent = this.getElementContent();
    const lastContent = this.lastContent();

    if (currentContent !== lastContent) {
      this.lastContent.set(currentContent);
      this.contentChange.emit(currentContent);
    }
  }

  /**
   * Handle keydown events
   */
  onKeyDown(event: KeyboardEvent): void {
    if (this.readonly() && this.isEditingKey(event)) {
      event.preventDefault();
      return;
    }

    // Handle special keys
    if (event.key === 'Enter' && event.shiftKey) {
      // Shift+Enter should insert line break
      event.preventDefault();
      this.insertLineBreak();
      return;
    }

    if (event.key === 'Tab') {
      // Prevent tab from moving focus, handle as indent
      event.preventDefault();
      this.handleTab(event.shiftKey);
      return;
    }

    this.keydown.emit(event);
  }

  /**
   * Handle keyup events
   */
  onKeyUp(event: KeyboardEvent): void {
    this.keyup.emit(event);
    
    // Check for selection changes after key navigation
    if (this.isNavigationKey(event.key)) {
      setTimeout(() => this.checkSelectionChange(), 0);
    }
  }

  /**
   * Handle focus events
   */
  onFocus(event: FocusEvent): void {
    this.focused.set(true);
    this.focus.emit(event);
  }

  /**
   * Handle blur events
   */
  onBlur(event: FocusEvent): void {
    this.focused.set(false);
    this.blur.emit(event);
  }

  /**
   * Handle paste events
   */
  onPaste(event: ClipboardEvent): void {
    if (this.readonly()) {
      event.preventDefault();
      return;
    }

    // Let the paste happen, then clean up the content
    setTimeout(() => {
      this.cleanupPastedContent();
      this.handleContentChange();
    }, 0);

    this.paste.emit(event);
  }

  /**
   * Handle cut events
   */
  onCut(event: ClipboardEvent): void {
    if (this.readonly()) {
      event.preventDefault();
      return;
    }

    this.cut.emit(event);
  }

  /**
   * Handle copy events
   */
  onCopy(event: ClipboardEvent): void {
    this.copy.emit(event);
  }

  /**
   * Handle drag start events
   */
  onDragStart(event: DragEvent): void {
    if (this.readonly()) {
      event.preventDefault();
    }
  }

  /**
   * Handle drop events
   */
  onDrop(event: DragEvent): void {
    if (this.readonly()) {
      event.preventDefault();
      return;
    }

    // Handle dropped content
    setTimeout(() => {
      this.handleContentChange();
    }, 0);
  }

  /**
   * Handle mouse up events (for selection changes)
   */
  onMouseUp(event: MouseEvent): void {
    setTimeout(() => this.checkSelectionChange(), 0);
  }

  /**
   * Handle selection change events
   */
  onSelectionChange(event: Event): void {
    this.checkSelectionChange();
  }

  /**
   * Check for selection changes and emit if changed
   */
  private checkSelectionChange(): void {
    const selection = window.getSelection();
    if (selection && this.isSelectionInElement(selection)) {
      this.selectionChange.emit(selection);
    }
  }

  /**
   * Check if selection is within this element
   */
  private isSelectionInElement(selection: Selection): boolean {
    if (!selection.rangeCount) return false;
    
    const range = selection.getRangeAt(0);
    const element = this.element();
    
    return element.contains(range.commonAncestorContainer) ||
           element === range.commonAncestorContainer;
  }

  /**
   * Get current content from element
   */
  private getElementContent(): string {
    return this.element().innerHTML;
  }

  /**
   * Set content to element
   */
  private setElementContent(content: string): void {
    const element = this.element();
    if (element.innerHTML !== content) {
      // Preserve selection if possible
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      
      element.innerHTML = content;
      
      // Restore selection
      if (range && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          // Selection restoration failed, ignore
        }
      }
    }
  }

  /**
   * Focus the element
   */
  private focusElement(): void {
    const element = this.element();
    if (element && !this.focused()) {
      element.focus();
    }
  }

  /**
   * Insert line break at cursor position
   */
  private insertLineBreak(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const br = document.createElement('br');
      
      range.deleteContents();
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      this.handleContentChange();
    }
  }

  /**
   * Handle tab key (indent/outdent)
   */
  private handleTab(shift: boolean): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (shift) {
        // Outdent - remove leading spaces or tab
        this.outdentSelection(range);
      } else {
        // Indent - add tab or spaces
        this.indentSelection(range);
      }
      
      this.handleContentChange();
    }
  }

  /**
   * Indent selection
   */
  private indentSelection(range: Range): void {
    const tabText = document.createTextNode('\t');
    range.insertNode(tabText);
    range.setStartAfter(tabText);
    range.collapse(true);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Outdent selection
   */
  private outdentSelection(range: Range): void {
    // Implementation would depend on specific requirements
    // This is a simplified version
    const container = range.startContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      const text = container.textContent || '';
      if (text.startsWith('\t') || text.startsWith('    ')) {
        const newText = text.startsWith('\t') ? text.substring(1) : text.substring(4);
        container.textContent = newText;
      }
    }
  }

  /**
   * Clean up pasted content
   */
  private cleanupPastedContent(): void {
    const element = this.element();
    
    // Remove unwanted attributes and styles
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT,
      null
    );

    const elementsToClean: Element[] = [];
    let node = walker.nextNode();
    
    while (node) {
      if (node instanceof Element) {
        elementsToClean.push(node);
      }
      node = walker.nextNode();
    }

    // Clean each element
    elementsToClean.forEach(el => this.cleanElement(el as HTMLElement));
  }

  /**
   * Clean individual element
   */
  private cleanElement(element: HTMLElement): void {
    // Remove style attribute
    element.removeAttribute('style');
    
    // Remove class attribute
    element.removeAttribute('class');
    
    // Remove other unwanted attributes
    const allowedAttributes = ['href', 'src', 'alt', 'title'];
    const attributesToRemove: string[] = [];
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (!allowedAttributes.includes(attr.name.toLowerCase())) {
        attributesToRemove.push(attr.name);
      }
    }
    
    attributesToRemove.forEach(attr => element.removeAttribute(attr));
  }

  /**
   * Check if key is an editing key
   */
  private isEditingKey(event: KeyboardEvent): boolean {
    return (
      event.key.length === 1 || // Printable characters
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Enter' ||
      event.key === 'Tab'
    );
  }

  /**
   * Check if key is a navigation key
   */
  private isNavigationKey(key: string): boolean {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(key);
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
}