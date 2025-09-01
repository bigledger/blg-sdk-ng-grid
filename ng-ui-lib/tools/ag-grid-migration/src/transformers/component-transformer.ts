import { Transformation, AgGridAttribute } from '../types/migration.types';

export class ComponentTransformer {
  private readonly COMPONENT_MAPPINGS = new Map([
    ['ag-grid-angular', 'ngui-grid'],
    ['AgGridAngular', 'NgUiGridComponent']
  ]);

  private readonly ATTRIBUTE_MAPPINGS = new Map([
    // Basic configuration
    ['[rowData]', '[data]'],
    ['[columnDefs]', '[columns]'],
    ['[gridOptions]', '[config]'],
    ['[defaultColDef]', '[defaultColumn]'],
    
    // Events - maintain similar naming but with ngui prefix
    ['(gridReady)', '(gridReady)'],
    ['(selectionChanged)', '(selectionChanged)'],
    ['(rowClicked)', '(rowClicked)'],
    ['(cellClicked)', '(cellClicked)'],
    ['(columnResized)', '(columnResized)'],
    ['(sortChanged)', '(sortChanged)'],
    ['(filterChanged)', '(filterChanged)'],
    ['(rowSelected)', '(rowSelected)'],
    ['(rowDeselected)', '(rowDeselected)'],
    ['(cellValueChanged)', '(cellValueChanged)'],
    ['(rowEditingStarted)', '(rowEditingStarted)'],
    ['(rowEditingStopped)', '(rowEditingStopped)'],
    ['(cellEditingStarted)', '(cellEditingStarted)'],
    ['(cellEditingStopped)', '(cellEditingStopped)'],
    
    // Boolean properties
    ['[enableSorting]', '[sortable]'],
    ['[enableFiltering]', '[filterable]'],
    ['[enableColResize]', '[resizable]'],
    ['[pagination]', '[paginated]'],
    ['[suppressRowClickSelection]', '[disableRowClickSelection]'],
    ['[suppressColumnMoveAnimation]', '[disableColumnMoveAnimation]'],
    ['[suppressRowHoverHighlight]', '[disableRowHover]'],
    ['[suppressCellSelection]', '[disableCellSelection]'],
    
    // Selection
    ['rowSelection', 'rowSelection'], // Keep same for compatibility
    ['[suppressRowClickSelection]', '[disableRowClickSelection]'],
    
    // Styling
    ['class', 'class'], // CSS classes handled separately
    ['[ngClass]', '[ngClass]'],
    ['[ngStyle]', '[ngStyle]'],
    
    // Size and layout
    ['[rowHeight]', '[rowHeight]'],
    ['[headerHeight]', '[headerHeight]'],
    ['[animateRows]', '[animateRows]'],
    
    // Data and performance
    ['[getRowId]', '[getRowId]'],
    ['[context]', '[context]'],
    ['[loading]', '[loading]'],
    
    // Pagination specific
    ['[paginationPageSize]', '[pageSize]'],
    ['[paginationAutoPageSize]', '[autoPageSize]'],
    
    // Templates and custom components
    ['[components]', '[customComponents]'],
    ['[frameworkComponents]', '[customComponents]'], // Merge both to customComponents
  ]);

  private readonly UNSUPPORTED_ATTRIBUTES = new Set([
    '[enableRangeSelection]', // Enterprise feature - requires manual implementation
    '[enableCharts]',         // Charts not supported yet
    '[allowContextMenuWithControlKey]',
    '[enableBrowserTooltips]',
    '[suppressContextMenu]',
    '[masterDetail]',         // Master-detail not supported
    '[treeData]',            // Tree data requires special handling
    '[groupDefaultExpanded]',
    '[autoGroupColumnDef]',
    '[groupHeaderHeight]',
    '[getContextMenuItems]',
    '[getMainMenuItems]',
    '[statusBar]',           // Status bar not available
    '[sideBar]',             // Side bar not available
    '[toolPanel]',           // Tool panel not available
  ]);

  transformComponent(
    filePath: string,
    line: number,
    column: number,
    originalText: string,
    selector: string,
    attributes: AgGridAttribute[]
  ): Transformation[] {
    const transformations: Transformation[] = [];

    // Transform component selector
    const newSelector = this.COMPONENT_MAPPINGS.get(selector) || selector;
    
    // Transform attributes
    const transformedAttributes: string[] = [];
    const warnings: string[] = [];
    
    for (const attr of attributes) {
      if (this.UNSUPPORTED_ATTRIBUTES.has(attr.name)) {
        warnings.push(`Unsupported attribute '${attr.name}' requires manual migration`);
        transformedAttributes.push(`<!-- TODO: Migrate ${attr.name}="${attr.value}" manually -->`);
        continue;
      }

      const newAttrName = this.ATTRIBUTE_MAPPINGS.get(attr.name) || attr.name;
      const attrText = attr.value ? `${newAttrName}="${attr.value}"` : newAttrName;
      transformedAttributes.push(attrText);
    }

    // Build new component tag
    const attributeString = transformedAttributes.length > 0 
      ? ' ' + transformedAttributes.join(' ') 
      : '';
    const newComponentText = `<${newSelector}${attributeString}>`;
    
    if (originalText !== newComponentText) {
      let description = `Transform ag-Grid component from '${selector}' to '${newSelector}'`;
      if (warnings.length > 0) {
        description += ` (${warnings.length} manual changes required)`;
      }

      transformations.push({
        filePath,
        type: 'component',
        line,
        column,
        oldText: originalText,
        newText: newComponentText,
        description
      });
    }

    // Add transformations for closing tags if needed
    const closingTagRegex = new RegExp(`</${selector}>`, 'g');
    if (selector !== newSelector) {
      transformations.push({
        filePath,
        type: 'component',
        line: line + 1, // Assume closing tag is on next line or later
        column: 0,
        oldText: `</${selector}>`,
        newText: `</${newSelector}>`,
        description: `Transform closing tag for '${selector}'`
      });
    }

    return transformations;
  }

  transformTemplateReference(
    filePath: string,
    line: number,
    column: number,
    originalText: string,
    templateRef: string
  ): Transformation | null {
    // Handle template reference variables like #agGrid
    if (templateRef.startsWith('#') && templateRef.toLowerCase().includes('grid')) {
      const newTemplateRef = templateRef.replace(/ag[Gg]rid/g, 'nguiGrid');
      
      if (newTemplateRef !== templateRef) {
        return {
          filePath,
          type: 'component',
          line,
          column,
          oldText: templateRef,
          newText: newTemplateRef,
          description: `Transform template reference '${templateRef}' to '${newTemplateRef}'`
        };
      }
    }

    return null;
  }

  getUnsupportedFeatures(): Set<string> {
    return this.UNSUPPORTED_ATTRIBUTES;
  }

  addCustomAttributeMapping(agGridAttribute: string, ngUiAttribute: string): void {
    this.ATTRIBUTE_MAPPINGS.set(agGridAttribute, ngUiAttribute);
  }

  addUnsupportedAttribute(attribute: string): void {
    this.UNSUPPORTED_ATTRIBUTES.add(attribute);
  }
}