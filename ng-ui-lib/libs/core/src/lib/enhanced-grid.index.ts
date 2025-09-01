/**
 * Enhanced Grid Module Exports
 * 
 * This file exports all the enhanced keyboard navigation and accessibility
 * components and services for the BLG Grid that exceed ag-grid's capabilities.
 */

// Core Services
export { KeyboardNavigationService } from './services/keyboard-navigation.service';
export { AccessibilityService } from './services/accessibility.service';
export { AdvancedCellEditingService } from './services/advanced-cell-editing.service';
export { AdvancedSelectionService } from './services/advanced-selection.service';

// Interfaces and Types
export * from './interfaces/keyboard-navigation.interface';

// Testing Utilities
export { AccessibilityTestingUtils } from './testing/accessibility-testing.utils';
export type {
  AccessibilityTestResult,
  FocusTestResult,
  AriaTestResult,
  ColorContrastResult,
  ScreenReaderTestResult
} from './testing/accessibility-testing.utils';

// Enhanced Grid Component (to be exported from grid lib)
// export { EnhancedGridComponent } from '../../../grid/src/lib/enhanced-grid/enhanced-grid.component';