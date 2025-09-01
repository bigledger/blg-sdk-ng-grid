/**
 * Font formatting options
 */
export interface FontOptions {
  /** Font family */
  fontFamily?: string;
  
  /** Font size */
  fontSize?: string;
  
  /** Font weight */
  fontWeight?: string | number;
  
  /** Font style */
  fontStyle?: 'normal' | 'italic' | 'oblique';
}

/**
 * Color formatting options
 */
export interface ColorOptions {
  /** Text color */
  color?: string;
  
  /** Background color */
  backgroundColor?: string;
}

/**
 * Paragraph formatting options
 */
export interface ParagraphOptions {
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  /** Line height */
  lineHeight?: string | number;
  
  /** Margin top */
  marginTop?: string;
  
  /** Margin bottom */
  marginBottom?: string;
  
  /** Padding left */
  paddingLeft?: string;
  
  /** Padding right */
  paddingRight?: string;
  
  /** Text indentation */
  textIndent?: string;
}

/**
 * List formatting options
 */
export interface ListOptions {
  /** List type */
  listType?: 'ordered' | 'unordered';
  
  /** List style type */
  listStyleType?: string;
  
  /** Nesting level */
  level?: number;
}

/**
 * Heading formatting options
 */
export interface HeadingOptions {
  /** Heading level (1-6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Combined formatting options
 */
export interface FormattingOptions extends FontOptions, ColorOptions, ParagraphOptions {
  /** Custom CSS properties */
  customStyles?: { [key: string]: string };
}