import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { TableEditorComponent } from './components/table-editor/table-editor.component';
import { TableInsertionDialogComponent } from './components/table-insertion-dialog/table-insertion-dialog.component';
import { TablePropertiesEditorComponent } from './components/table-properties-editor/table-properties-editor.component';
import { TableToolbarComponent } from './components/table-toolbar/table-toolbar.component';

// Services
import { TableStateService } from './services/table-state.service';
import { TableOperationsService } from './services/table-operations.service';
import { TableSelectionService } from './services/table-selection.service';
import { TableImportExportService } from './services/table-import-export.service';

/**
 * BLG Editor Tables Module
 * 
 * Provides comprehensive table editing functionality including:
 * - Visual table creation with picker interface
 * - Advanced cell selection and manipulation
 * - Row/column operations (insert, delete, merge, split)
 * - Import/export capabilities (CSV, JSON, Excel paste)
 * - Rich formatting and styling options
 * - Contextual toolbar with quick actions
 * - Undo/redo functionality
 * - Keyboard navigation and shortcuts
 * 
 * @example
 * ```typescript
 * import { EditorTablesModule } from '@ng-ui/editor-tables';
 * 
 * @NgModule({
 *   imports: [EditorTablesModule],
 *   // ...
 * })
 * export class AppModule { }
 * ```
 * 
 * For standalone components (recommended):
 * ```typescript
 * import { TableEditorComponent } from '@ng-ui/editor-tables';
 * 
 * @Component({
 *   standalone: true,
 *   imports: [TableEditorComponent],
 *   template: '<ng-ui-table-editor></blg-table-editor>'
 * })
 * export class MyComponent { }
 * ```
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // Import standalone components
    TableEditorComponent,
    TableInsertionDialogComponent,
    TablePropertiesEditorComponent,
    TableToolbarComponent
  ],
  exports: [
    // Export components for use in templates
    TableEditorComponent,
    TableInsertionDialogComponent,
    TablePropertiesEditorComponent,
    TableToolbarComponent
  ],
  providers: [
    // Services are provided in root, but included here for completeness
    TableStateService,
    TableOperationsService,
    TableSelectionService,
    TableImportExportService
  ]
})
export class EditorTablesModule {
  /**
   * Configure the module with custom options
   */
  static forRoot(config?: EditorTablesConfig): ModuleWithProviders<EditorTablesModule> {
    return {
      ngModule: EditorTablesModule,
      providers: [
        {
          provide: EDITOR_TABLES_CONFIG,
          useValue: config || {}
        }
      ]
    };
  }
}

/**
 * Configuration options for the Editor Tables module
 */
export interface EditorTablesConfig {
  /** Default table configuration */
  defaultTableConfig?: {
    rows?: number;
    columns?: number;
    hasHeader?: boolean;
    borderStyle?: string;
  };
  
  /** Import/Export settings */
  importExport?: {
    maxFileSize?: number;
    allowedFormats?: string[];
  };
  
  /** UI customization */
  ui?: {
    showToolbar?: boolean;
    compactMode?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
  
  /** Feature toggles */
  features?: {
    enableImportExport?: boolean;
    enableAdvancedFormatting?: boolean;
    enableKeyboardShortcuts?: boolean;
    enableUndoRedo?: boolean;
  };
}

/**
 * Injection token for Editor Tables configuration
 */
export const EDITOR_TABLES_CONFIG = 'EDITOR_TABLES_CONFIG';

/**
 * Interface for module with providers
 */
interface ModuleWithProviders<T> {
  ngModule: T;
  providers?: any[];
}