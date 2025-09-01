/**
 * Represents a formatting command that can be executed on the editor
 */
export interface FormattingCommand {
  /** Unique identifier for the command */
  id: string;
  
  /** Display name for the command */
  name: string;
  
  /** Description for tooltips */
  description?: string;
  
  /** Icon identifier */
  icon?: string;
  
  /** Keyboard shortcut */
  shortcut?: string;
  
  /** Whether the command is currently active */
  isActive?: boolean;
  
  /** Whether the command is currently enabled */
  isEnabled?: boolean;
  
  /** Execute the formatting command */
  execute(value?: any): void;
  
  /** Check if the command is currently active */
  checkActive?(): boolean;
  
  /** Check if the command is currently enabled */
  checkEnabled?(): boolean;
}

/**
 * Types of formatting commands
 */
export enum FormattingCommandType {
  BASIC_TEXT = 'basic-text',
  FONT = 'font',
  COLOR = 'color',
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  LIST = 'list',
  SPECIAL = 'special'
}

/**
 * Configuration for a formatting command
 */
export interface FormattingCommandConfig {
  type: FormattingCommandType;
  id: string;
  name: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  group?: string;
  order?: number;
}

/**
 * Event emitted when a formatting command is executed
 */
export interface FormattingCommandEvent {
  command: FormattingCommand;
  value?: any;
  preventDefault?: boolean;
}