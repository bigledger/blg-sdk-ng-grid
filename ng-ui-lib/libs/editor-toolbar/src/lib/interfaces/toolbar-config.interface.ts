/**
 * Toolbar configuration interface for the BLG Editor Toolbar
 */
export interface ToolbarConfig {
  /** Toolbar mode - controls layout and positioning behavior */
  mode: ToolbarMode;
  
  /** Toolbar theme configuration */
  theme?: ToolbarTheme;
  
  /** Toolbar sections configuration */
  sections: ToolbarSection[];
  
  /** Responsive breakpoints */
  breakpoints?: ToolbarBreakpoints;
  
  /** Whether the toolbar is visible */
  visible?: boolean;
  
  /** Custom CSS classes */
  cssClasses?: string[];
  
  /** Keyboard navigation options */
  keyboardNavigation?: boolean;
  
  /** Touch-friendly mode */
  touchFriendly?: boolean;
  
  /** Animation settings */
  animations?: ToolbarAnimations;
}

/**
 * Toolbar display modes
 */
export type ToolbarMode = 
  | 'fixed'      // Fixed at top
  | 'floating'   // Bubble toolbar on selection
  | 'sticky'     // Follows scroll
  | 'inline'     // Inline with content
  | 'mobile';    // Mobile-optimized

/**
 * Toolbar theme configuration
 */
export interface ToolbarTheme {
  /** Primary color */
  primary?: string;
  
  /** Background color */
  background?: string;
  
  /** Text color */
  textColor?: string;
  
  /** Border color */
  borderColor?: string;
  
  /** Hover color */
  hoverColor?: string;
  
  /** Active color */
  activeColor?: string;
  
  /** Disabled color */
  disabledColor?: string;
  
  /** Shadow configuration */
  shadow?: string;
  
  /** Border radius */
  borderRadius?: string;
  
  /** Icon size */
  iconSize?: string;
}

/**
 * Toolbar section configuration
 */
export interface ToolbarSection {
  /** Section identifier */
  id: string;
  
  /** Section title */
  title?: string;
  
  /** Section buttons */
  buttons: ToolbarButton[];
  
  /** Section visibility */
  visible?: boolean;
  
  /** Section order */
  order?: number;
  
  /** Whether section has a separator */
  separator?: boolean;
  
  /** Responsive behavior */
  responsive?: SectionResponsive;
}

/**
 * Toolbar button configuration
 */
export interface ToolbarButton {
  /** Button identifier */
  id: string;
  
  /** Button type */
  type: ToolbarButtonType;
  
  /** Button icon */
  icon?: string;
  
  /** Button label */
  label?: string;
  
  /** Button tooltip */
  tooltip?: string;
  
  /** Button action */
  action?: string | (() => void);
  
  /** Button visibility */
  visible?: boolean;
  
  /** Button enabled state */
  enabled?: boolean;
  
  /** Button active state */
  active?: boolean;
  
  /** Button order */
  order?: number;
  
  /** Dropdown options (for dropdown buttons) */
  options?: ToolbarButtonOption[];
  
  /** Custom properties */
  properties?: Record<string, any>;
  
  /** Keyboard shortcut */
  shortcut?: string;
}

/**
 * Toolbar button types
 */
export type ToolbarButtonType = 
  | 'button'          // Simple button
  | 'toggle'          // Toggle button
  | 'dropdown'        // Dropdown button
  | 'color-picker'    // Color picker
  | 'font-selector'   // Font selector
  | 'size-selector'   // Size selector
  | 'separator'       // Visual separator
  | 'group'           // Button group
  | 'custom';         // Custom component

/**
 * Toolbar button option (for dropdowns)
 */
export interface ToolbarButtonOption {
  /** Option value */
  value: any;
  
  /** Option label */
  label: string;
  
  /** Option icon */
  icon?: string;
  
  /** Option enabled state */
  enabled?: boolean;
  
  /** Option group */
  group?: string;
}

/**
 * Responsive breakpoints
 */
export interface ToolbarBreakpoints {
  /** Mobile breakpoint (px) */
  mobile?: number;
  
  /** Tablet breakpoint (px) */
  tablet?: number;
  
  /** Desktop breakpoint (px) */
  desktop?: number;
}

/**
 * Section responsive configuration
 */
export interface SectionResponsive {
  /** Hide section on mobile */
  hideOnMobile?: boolean;
  
  /** Hide section on tablet */
  hideOnTablet?: boolean;
  
  /** Collapse to dropdown on mobile */
  collapseOnMobile?: boolean;
  
  /** Priority order for mobile */
  mobilePriority?: number;
}

/**
 * Animation settings
 */
export interface ToolbarAnimations {
  /** Enable animations */
  enabled?: boolean;
  
  /** Animation duration (ms) */
  duration?: number;
  
  /** Animation easing */
  easing?: string;
  
  /** Fade animations */
  fade?: boolean;
  
  /** Slide animations */
  slide?: boolean;
}

/**
 * Toolbar state interface
 */
export interface ToolbarState {
  /** Current toolbar configuration */
  config: ToolbarConfig;
  
  /** Active buttons */
  activeButtons: Set<string>;
  
  /** Disabled buttons */
  disabledButtons: Set<string>;
  
  /** Button values */
  buttonValues: Map<string, any>;
  
  /** Current selection state */
  selectionState?: SelectionState;
  
  /** Mobile mode active */
  mobileMode: boolean;
  
  /** Keyboard navigation active */
  keyboardNavigation: boolean;
}

/**
 * Selection state for floating toolbar
 */
export interface SelectionState {
  /** Selection exists */
  hasSelection: boolean;
  
  /** Selection text */
  text?: string;
  
  /** Selection range */
  range?: Range;
  
  /** Selection bounds */
  bounds?: DOMRect;
  
  /** Selected element */
  element?: HTMLElement;
}

/**
 * Toolbar event types
 */
export interface ToolbarEvents {
  /** Button clicked */
  buttonClick: ToolbarButtonEvent;
  
  /** Button toggled */
  buttonToggle: ToolbarButtonToggleEvent;
  
  /** Dropdown option selected */
  dropdownSelect: ToolbarDropdownEvent;
  
  /** Color picked */
  colorPick: ToolbarColorEvent;
  
  /** Font selected */
  fontSelect: ToolbarFontEvent;
  
  /** Size selected */
  sizeSelect: ToolbarSizeEvent;
  
  /** Toolbar mode changed */
  modeChange: ToolbarModeEvent;
  
  /** Toolbar state changed */
  stateChange: ToolbarStateEvent;
}

/**
 * Base toolbar event
 */
export interface BaseToolbarEvent {
  /** Event source button */
  button: ToolbarButton;
  
  /** Event timestamp */
  timestamp: Date;
  
  /** Original DOM event */
  originalEvent?: Event;
}

/**
 * Button click event
 */
export interface ToolbarButtonEvent extends BaseToolbarEvent {
  /** Button action */
  action?: string | (() => void);
}

/**
 * Button toggle event
 */
export interface ToolbarButtonToggleEvent extends BaseToolbarEvent {
  /** New active state */
  active: boolean;
  
  /** Previous active state */
  previousActive: boolean;
}

/**
 * Dropdown selection event
 */
export interface ToolbarDropdownEvent extends BaseToolbarEvent {
  /** Selected option */
  option: ToolbarButtonOption;
  
  /** Selected value */
  value: any;
}

/**
 * Color picker event
 */
export interface ToolbarColorEvent extends BaseToolbarEvent {
  /** Selected color */
  color: string;
  
  /** Color format */
  format: 'hex' | 'rgb' | 'hsl';
}

/**
 * Font selector event
 */
export interface ToolbarFontEvent extends BaseToolbarEvent {
  /** Selected font */
  font: string;
  
  /** Font family */
  family: string;
  
  /** Font weight */
  weight?: string;
  
  /** Font style */
  style?: string;
}

/**
 * Size selector event
 */
export interface ToolbarSizeEvent extends BaseToolbarEvent {
  /** Selected size */
  size: number | string;
  
  /** Size unit */
  unit: string;
}

/**
 * Mode change event
 */
export interface ToolbarModeEvent {
  /** New mode */
  mode: ToolbarMode;
  
  /** Previous mode */
  previousMode: ToolbarMode;
  
  /** Event timestamp */
  timestamp: Date;
}

/**
 * State change event
 */
export interface ToolbarStateEvent {
  /** New state */
  state: ToolbarState;
  
  /** Previous state */
  previousState: ToolbarState;
  
  /** Changed properties */
  changes: string[];
  
  /** Event timestamp */
  timestamp: Date;
}