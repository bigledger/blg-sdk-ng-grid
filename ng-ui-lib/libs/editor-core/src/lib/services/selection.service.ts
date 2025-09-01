import { Injectable, signal, computed, effect } from '@angular/core';
import {
  EditorSelection,
  SelectionState,
  SelectionPosition,
  SelectionInfo,
  SelectionContext,
  SelectionRange,
  SelectionBookmark,
  SelectionChangeType
} from '../interfaces';

/**
 * Selection Service
 * Manages selection state and operations using Angular Signals
 */
@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  // Private state signals
  private _selection = signal<EditorSelection | null>(null);
  private _previousSelection = signal<EditorSelection | null>(null);
  private _focused = signal<boolean>(false);
  private _tracking = signal<boolean>(true);
  private _history = signal<EditorSelection[]>([]);
  private _maxHistory = signal<number>(50);
  private _bookmarks = signal<Map<string, SelectionBookmark>>(new Map());

  // Public readonly state
  readonly selection = this._selection.asReadonly();
  readonly previousSelection = this._previousSelection.asReadonly();
  readonly focused = this._focused.asReadonly();
  readonly tracking = this._tracking.asReadonly();
  readonly history = this._history.asReadonly();

  // Computed values
  readonly hasSelection = computed(() => {
    const sel = this._selection();
    return sel !== null && !sel.collapsed;
  });

  readonly selectionText = computed(() => {
    return this._selection()?.text || '';
  });

  readonly selectionHtml = computed(() => {
    return this._selection()?.html || '';
  });

  readonly isMultiBlock = computed(() => {
    const sel = this._selection();
    if (!sel) return false;
    
    const startBlock = this.getBlockElement(sel.startContainer);
    const endBlock = this.getBlockElement(sel.endContainer);
    return startBlock !== endBlock;
  });

  readonly selectionContext = computed(() => this.getSelectionContext());

  readonly selectionInfo = computed<SelectionInfo>(() => {
    const current = this._selection();
    const previous = this._previousSelection();
    
    return {
      selection: current,
      previousSelection: previous,
      changed: current !== previous,
      changeType: this.getChangeType(previous, current),
      context: this.selectionContext()
    };
  });

  private lastSelectionString = '';

  constructor() {
    // Effect to track selection changes
    effect(() => {
      const selection = this._selection();
      if (selection && this._tracking()) {
        this.addToHistory(selection);
      }
    }, { allowSignalWrites: true });
  }

  /**
   * Update current selection
   */
  updateSelection(domSelection: Selection | null): void {
    if (!domSelection || !this._tracking()) return;

    const editorSelection = this.createEditorSelection(domSelection);
    
    // Check if selection actually changed
    const selectionString = this.serializeSelection(editorSelection);
    if (selectionString === this.lastSelectionString) {
      return;
    }

    this.lastSelectionString = selectionString;
    const previousSelection = this._selection();
    
    if (previousSelection) {
      this._previousSelection.set(previousSelection);
    }
    
    this._selection.set(editorSelection);
  }

  /**
   * Create EditorSelection from DOM Selection
   */
  private createEditorSelection(domSelection: Selection): EditorSelection | null {
    if (!domSelection.rangeCount) return null;

    const range = domSelection.getRangeAt(0);
    
    try {
      const startPos = this.createSelectionPosition(range.startContainer, range.startOffset);
      const endPos = this.createSelectionPosition(range.endContainer, range.endOffset);
      
      return {
        start: startPos,
        end: endPos,
        collapsed: range.collapsed,
        direction: this.getSelectionDirection(domSelection),
        text: range.toString(),
        html: this.getRangeHtml(range),
        range: range.cloneRange(),
        commonAncestorContainer: range.commonAncestorContainer,
        startContainer: range.startContainer,
        endContainer: range.endContainer,
        selectedNodes: this.getSelectedNodes(range),
        parentElements: this.getParentElements(range)
      };
    } catch (error) {
      console.warn('Failed to create editor selection:', error);
      return null;
    }
  }

  /**
   * Create selection position
   */
  private createSelectionPosition(node: Node, offset: number): SelectionPosition {
    return {
      node,
      offset,
      absoluteOffset: this.getAbsoluteOffset(node, offset),
      path: this.getNodePath(node)
    };
  }

  /**
   * Get selection direction
   */
  private getSelectionDirection(selection: Selection): 'forward' | 'backward' | 'none' {
    if (selection.isCollapsed) return 'none';
    
    const range = selection.getRangeAt(0);
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    const anchorOffset = selection.anchorOffset;
    const focusOffset = selection.focusOffset;
    
    if (anchorNode === focusNode) {
      return anchorOffset <= focusOffset ? 'forward' : 'backward';
    }
    
    const position = anchorNode?.compareDocumentPosition(focusNode!);
    if (position && position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return 'forward';
    }
    
    return 'backward';
  }

  /**
   * Get HTML content of range
   */
  private getRangeHtml(range: Range): string {
    const fragment = range.cloneContents();
    const div = document.createElement('div');
    div.appendChild(fragment);
    return div.innerHTML;
  }

  /**
   * Get selected nodes
   */
  private getSelectedNodes(range: Range): Node[] {
    const nodes: Node[] = [];
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ALL,
      {
        acceptNode: (node) => {
          if (range.intersectsNode(node)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node = walker.nextNode();
    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }

    return nodes;
  }

  /**
   * Get parent elements of range
   */
  private getParentElements(range: Range): Element[] {
    const elements: Element[] = [];
    let current = range.commonAncestorContainer;
    
    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        elements.unshift(current as Element);
      }
      current = current.parentNode;
    }
    
    return elements;
  }

  /**
   * Get absolute offset from document start
   */
  private getAbsoluteOffset(node: Node, offset: number): number {
    // This is a simplified implementation
    // A complete implementation would traverse the document tree
    let absoluteOffset = 0;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode = walker.nextNode();
    while (currentNode && currentNode !== node) {
      absoluteOffset += currentNode.textContent?.length || 0;
      currentNode = walker.nextNode();
    }

    return absoluteOffset + offset;
  }

  /**
   * Get node path from root
   */
  private getNodePath(node: Node): number[] {
    const path: number[] = [];
    let current = node;
    
    while (current && current.parentNode) {
      const siblings = Array.from(current.parentNode.childNodes);
      path.unshift(siblings.indexOf(current));
      current = current.parentNode;
    }
    
    return path;
  }

  /**
   * Get selection context information
   */
  private getSelectionContext(): SelectionContext {
    const selection = this._selection();
    if (!selection) {
      return {
        formatting: {},
        blockElement: null,
        listElement: null,
        tableCell: null,
        linkElement: null,
        inlineElements: [],
        multiBlock: false,
        multiParagraph: false
      };
    }

    const range = selection.range;
    const commonAncestor = range.commonAncestorContainer;
    
    return {
      formatting: this.getFormattingAtSelection(selection),
      blockElement: this.getBlockElement(commonAncestor),
      listElement: this.getListElement(commonAncestor),
      tableCell: this.getTableCell(commonAncestor),
      linkElement: this.getLinkElement(commonAncestor),
      inlineElements: this.getInlineElements(selection),
      multiBlock: this.isMultiBlock(),
      multiParagraph: this.isMultiParagraph(selection)
    };
  }

  /**
   * Get formatting at current selection
   */
  private getFormattingAtSelection(selection: EditorSelection): Record<string, any> {
    const formatting: Record<string, any> = {};
    const range = selection.range;
    
    // Check common formatting properties
    const testElement = document.createElement('span');
    try {
      range.surroundContents(testElement);
      const computedStyle = window.getComputedStyle(testElement);
      
      formatting.fontWeight = computedStyle.fontWeight;
      formatting.fontStyle = computedStyle.fontStyle;
      formatting.textDecoration = computedStyle.textDecoration;
      formatting.fontFamily = computedStyle.fontFamily;
      formatting.fontSize = computedStyle.fontSize;
      formatting.color = computedStyle.color;
      formatting.backgroundColor = computedStyle.backgroundColor;
      
      // Unwrap the test element
      const parent = testElement.parentNode;
      if (parent) {
        parent.insertBefore(range.extractContents(), testElement);
        parent.removeChild(testElement);
      }
    } catch (error) {
      // Range couldn't be surrounded, use different approach
      formatting.fontWeight = this.getInheritedStyle(range.startContainer, 'fontWeight');
      formatting.fontStyle = this.getInheritedStyle(range.startContainer, 'fontStyle');
    }
    
    return formatting;
  }

  /**
   * Get inherited style from node
   */
  private getInheritedStyle(node: Node, property: string): string {
    let current = node;
    while (current && current.nodeType !== Node.ELEMENT_NODE) {
      current = current.parentNode!;
    }
    
    if (current && current.nodeType === Node.ELEMENT_NODE) {
      return window.getComputedStyle(current as Element)[property as any];
    }
    
    return '';
  }

  /**
   * Get block element containing node
   */
  private getBlockElement(node: Node): Element | null {
    let current = node;
    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        const display = window.getComputedStyle(element).display;
        if (display === 'block' || element.tagName.match(/^(P|DIV|H[1-6]|BLOCKQUOTE|PRE)$/)) {
          return element;
        }
      }
      current = current.parentNode!;
    }
    return null;
  }

  /**
   * Get list element containing node
   */
  private getListElement(node: Node): Element | null {
    let current = node;
    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        if (element.tagName.match(/^(UL|OL|LI)$/)) {
          return element;
        }
      }
      current = current.parentNode!;
    }
    return null;
  }

  /**
   * Get table cell containing node
   */
  private getTableCell(node: Node): Element | null {
    let current = node;
    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        if (element.tagName.match(/^(TD|TH)$/)) {
          return element;
        }
      }
      current = current.parentNode!;
    }
    return null;
  }

  /**
   * Get link element containing node
   */
  private getLinkElement(node: Node): Element | null {
    let current = node;
    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        if (element.tagName === 'A') {
          return element;
        }
      }
      current = current.parentNode!;
    }
    return null;
  }

  /**
   * Get inline elements in selection
   */
  private getInlineElements(selection: EditorSelection): Element[] {
    const elements: Element[] = [];
    const nodes = selection.selectedNodes;
    
    nodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const display = window.getComputedStyle(element).display;
        if (display === 'inline' || display === 'inline-block') {
          elements.push(element);
        }
      }
    });
    
    return elements;
  }

  /**
   * Check if selection spans multiple paragraphs
   */
  private isMultiParagraph(selection: EditorSelection): boolean {
    const startP = this.getParagraphElement(selection.startContainer);
    const endP = this.getParagraphElement(selection.endContainer);
    return startP !== endP;
  }

  /**
   * Get paragraph element containing node
   */
  private getParagraphElement(node: Node): Element | null {
    let current = node;
    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        if (element.tagName === 'P') {
          return element;
        }
      }
      current = current.parentNode!;
    }
    return null;
  }

  /**
   * Determine change type between selections
   */
  private getChangeType(
    previous: EditorSelection | null, 
    current: EditorSelection | null
  ): SelectionChangeType {
    if (!previous && !current) return 'none';
    if (!previous && current) return 'focus';
    if (previous && !current) return 'blur';
    if (!previous || !current) return 'replace';
    
    if (previous.collapsed && current.collapsed) {
      if (previous.start.node === current.start.node && 
          previous.start.offset === current.start.offset) {
        return 'none';
      }
      return 'move';
    }
    
    if (previous.collapsed && !current.collapsed) return 'extend';
    if (!previous.collapsed && current.collapsed) return 'collapse';
    
    return 'replace';
  }

  /**
   * Serialize selection for comparison
   */
  private serializeSelection(selection: EditorSelection | null): string {
    if (!selection) return '';
    
    return `${selection.start.absoluteOffset}-${selection.end.absoluteOffset}-${selection.text}`;
  }

  /**
   * Add selection to history
   */
  private addToHistory(selection: EditorSelection): void {
    const history = this._history();
    const maxHistory = this._maxHistory();
    
    // Don't add duplicates
    const lastSelection = history[history.length - 1];
    if (lastSelection && this.serializeSelection(lastSelection) === this.serializeSelection(selection)) {
      return;
    }
    
    const newHistory = [...history, selection];
    
    // Limit history size
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }
    
    this._history.set(newHistory);
  }

  /**
   * Set focused state
   */
  setFocused(focused: boolean): void {
    this._focused.set(focused);
  }

  /**
   * Set tracking state
   */
  setTracking(tracking: boolean): void {
    this._tracking.set(tracking);
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    this._selection.set(null);
    this._previousSelection.set(null);
    this.lastSelectionString = '';
  }

  /**
   * Create selection bookmark
   */
  createBookmark(id: string): SelectionBookmark | null {
    const selection = this._selection();
    if (!selection) return null;

    const startMarker = document.createElement('span');
    const endMarker = document.createElement('span');
    
    startMarker.id = `bookmark-start-${id}`;
    endMarker.id = `bookmark-end-${id}`;
    
    startMarker.setAttribute('data-bookmark-start', id);
    endMarker.setAttribute('data-bookmark-end', id);
    
    const range = selection.range.cloneRange();
    
    try {
      range.collapse(false);
      range.insertNode(endMarker);
      range.setStart(selection.start.node, selection.start.offset);
      range.collapse(true);
      range.insertNode(startMarker);
      
      const bookmark: SelectionBookmark = {
        id,
        startMarker,
        endMarker,
        selection: selection,
        timestamp: Date.now()
      };
      
      const bookmarks = new Map(this._bookmarks());
      bookmarks.set(id, bookmark);
      this._bookmarks.set(bookmarks);
      
      return bookmark;
    } catch (error) {
      console.warn('Failed to create selection bookmark:', error);
      return null;
    }
  }

  /**
   * Restore selection from bookmark
   */
  restoreBookmark(id: string): boolean {
    const bookmarks = this._bookmarks();
    const bookmark = bookmarks.get(id);
    
    if (!bookmark) return false;
    
    const startMarker = document.getElementById(`bookmark-start-${id}`);
    const endMarker = document.getElementById(`bookmark-end-${id}`);
    
    if (!startMarker || !endMarker) return false;
    
    try {
      const range = document.createRange();
      range.setStartBefore(startMarker);
      range.setEndAfter(endMarker);
      
      // Remove markers
      startMarker.remove();
      endMarker.remove();
      
      // Apply selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // Remove from bookmarks
      const newBookmarks = new Map(bookmarks);
      newBookmarks.delete(id);
      this._bookmarks.set(newBookmarks);
      
      return true;
    } catch (error) {
      console.warn('Failed to restore selection bookmark:', error);
      return false;
    }
  }

  /**
   * Get current selection range
   */
  getSelectionRange(): SelectionRange | null {
    const selection = this._selection();
    if (!selection) return null;

    return {
      startNode: selection.start.node,
      startOffset: selection.start.offset,
      endNode: selection.end.node,
      endOffset: selection.end.offset
    };
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this._selection.set(null);
    this._previousSelection.set(null);
    this._focused.set(false);
    this._tracking.set(false);
    this._history.set([]);
    this._bookmarks.set(new Map());
    this.lastSelectionString = '';
  }
}