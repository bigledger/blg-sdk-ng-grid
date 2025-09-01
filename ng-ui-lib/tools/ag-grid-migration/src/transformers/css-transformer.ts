import { Transformation } from '../types/migration.types';

export class CssTransformer {
  private readonly CSS_CLASS_MAPPINGS = new Map([
    // Theme classes
    ['ag-theme-alpine', 'ngui-theme-alpine'],
    ['ag-theme-balham', 'ngui-theme-balham'],
    ['ag-theme-material', 'ngui-theme-material'],
    ['ag-theme-fresh', 'ngui-theme-fresh'],
    ['ag-theme-dark', 'ngui-theme-dark'],
    ['ag-theme-blue', 'ngui-theme-blue'],
    ['ag-theme-bootstrap', 'ngui-theme-bootstrap'],
    
    // Grid structure
    ['ag-grid', 'ngui-grid'],
    ['ag-root-wrapper', 'ngui-root-wrapper'],
    ['ag-root', 'ngui-root'],
    ['ag-body', 'ngui-body'],
    ['ag-body-container', 'ngui-body-container'],
    
    // Header classes
    ['ag-header', 'ngui-header'],
    ['ag-header-row', 'ngui-header-row'],
    ['ag-header-cell', 'ngui-header-cell'],
    ['ag-header-cell-text', 'ngui-header-cell-text'],
    ['ag-header-cell-menu-button', 'ngui-header-menu-button'],
    ['ag-header-cell-resize', 'ngui-header-resize'],
    ['ag-header-select-all', 'ngui-header-select-all'],
    
    // Row classes
    ['ag-row', 'ngui-row'],
    ['ag-row-even', 'ngui-row-even'],
    ['ag-row-odd', 'ngui-row-odd'],
    ['ag-row-selected', 'ngui-row-selected'],
    ['ag-row-hover', 'ngui-row-hover'],
    ['ag-row-editing', 'ngui-row-editing'],
    ['ag-row-group', 'ngui-row-group'],
    
    // Cell classes
    ['ag-cell', 'ngui-cell'],
    ['ag-cell-value', 'ngui-cell-value'],
    ['ag-cell-edit', 'ngui-cell-edit'],
    ['ag-cell-focus', 'ngui-cell-focus'],
    ['ag-cell-selected', 'ngui-cell-selected'],
    ['ag-cell-range-selected', 'ngui-cell-range-selected'],
    ['ag-cell-inline-editing', 'ngui-cell-inline-editing'],
    ['ag-cell-popup-editing', 'ngui-cell-popup-editing'],
    
    // Filter classes
    ['ag-filter', 'ngui-filter'],
    ['ag-filter-input', 'ngui-filter-input'],
    ['ag-filter-select', 'ngui-filter-select'],
    ['ag-floating-filter-input', 'ngui-quick-filter-input'],
    ['ag-set-filter', 'ngui-set-filter'],
    ['ag-text-filter', 'ngui-text-filter'],
    ['ag-number-filter', 'ngui-number-filter'],
    ['ag-date-filter', 'ngui-date-filter'],
    
    // Pagination classes
    ['ag-paging-panel', 'ngui-pagination-panel'],
    ['ag-paging-button', 'ngui-pagination-button'],
    ['ag-paging-description', 'ngui-pagination-description'],
    
    // Loading and overlay classes
    ['ag-overlay', 'ngui-overlay'],
    ['ag-loading', 'ngui-loading'],
    ['ag-no-rows-overlay', 'ngui-no-rows-overlay'],
    
    // Menu classes
    ['ag-menu', 'ngui-menu'],
    ['ag-menu-option', 'ngui-menu-option'],
    ['ag-menu-separator', 'ngui-menu-separator'],
    ['ag-context-menu', 'ngui-context-menu'],
    
    // Sort indicator classes
    ['ag-sort-ascending-icon', 'ngui-sort-ascending-icon'],
    ['ag-sort-descending-icon', 'ngui-sort-descending-icon'],
    ['ag-sort-none-icon', 'ngui-sort-none-icon'],
    
    // Selection classes
    ['ag-selection-checkbox', 'ngui-selection-checkbox'],
    ['ag-checkbox-input', 'ngui-checkbox-input'],
    ['ag-checkbox-input-wrapper', 'ngui-checkbox-wrapper'],
    
    // Grouping classes
    ['ag-group-expanded', 'ngui-group-expanded'],
    ['ag-group-collapsed', 'ngui-group-collapsed'],
    ['ag-group-title-bar', 'ngui-group-title-bar'],
    
    // Scrolling classes
    ['ag-body-viewport', 'ngui-body-viewport'],
    ['ag-body-horizontal-scroll', 'ngui-horizontal-scroll'],
    ['ag-body-vertical-scroll', 'ngui-vertical-scroll'],
  ]);

  private readonly UNSUPPORTED_CSS_CLASSES = new Set([
    // Enterprise-only features
    'ag-status-bar',
    'ag-side-bar',
    'ag-tool-panel',
    'ag-column-tool-panel',
    'ag-filters-tool-panel',
    'ag-charts-range-selection',
    'ag-range-selection',
    'ag-master-detail',
    'ag-detail-row',
    'ag-pivot-mode',
    
    // Advanced features not yet implemented
    'ag-watermark',
    'ag-rtl',
    'ag-ltr'
  ]);

  transformCssClasses(
    filePath: string,
    line: number,
    column: number,
    originalText: string,
    cssClasses: string[]
  ): Transformation[] {
    const transformations: Transformation[] = [];
    const transformedClasses: string[] = [];
    const warnings: string[] = [];

    for (const cssClass of cssClasses) {
      // Check if it's an unsupported class
      if (this.UNSUPPORTED_CSS_CLASSES.has(cssClass)) {
        warnings.push(`Unsupported CSS class '${cssClass}' - feature not available`);
        transformedClasses.push(`/* TODO: ${cssClass} not supported */`);
        continue;
      }

      // Find exact matches first
      if (this.CSS_CLASS_MAPPINGS.has(cssClass)) {
        transformedClasses.push(this.CSS_CLASS_MAPPINGS.get(cssClass)!);
        continue;
      }

      // Check for partial matches with theme classes
      let transformed = false;
      for (const [agClass, ngUiClass] of this.CSS_CLASS_MAPPINGS.entries()) {
        if (cssClass.startsWith(agClass)) {
          const suffix = cssClass.substring(agClass.length);
          transformedClasses.push(ngUiClass + suffix);
          transformed = true;
          break;
        }
      }

      if (!transformed) {
        // If no transformation found, keep original but add comment
        if (cssClass.startsWith('ag-')) {
          transformedClasses.push(`/* TODO: Transform ${cssClass} */ ${cssClass}`);
          warnings.push(`Unknown ag-Grid CSS class '${cssClass}' - manual review needed`);
        } else {
          transformedClasses.push(cssClass);
        }
      }
    }

    // Create transformation if changes were made
    const newClassString = transformedClasses.join(' ');
    const oldClassString = cssClasses.join(' ');

    if (newClassString !== oldClassString) {
      let description = 'Transform ag-Grid CSS classes to ng-ui equivalents';
      if (warnings.length > 0) {
        description += ` (${warnings.length} manual reviews needed)`;
      }

      transformations.push({
        filePath,
        type: 'css',
        line,
        column,
        oldText: oldClassString,
        newText: newClassString,
        description
      });
    }

    return transformations;
  }

  transformCssFile(
    filePath: string,
    cssContent: string
  ): { content: string; transformations: Transformation[] } {
    const transformations: Transformation[] = [];
    let transformedContent = cssContent;
    const lines = cssContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Find CSS selectors that contain ag-grid classes
      const selectorRegex = /\.ag-[\w-]+/g;
      let match;
      let lineTransformed = line;

      while ((match = selectorRegex.exec(line)) !== null) {
        const agClass = match[0].substring(1); // Remove the dot
        const ngUiClass = this.CSS_CLASS_MAPPINGS.get(agClass);
        
        if (ngUiClass) {
          const newSelector = '.' + ngUiClass;
          lineTransformed = lineTransformed.replace(match[0], newSelector);
          
          transformations.push({
            filePath,
            type: 'css',
            line: lineNumber,
            column: match.index,
            oldText: match[0],
            newText: newSelector,
            description: `Transform CSS selector from '${match[0]}' to '${newSelector}'`
          });
        }
      }

      lines[i] = lineTransformed;
    }

    transformedContent = lines.join('\n');
    return { content: transformedContent, transformations };
  }

  transformInlineStyles(
    filePath: string,
    line: number,
    column: number,
    styleString: string
  ): Transformation | null {
    // Transform inline styles that might reference ag-grid CSS custom properties
    const agCustomProperties = [
      '--ag-background-color',
      '--ag-header-background-color',
      '--ag-header-foreground-color',
      '--ag-row-hover-color',
      '--ag-row-border-color',
      '--ag-cell-horizontal-border',
      '--ag-font-family',
      '--ag-font-size',
      '--ag-icon-font-family'
    ];

    let transformedStyle = styleString;
    let hasChanges = false;

    agCustomProperties.forEach(agProp => {
      const nguiProp = agProp.replace('--ag-', '--ngui-');
      if (transformedStyle.includes(agProp)) {
        transformedStyle = transformedStyle.replace(new RegExp(agProp, 'g'), nguiProp);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      return {
        filePath,
        type: 'css',
        line,
        column,
        oldText: styleString,
        newText: transformedStyle,
        description: 'Transform ag-Grid CSS custom properties to ng-ui equivalents'
      };
    }

    return null;
  }

  getUnsupportedCssClasses(): Set<string> {
    return this.UNSUPPORTED_CSS_CLASSES;
  }

  getAllCssMappings(): Map<string, string> {
    return this.CSS_CLASS_MAPPINGS;
  }

  addCustomCssMapping(agGridClass: string, ngUiClass: string): void {
    this.CSS_CLASS_MAPPINGS.set(agGridClass, ngUiClass);
  }

  addUnsupportedCssClass(cssClass: string): void {
    this.UNSUPPORTED_CSS_CLASSES.add(cssClass);
  }
}