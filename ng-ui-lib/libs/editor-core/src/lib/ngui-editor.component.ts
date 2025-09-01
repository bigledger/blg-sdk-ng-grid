/**
 * NgUI Editor Component - Standardized editor component following NgUI conventions
 */

import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { 
  NgUiEditorConfig,
  NgUiEditorEvent,
  NgUiEditorChangeEvent,
  NgUiEditorFocusEvent,
  NgUiEditorBlurEvent,
  NgUiEditorSelectionEvent,
  NgUiExportFormat,
  NgUiTheme,
  NgUiA11yConfig,
  NgUiResponsiveConfig,
  NgUiValidationError
} from '@ng-ui/common';

/**
 * NgUI Editor Component - A rich text editor for Angular applications
 * 
 * @example
 * ```html
 * <ngui-editor 
 *   [config]="editorConfig" 
 *   [data]="content"
 *   (ngUiEditorChange)="onContentChange($event)"
 *   (ngUiEditorFocus)="onEditorFocus($event)">
 * </ngui-editor>
 * ```
 * 
 * @see {@link NgUiEditorConfig} for configuration options
 * @since 1.0.0
 */
@Component({
  selector: 'ngui-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #editorContainer 
      class="ngui-editor"
      [class.ngui-editor-focused]="isFocused()"
      [class.ngui-editor-readonly]="config().readonly"
      [class.ngui-editor-disabled]="disabled()"
      [class.ngui-editor-loading]="isLoading()"
      [class.ngui-editor-error]="hasError()"
      [attr.aria-label]="ariaLabel() || accessibility().ariaLabel">
      
      <!-- Toolbar -->
      @if (config().toolbar?.enabled) {
        <div class="ngui-editor-toolbar">
          <!-- Toolbar implementation -->
          <div class="ngui-editor-toolbar-content">
            Toolbar placeholder
          </div>
        </div>
      }
      
      <!-- Editor content -->
      <div 
        #editorContent
        class="ngui-editor-content"
        [contentEditable]="!config().readonly && !disabled()"
        [attr.placeholder]="config().placeholder"
        [style.min-height.px]="config().dimensions?.height"
        (focus)="onFocus($event)"
        (blur)="onBlur($event)"
        (input)="onContentChange($event)">
      </div>
      
      <!-- Footer/Status bar -->
      @if (showStatusBar()) {
        <div class="ngui-editor-footer">
          <div class="ngui-editor-status">
            @if (validation().enabled) {
              <span class="ngui-editor-validation">
                {{ getValidationStatus() }}
              </span>
            }
            @if (config().autosave?.enabled) {
              <span class="ngui-editor-autosave">
                {{ getAutosaveStatus() }}
              </span>
            }
          </div>
        </div>
      }
      
      <!-- Loading indicator -->
      @if (isLoading()) {
        <div class="ngui-editor-loading-overlay">
          <div class="ngui-loading-spinner"></div>
          <span>Loading editor...</span>
        </div>
      }
      
      <!-- Error display -->
      @if (hasError()) {
        <div class="ngui-editor-error-overlay">
          <div class="ngui-error-icon">⚠</div>
          <span>{{ errorMessage() }}</span>
        </div>
      }
      
      <!-- Accessibility description -->
      @if (accessibility().description) {
        <div [id]="editorId + '-description'" class="sr-only">
          {{ accessibility().description }}
        </div>
      }
    </div>
  `,
  styleUrls: ['./ngui-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngui-editor-host',
    '[class.ngui-theme-dark]': 'theme() === "dark"',
    '[class.ngui-theme-light]': 'theme() === "light"',
    '[class.disabled]': 'disabled()',
    '[attr.data-editor-mode]': 'editorMode()'
  }
})
export class NgUiEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // ============================================================================
  // STANDARD INPUTS (Following NgUI convention)
  // ============================================================================
  
  /** Editor configuration object */
  config = input.required<NgUiEditorConfig>();
  
  /** Editor content (HTML string) */
  data = input<string>('');
  
  /** Theme */
  theme = input<NgUiTheme>('light');
  
  /** Accessibility label */
  ariaLabel = input<string>();
  
  /** Disabled state */
  disabled = input<boolean>(false);
  
  // ============================================================================
  // STANDARD OUTPUTS (Following NgUI convention)
  // ============================================================================
  
  /** Component ready */
  ready = output<void>();
  
  /** Content changes */
  change = output<string>();
  
  /** Errors */
  error = output<Error>();
  
  /** Focus events */
  focus = output<FocusEvent>();
  blur = output<FocusEvent>();
  
  // ============================================================================
  // COMPONENT-SPECIFIC OUTPUTS (Following NgUI convention)
  // ============================================================================
  
  /** Editor content change events */
  ngUiEditorChange = output<NgUiEditorChangeEvent>();
  
  /** Editor focus events */
  ngUiEditorFocus = output<NgUiEditorFocusEvent>();
  
  /** Editor blur events */
  ngUiEditorBlur = output<NgUiEditorBlurEvent>();
  
  /** Editor selection change events */
  ngUiEditorSelection = output<NgUiEditorSelectionEvent>();
  
  /** Generic editor events */
  ngUiEditorEvent = output<NgUiEditorEvent>();
  
  // ============================================================================
  // TEMPLATE REFERENCES
  // ============================================================================
  
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLElement>;
  @ViewChild('editorContent', { static: true }) editorContent!: ElementRef<HTMLElement>;
  
  // ============================================================================
  // INTERNAL STATE SIGNALS
  // ============================================================================
  
  private readonly isLoading = signal<boolean>(false);
  private readonly hasError = signal<boolean>(false);
  private readonly errorMessage = signal<string>('');
  private readonly isInitialized = signal<boolean>(false);
  private readonly isFocused = signal<boolean>(false);
  private readonly validationErrors = signal<NgUiValidationError[]>([]);
  private readonly lastSaved = signal<Date | null>(null);
  
  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  /** Computed accessibility settings */
  readonly accessibility = computed((): NgUiA11yConfig => ({
    enabled: this.config().accessibility?.enabled !== false,
    ariaLabel: this.config().accessibility?.ariaLabel || 'Rich text editor',
    description: this.config().accessibility?.description,
    keyboardNavigation: this.config().accessibility?.keyboardNavigation !== false,
    highContrast: this.config().accessibility?.highContrast || false
  }));
  
  /** Computed validation settings */
  readonly validation = computed(() => ({
    enabled: !!this.config().validation,
    errors: this.validationErrors(),
    isValid: this.validationErrors().length === 0
  }));
  
  /** Editor mode */
  readonly editorMode = computed(() => {
    if (this.config().readonly) return 'readonly';
    if (this.disabled()) return 'disabled';
    return 'edit';
  });
  
  /** Show status bar */
  readonly showStatusBar = computed(() => {
    return this.config().validation || this.config().autosave?.enabled;
  });
  
  // ============================================================================
  // PRIVATE PROPERTIES
  // ============================================================================
  
  private readonly editorId = `ngui-editor-${Math.random().toString(36).substr(2, 9)}`;
  private readonly elementRef = inject(ElementRef);
  private autosaveTimer?: number;
  
  // ============================================================================
  // CONSTRUCTOR & EFFECTS
  // ============================================================================
  
  constructor() {
    // Effect to handle config changes
    effect(() => {
      const config = this.config();
      if (this.isInitialized()) {
        this.updateEditor();
      }
    });
    
    // Effect to handle data changes
    effect(() => {
      const data = this.data();
      if (this.isInitialized()) {
        this.setContent(data);
      }
    });
    
    // Effect to handle autosave
    effect(() => {
      const content = this.data();
      const autosaveConfig = this.config().autosave;
      
      if (autosaveConfig?.enabled && this.isInitialized()) {
        this.scheduleAutosave();
      }
    });
  }
  
  // ============================================================================
  // LIFECYCLE METHODS
  // ============================================================================
  
  ngOnInit(): void {
    this.initializeEditor();
  }
  
  ngAfterViewInit(): void {
    this.setupEditor();
    this.isInitialized.set(true);
    this.ready.emit();
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  // ============================================================================
  // STANDARD METHODS (Following NgUI convention)
  // ============================================================================
  
  /**
   * Export editor content in specified format
   */
  async export(format: NgUiExportFormat): Promise<void> {
    try {
      const content = this.getContent();
      
      switch (format) {
        case NgUiExportFormat.PDF:
          await this.exportToPdf(content);
          break;
        case NgUiExportFormat.JSON:
          await this.exportToJson(content);
          break;
        default:
          throw new Error(`Export format ${format} not supported`);
      }
    } catch (err) {
      this.error.emit(err as Error);
      throw err;
    }
  }
  
  /**
   * Refresh editor state and rendering
   */
  refresh(): void {
    if (this.isInitialized()) {
      this.updateEditor();
    }
  }
  
  /**
   * Reset editor to initial state
   */
  reset(): void {
    this.setContent(this.config().content || '');
    this.hasError.set(false);
    this.errorMessage.set('');
    this.validationErrors.set([]);
  }
  
  /**
   * Destroy editor and cleanup resources
   */
  destroy(): void {
    this.cleanup();
  }
  
  // ============================================================================
  // EDITOR-SPECIFIC METHODS
  // ============================================================================
  
  /**
   * Get current editor content
   */
  getContent(): string {
    if (this.editorContent) {
      return this.editorContent.nativeElement.innerHTML;
    }
    return '';
  }
  
  /**
   * Set editor content
   */
  setContent(content: string): void {
    if (this.editorContent) {
      this.editorContent.nativeElement.innerHTML = content;
    }
  }
  
  /**
   * Focus the editor
   */
  focusEditor(): void {
    if (this.editorContent) {
      this.editorContent.nativeElement.focus();
    }
  }
  
  /**
   * Blur the editor
   */
  blurEditor(): void {
    if (this.editorContent) {
      this.editorContent.nativeElement.blur();
    }
  }
  
  /**
   * Insert content at current cursor position
   */
  insertContent(content: string): void {
    // Implementation for inserting content
    document.execCommand('insertHTML', false, content);
  }
  
  /**
   * Execute editor command
   */
  executeCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
  }
  
  /**
   * Validate editor content
   */
  validate(): NgUiValidationError[] {
    const errors: NgUiValidationError[] = [];
    const content = this.getContent();
    const validation = this.config().validation;
    
    if (validation?.required && !content.trim()) {
      errors.push({
        field: 'content',
        message: 'Content is required',
        code: 'required'
      });
    }
    
    if (validation?.minLength && content.length < validation.minLength) {
      errors.push({
        field: 'content',
        message: `Content must be at least ${validation.minLength} characters`,
        code: 'minLength'
      });
    }
    
    if (validation?.maxLength && content.length > validation.maxLength) {
      errors.push({
        field: 'content',
        message: `Content must not exceed ${validation.maxLength} characters`,
        code: 'maxLength'
      });
    }
    
    // Run custom validators
    validation?.validators?.forEach(validator => {
      const error = validator(content);
      if (error) {
        errors.push({
          field: 'content',
          message: error,
          code: 'custom'
        });
      }
    });
    
    this.validationErrors.set(errors);
    return errors;
  }
  
  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  
  private initializeEditor(): void {
    // Editor initialization logic
  }
  
  private setupEditor(): void {
    // Setup editor content
    this.setContent(this.data());
  }
  
  private updateEditor(): void {
    // Update editor configuration
  }
  
  private cleanup(): void {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
  }
  
  private scheduleAutosave(): void {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
    
    const interval = this.config().autosave?.interval || 5000;
    this.autosaveTimer = window.setTimeout(() => {
      this.performAutosave();
    }, interval);
  }
  
  private async performAutosave(): Promise<void> {
    try {
      const content = this.getContent();
      const autosaveConfig = this.config().autosave;
      
      if (autosaveConfig?.customSave) {
        await autosaveConfig.customSave(content);
      } else {
        // Default localStorage save
        const key = autosaveConfig?.storageKey || 'ngui-editor-content';
        localStorage.setItem(key, content);
      }
      
      this.lastSaved.set(new Date());
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  }
  
  private async exportToPdf(content: string): Promise<void> {
    // PDF export implementation
    console.log('Exporting to PDF:', content);
  }
  
  private async exportToJson(content: string): Promise<void> {
    // JSON export implementation
    const data = {
      content,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'editor-content.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  private getValidationStatus(): string {
    const errors = this.validationErrors();
    return errors.length > 0 ? `${errors.length} error(s)` : 'Valid';
  }
  
  private getAutosaveStatus(): string {
    const lastSaved = this.lastSaved();
    return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved';
  }
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    
    const focusEvent: NgUiEditorFocusEvent = {
      type: 'ngUiEditorFocus',
      timestamp: Date.now()
    };
    
    this.focus.emit(event);
    this.ngUiEditorFocus.emit(focusEvent);
    this.ngUiEditorEvent.emit(focusEvent);
  }
  
  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    const content = this.getContent();
    
    // Perform validation on blur
    if (this.config().validation?.realTime) {
      this.validate();
    }
    
    const blurEvent: NgUiEditorBlurEvent = {
      type: 'ngUiEditorBlur',
      content,
      timestamp: Date.now()
    };
    
    this.blur.emit(event);
    this.ngUiEditorBlur.emit(blurEvent);
    this.ngUiEditorEvent.emit(blurEvent);
  }
  
  onContentChange(event: Event): void {
    const content = this.getContent();
    
    const changeEvent: NgUiEditorChangeEvent = {
      type: 'ngUiEditorChange',
      content,
      timestamp: Date.now()
    };
    
    this.change.emit(content);
    this.ngUiEditorChange.emit(changeEvent);
    this.ngUiEditorEvent.emit(changeEvent);
    
    // Real-time validation
    if (this.config().validation?.realTime) {
      this.validate();
    }
  }
}