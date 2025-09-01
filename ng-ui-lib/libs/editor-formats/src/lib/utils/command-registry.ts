import { inject } from '@angular/core';
import { EditorCommandService } from '../services/editor-command.service';
import { FormattingCommand } from '../interfaces/formatting-command.interface';

// Import all command classes
import { BoldCommand, ItalicCommand, UnderlineCommand, StrikethroughCommand } from '../commands/basic-text-commands';
import { FontFamilyCommand, FontSizeCommand, IncreaseFontSizeCommand, DecreaseFontSizeCommand } from '../commands/font-commands';
import { TextColorCommand, BackgroundColorCommand, RemoveColorCommand } from '../commands/color-commands';
import { SubscriptCommand, SuperscriptCommand, ClearFormattingCommand, FormatPainterCommand } from '../commands/text-style-commands';
import { AlignLeftCommand, AlignCenterCommand, AlignRightCommand, AlignJustifyCommand, IndentCommand, OutdentCommand, LineHeightCommand, ParagraphSpacingCommand } from '../commands/paragraph-commands';
import { Heading1Command, Heading2Command, Heading3Command, Heading4Command, Heading5Command, Heading6Command, ParagraphCommand, BlockquoteCommand, PreformattedCommand } from '../commands/heading-commands';
import { OrderedListCommand, UnorderedListCommand, ListIndentCommand, ListOutdentCommand, ListStyleCommand } from '../commands/list-commands';
import { CodeBlockCommand, InlineCodeCommand, HorizontalRuleCommand, PageBreakCommand, InsertLinkCommand, RemoveLinkCommand } from '../commands/special-commands';

/**
 * Registry of all available formatting commands
 */
export class CommandRegistry {
  private static commands: Map<string, new () => FormattingCommand> = new Map([
    // Basic text formatting
    ['bold', BoldCommand],
    ['italic', ItalicCommand],
    ['underline', UnderlineCommand],
    ['strikethrough', StrikethroughCommand],
    
    // Font commands
    ['fontFamily', FontFamilyCommand],
    ['fontSize', FontSizeCommand],
    ['increaseFontSize', IncreaseFontSizeCommand],
    ['decreaseFontSize', DecreaseFontSizeCommand],
    
    // Color commands
    ['textColor', TextColorCommand],
    ['backgroundColor', BackgroundColorCommand],
    ['removeColor', RemoveColorCommand],
    
    // Text style commands
    ['subscript', SubscriptCommand],
    ['superscript', SuperscriptCommand],
    ['clearFormatting', ClearFormattingCommand],
    ['formatPainter', FormatPainterCommand],
    
    // Paragraph commands
    ['alignLeft', AlignLeftCommand],
    ['alignCenter', AlignCenterCommand],
    ['alignRight', AlignRightCommand],
    ['alignJustify', AlignJustifyCommand],
    ['indent', IndentCommand],
    ['outdent', OutdentCommand],
    ['lineHeight', LineHeightCommand],
    ['paragraphSpacing', ParagraphSpacingCommand],
    
    // Heading commands
    ['heading1', Heading1Command],
    ['heading2', Heading2Command],
    ['heading3', Heading3Command],
    ['heading4', Heading4Command],
    ['heading5', Heading5Command],
    ['heading6', Heading6Command],
    ['paragraph', ParagraphCommand],
    ['blockquote', BlockquoteCommand],
    ['preformatted', PreformattedCommand],
    
    // List commands
    ['orderedList', OrderedListCommand],
    ['unorderedList', UnorderedListCommand],
    ['listIndent', ListIndentCommand],
    ['listOutdent', ListOutdentCommand],
    ['listStyle', ListStyleCommand],
    
    // Special commands
    ['codeBlock', CodeBlockCommand],
    ['inlineCode', InlineCodeCommand],
    ['horizontalRule', HorizontalRuleCommand],
    ['pageBreak', PageBreakCommand],
    ['insertLink', InsertLinkCommand],
    ['removeLink', RemoveLinkCommand]
  ]);
  
  /**
   * Get all available command IDs
   */
  static getAvailableCommands(): string[] {
    return Array.from(this.commands.keys());
  }
  
  /**
   * Create a command instance by ID
   */
  static createCommand(commandId: string): FormattingCommand | null {
    const CommandClass = this.commands.get(commandId);
    if (!CommandClass) {
      console.warn(`Command '${commandId}' not found in registry`);
      return null;
    }
    
    return new CommandClass();
  }
  
  /**
   * Register all default commands with the command service
   */
  static registerDefaultCommands(commandService: EditorCommandService): void {
    this.commands.forEach((CommandClass, commandId) => {
      const command = new CommandClass();
      commandService.registerCommand(command);
    });
  }
  
  /**
   * Register a custom command
   */
  static registerCustomCommand(commandId: string, CommandClass: new () => FormattingCommand): void {
    this.commands.set(commandId, CommandClass);
  }
  
  /**
   * Get default toolbar command groups
   */
  static getDefaultToolbarCommands(): string[] {
    return [
      // Basic formatting
      'bold', 'italic', 'underline', 'strikethrough',
      
      // Font
      'fontFamily', 'fontSize',
      
      // Colors
      'textColor', 'backgroundColor',
      
      // Paragraph alignment
      'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
      
      // Indentation
      'indent', 'outdent',
      
      // Lists
      'orderedList', 'unorderedList',
      
      // Headings
      'heading1', 'heading2', 'heading3', 'paragraph',
      
      // Special
      'insertLink', 'inlineCode', 'clearFormatting'
    ];
  }
  
  /**
   * Get extended toolbar commands (includes all commands)
   */
  static getExtendedToolbarCommands(): string[] {
    return Array.from(this.commands.keys());
  }
  
  /**
   * Get commands by category
   */
  static getCommandsByCategory(category: 'basic' | 'font' | 'color' | 'paragraph' | 'heading' | 'list' | 'special'): string[] {
    const categories = {
      basic: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
      font: ['fontFamily', 'fontSize', 'increaseFontSize', 'decreaseFontSize'],
      color: ['textColor', 'backgroundColor', 'removeColor'],
      paragraph: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'indent', 'outdent', 'lineHeight', 'paragraphSpacing'],
      heading: ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'paragraph', 'blockquote', 'preformatted'],
      list: ['orderedList', 'unorderedList', 'listIndent', 'listOutdent', 'listStyle'],
      special: ['codeBlock', 'inlineCode', 'horizontalRule', 'pageBreak', 'insertLink', 'removeLink', 'clearFormatting', 'formatPainter']
    };
    
    return categories[category] || [];
  }
}

/**
 * Initialize the editor with default commands
 */
export function initializeEditorCommands(): EditorCommandService {
  const commandService = inject(EditorCommandService);
  CommandRegistry.registerDefaultCommands(commandService);
  return commandService;
}

/**
 * Get keyboard shortcuts mapping
 */
export function getKeyboardShortcuts(): Map<string, string> {
  const shortcuts = new Map<string, string>();
  
  CommandRegistry.getAvailableCommands().forEach(commandId => {
    const command = CommandRegistry.createCommand(commandId);
    if (command?.shortcut) {
      shortcuts.set(command.shortcut.toLowerCase(), commandId);
    }
  });
  
  return shortcuts;
}

/**
 * Setup keyboard shortcut handling
 */
export function setupKeyboardShortcuts(element: HTMLElement, commandService: EditorCommandService): () => void {
  const shortcuts = getKeyboardShortcuts();
  
  const handleKeyDown = (event: KeyboardEvent) => {
    const shortcut = buildShortcutString(event);
    const commandId = shortcuts.get(shortcut);
    
    if (commandId) {
      event.preventDefault();
      commandService.executeCommand(commandId);
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Build shortcut string from keyboard event
 */
function buildShortcutString(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (event.ctrlKey || event.metaKey) parts.push('ctrl');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');
  
  parts.push(event.key.toLowerCase());
  
  return parts.join('+');
}