import { 
  Component, 
  input, 
  output, 
  signal, 
  computed, 
  effect, 
  inject,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorConfig, EditorState, EditorEvent } from './interfaces';
import { EditorStateService } from './services/editor-state.service';
import { SelectionService } from './services/selection.service';
import { CommandService } from './services/command.service';
import { EventService } from './services/event.service';
import { ContentEditableDirective } from './directives/content-editable.directive';

/**
 * BLG Editor Core Component
 * Main editor component with contenteditable functionality and signals-based state management
 */
@Component({
  selector: 'ngui-editor-core',
  standalone: true,
  imports: [CommonModule, ContentEditableDirective],
  templateUrl: './editor-core-component.html',
  styleUrl: './editor-core-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'blg-editor-core',
    '[class.blg-editor-focused]': 'state().focused',
    '[class.blg-editor-readonly]': 'state().readonly',
    '[class.blg-editor-dirty]': 'state().dirty',
    '[attr.data-editor-mode]': 'state().mode'
  }
})
export class EditorCoreComponent implements OnInit, OnDestroy, AfterViewInit {
  // Input signals
  config = input<EditorConfig>({
    content: '',
    placeholder: 'Start typing...',
    autoFocus: false,
    readonly: false
  });

  // Output signals
  contentChange = output<string>();
  selectionChange = output<any>();
  focus = output<FocusEvent>();
  blur = output<FocusEvent>();
  ready = output<void>();
  stateChange = output<EditorEvent>();

  // Injected services
  private elementRef = inject(ElementRef);
  private stateService = inject(EditorStateService);
  private selectionService = inject(SelectionService);
  private commandService = inject(CommandService);
  private eventService = inject(EventService);

  // Public state signals
  readonly state = this.stateService.state;
  readonly selection = this.selectionService.selection;
  readonly canUndo = this.stateService.canUndo;
  readonly canRedo = this.stateService.canRedo;

  // Internal signals
  private initialized = signal(false);
  private destroyed = signal(false);

  // Computed values
  readonly isEmpty = computed(() => {
    const content = this.state().content;
    return !content || content.trim() === '' || content === '<p></p>' || content === '<div></div>';
  });

  readonly hasSelection = computed(() => {
    const selection = this.selection();
    return selection !== null && !selection.collapsed;
  });

  constructor() {
    // Effect to sync config changes to state
    effect(() => {
      const config = this.config();
      if (this.initialized()) {
        this.stateService.updateConfig(config);
      }
    });

    // Effect to emit content changes
    effect(() => {
      const content = this.state().content;
      if (this.initialized()) {
        this.contentChange.emit(content);
      }
    });

    // Effect to emit selection changes
    effect(() => {
      const selection = this.selection();
      if (this.initialized()) {
        this.selectionChange.emit(selection);
      }
    });

    // Effect to handle state changes
    effect(() => {
      const state = this.state();
      if (this.initialized()) {
        this.stateChange.emit({
          type: 'stateChange',
          timestamp: Date.now(),
          source: 'editor',
          data: state,
          cancelable: false,
          cancelled: false,
          propagationStopped: false
        });
      }
    });
  }

  ngOnInit(): void {
    this.initializeEditor();
  }

  ngAfterViewInit(): void {
    this.setupEventListeners();
    this.initialized.set(true);
    this.ready.emit();
  }

  ngOnDestroy(): void {
    this.destroyed.set(true);
    this.cleanup();
  }

  /**
   * Initialize the editor with configuration
   */
  private initializeEditor(): void {
    const config = this.config();
    this.stateService.initialize(config);
    this.commandService.initialize(this);
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Subscribe to event service
    this.eventService.on('focus', (event) => this.handleFocus(event));
    this.eventService.on('blur', (event) => this.handleBlur(event));
    this.eventService.on('contentChange', (event) => this.handleContentChange(event));
    this.eventService.on('selectionChange', (event) => this.handleSelectionChange(event));
  }

  /**
   * Handle focus events
   */
  private handleFocus(event: any): void {
    this.stateService.setFocused(true);
    this.focus.emit(event.data.originalEvent);
  }

  /**
   * Handle blur events
   */
  private handleBlur(event: any): void {
    this.stateService.setFocused(false);
    this.blur.emit(event.data.originalEvent);
  }

  /**
   * Handle content changes
   */
  private handleContentChange(event: any): void {
    const newContent = event.data.newContent;
    this.stateService.updateContent(newContent);
  }

  /**
   * Handle selection changes
   */
  private handleSelectionChange(event: any): void {
    this.selectionService.updateSelection(event.data.newSelection);
  }

  /**
   * Execute a command
   */
  executeCommand(commandName: string, params?: Record<string, any>): Promise<boolean> {
    return this.commandService.execute(commandName, params);
  }

  /**
   * Get current content
   */
  getContent(): string {
    return this.state().content;
  }

  /**
   * Set content
   */
  setContent(content: string): void {
    this.stateService.updateContent(content);
  }

  /**
   * Focus the editor
   */
  focusEditor(): void {
    const editorElement = this.elementRef.nativeElement.querySelector('[contenteditable]');
    if (editorElement) {
      editorElement.focus();
    }
  }

  /**
   * Blur the editor
   */
  blurEditor(): void {
    const editorElement = this.elementRef.nativeElement.querySelector('[contenteditable]');
    if (editorElement) {
      editorElement.blur();
    }
  }

  /**
   * Check if editor has focus
   */
  hasFocus(): boolean {
    return this.state().focused;
  }

  /**
   * Check if editor is empty
   */
  isEditorEmpty(): boolean {
    return this.isEmpty();
  }

  /**
   * Get current selection
   */
  getSelection(): any {
    return this.selection();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.eventService.removeAllListeners();
    this.commandService.destroy();
    this.selectionService.destroy();
    this.stateService.destroy();
  }
}