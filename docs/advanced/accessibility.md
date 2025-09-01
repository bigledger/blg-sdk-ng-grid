# Accessibility Guide

The BLG Grid is designed with accessibility in mind, providing comprehensive support for screen readers, keyboard navigation, and other assistive technologies. This guide covers how to implement and customize accessibility features.

## ARIA Support

### Built-in ARIA Attributes

The BLG Grid automatically applies appropriate ARIA attributes:

```html
<!-- Grid container -->
<div class="ng-ui-lib" 
     role="grid" 
     tabindex="0"
     aria-label="Data Grid"
     aria-rowcount="1000"
     aria-colcount="5">
  
  <!-- Header row -->
  <div role="row" 
       aria-rowindex="1">
    <div role="columnheader" 
         aria-colindex="1"
         aria-sort="ascending"
         tabindex="-1">
      Name
    </div>
  </div>
  
  <!-- Data rows -->
  <div role="row" 
       aria-rowindex="2"
       aria-selected="true">
    <div role="gridcell" 
         aria-colindex="1"
         tabindex="-1">
      John Doe
    </div>
  </div>
</div>
```

### Custom ARIA Labels

```typescript
@Component({
  selector: 'app-accessible-grid',
  template: `
    <ng-ui-lib 
      [data]="employees"
      [columns]="columns"
      [config]="config"
      [ariaLabel]="gridAriaLabel"
      [ariaDescription]="gridDescription">
    </ng-ui-lib>
  `
})
export class AccessibleGridComponent {
  gridAriaLabel = 'Employee Directory';
  gridDescription = 'Sortable and filterable table of company employees with contact information';
  
  config: GridConfig = {
    // Accessibility-friendly configuration
    sortable: true,
    filterable: true,
    selectable: true,
    // Ensure keyboard navigation works well
    rowHeight: 44, // Larger touch targets
  };
  
  columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Full Name',
      // Add aria-label for complex columns
      ariaLabel: 'Employee full name, sortable',
      sortable: true
    },
    {
      id: 'email',
      field: 'email',
      header: 'Email Address',
      ariaLabel: 'Employee email address, click to send email',
      cellRenderer: '<a href="mailto:{{value}}" aria-label="Send email to {{value}}">{{value}}</a>'
    },
    {
      id: 'status',
      field: 'status',
      header: 'Employment Status',
      ariaLabel: 'Current employment status',
      cellRenderer: '<span role="img" aria-label="{{value === \'active\' ? \'Active employee\' : \'Inactive employee\'}}">{{value === "active" ? "✅" : "❌"}}</span> {{value}}'
    }
  ];
}
```

## Keyboard Navigation

### Complete Keyboard Support

The grid supports comprehensive keyboard navigation:

```typescript
@Component({
  selector: 'app-keyboard-grid',
  template: `
    <div class="keyboard-instructions" aria-live="polite">
      <h3>Keyboard Navigation</h3>
      <ul>
        <li><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> - Move between focusable elements</li>
        <li><kbd>Arrow Keys</kbd> - Navigate between cells</li>
        <li><kbd>Enter</kbd> / <kbd>Space</kbd> - Activate buttons, select rows</li>
        <li><kbd>F2</kbd> - Start editing current cell</li>
        <li><kbd>Escape</kbd> - Cancel editing, clear selection</li>
        <li><kbd>Home</kbd> / <kbd>End</kbd> - Navigate to row/grid boundaries</li>
        <li><kbd>Page Up</kbd> / <kbd>Page Down</kbd> - Navigate by pages</li>
        <li><kbd>Ctrl+A</kbd> - Select all rows</li>
      </ul>
    </div>
    
    <ng-ui-lib 
      [data]="data"
      [columns]="columns"
      [config]="config"
      (focusChange)="announceFocusChange($event)"
      (keyboardAction)="announceAction($event)">
    </ng-ui-lib>
    
    <!-- Screen reader announcements -->
    <div aria-live="assertive" class="sr-only">
      {{ announcement }}
    </div>
  `,
  styles: [`
    .keyboard-instructions {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f9f9f9;
    }
    
    .keyboard-instructions kbd {
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 0.9em;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class KeyboardGridComponent {
  announcement = '';
  
  config: GridConfig = {
    sortable: true,
    filterable: true,
    selectable: true,
    // Enhanced keyboard navigation
    keyboardNavigation: {
      enabled: true,
      skipToContent: true,
      announceChanges: true,
      wrapNavigation: false
    }
  };

  announceFocusChange(event: { row: number, column: string, value: any }) {
    const columnHeader = this.getColumnHeader(event.column);
    this.announcement = `Focused on ${columnHeader}, row ${event.row + 1}, value: ${event.value}`;
  }

  announceAction(event: { action: string, context: any }) {
    switch (event.action) {
      case 'sort':
        this.announcement = `Sorted by ${event.context.column} ${event.context.direction}`;
        break;
      case 'select':
        this.announcement = `${event.context.selected ? 'Selected' : 'Deselected'} row ${event.context.row + 1}`;
        break;
      case 'edit':
        this.announcement = `Editing ${event.context.column} in row ${event.context.row + 1}`;
        break;
    }
  }

  private getColumnHeader(columnId: string): string {
    const column = this.columns.find(col => col.id === columnId);
    return column?.header || columnId;
  }
}
```

### Custom Keyboard Handlers

```typescript
@Component({
  selector: 'app-custom-keyboard-grid'
})
export class CustomKeyboardGridComponent {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const focused = this.gridState.focusedCell();
    if (!focused) return;

    // Custom keyboard shortcuts
    switch (event.key) {
      case 'Delete':
        if (event.ctrlKey) {
          event.preventDefault();
          this.deleteSelectedRows();
        }
        break;
        
      case 'c':
        if (event.ctrlKey) {
          event.preventDefault();
          this.copySelection();
        }
        break;
        
      case 'v':
        if (event.ctrlKey) {
          event.preventDefault();
          this.pasteData();
        }
        break;
        
      case '?':
        if (event.shiftKey) {
          event.preventDefault();
          this.showKeyboardHelp();
        }
        break;
    }
  }

  private deleteSelectedRows() {
    const selectedCount = this.gridState.selectedRows().size;
    this.announcement = `Deleted ${selectedCount} selected rows`;
  }

  private copySelection() {
    this.announcement = 'Selection copied to clipboard';
  }

  private pasteData() {
    this.announcement = 'Data pasted from clipboard';
  }

  private showKeyboardHelp() {
    // Show keyboard help modal
    this.announcement = 'Keyboard help dialog opened';
  }
}
```

## Screen Reader Support

### Comprehensive Screen Reader Experience

```typescript
@Component({
  selector: 'app-screen-reader-grid',
  template: `
    <!-- Summary information for screen readers -->
    <div class="sr-only" id="grid-summary">
      This data grid contains {{ data.length }} employees.
      Use arrow keys to navigate. Press F2 to edit cells.
      Current sort: {{ getCurrentSort() }}.
      {{ getSelectionSummary() }}
    </div>
    
    <ng-ui-lib 
      [data]="data"
      [columns]="columns"
      [config]="config"
      aria-describedby="grid-summary"
      (dataChange)="updateSummary()"
      (sortChange)="announceSortChange($event)"
      (selectionChange)="announceSelectionChange($event)">
    </ng-ui-lib>
    
    <!-- Live region for dynamic announcements -->
    <div 
      class="sr-only" 
      aria-live="polite" 
      aria-atomic="false"
      id="status-updates">
      {{ statusUpdate }}
    </div>
    
    <!-- Assertive announcements for critical updates -->
    <div 
      class="sr-only" 
      aria-live="assertive" 
      aria-atomic="true"
      id="urgent-updates">
      {{ urgentUpdate }}
    </div>
  `
})
export class ScreenReaderGridComponent {
  statusUpdate = '';
  urgentUpdate = '';
  
  columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Employee Name',
      // Screen reader friendly description
      screenReaderDescription: 'Employee full name, sortable column',
      sortable: true
    },
    {
      id: 'department',
      field: 'department',
      header: 'Department',
      screenReaderDescription: 'Employee department, filterable',
      filterable: true
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Annual Salary',
      type: 'number',
      screenReaderDescription: 'Annual salary in US dollars, sortable',
      // Format for screen readers
      screenReaderFormat: (value: number) => `$${value.toLocaleString()} dollars per year`,
      sortable: true
    },
    {
      id: 'startDate',
      field: 'startDate',
      header: 'Start Date',
      type: 'date',
      screenReaderDescription: 'Employment start date',
      screenReaderFormat: (value: Date) => value.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  ];
  
  config: GridConfig = {
    // Accessibility optimized settings
    sortable: true,
    filterable: true,
    selectable: true,
    screenReaderMode: true,
    announceChanges: true,
    // Provide context for screen readers
    gridLabel: 'Employee directory data grid',
    gridDescription: 'Navigate with arrow keys, press F2 to edit, space to select'
  };

  getCurrentSort(): string {
    const sortState = this.gridState.sortState();
    if (!sortState || sortState.length === 0) {
      return 'No sorting applied';
    }
    
    const sorts = sortState.map(sort => 
      `${this.getColumnName(sort.columnId)} ${sort.direction}ending`
    ).join(', then by ');
    
    return `Sorted by ${sorts}`;
  }

  getSelectionSummary(): string {
    const selectedCount = this.gridState.selectedRows().size;
    const totalCount = this.data.length;
    
    if (selectedCount === 0) {
      return 'No rows selected.';
    } else if (selectedCount === totalCount) {
      return 'All rows selected.';
    } else {
      return `${selectedCount} of ${totalCount} rows selected.`;
    }
  }

  announceSortChange(event: any) {
    const column = this.getColumnName(event.columnId);
    if (event.direction) {
      this.statusUpdate = `Table sorted by ${column} in ${event.direction}ending order`;
    } else {
      this.statusUpdate = `Sorting cleared for ${column}`;
    }
  }

  announceSelectionChange(event: any) {
    const selectedCount = event.selectedCount;
    if (selectedCount === 0) {
      this.statusUpdate = 'All selections cleared';
    } else {
      this.statusUpdate = `${selectedCount} ${selectedCount === 1 ? 'row' : 'rows'} selected`;
    }
  }

  updateSummary() {
    // Announce data changes to screen readers
    this.statusUpdate = `Data updated. ${this.data.length} employees displayed.`;
  }

  private getColumnName(columnId: string): string {
    const column = this.columns.find(col => col.id === columnId);
    return column?.header || columnId;
  }
}
```

## High Contrast and Visual Accessibility

### High Contrast Theme Support

```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  .ng-ui-lib {
    --ng-ui-lib-border-color: #000000;
    --ng-ui-lib-text-primary: #000000;
    --ng-ui-lib-bg-primary: #ffffff;
    --ng-ui-lib-primary-color: #0000ff;
  }
  
  .ng-ui-lib .grid-row.selected {
    background: #000000;
    color: #ffffff;
  }
  
  .ng-ui-lib .grid-cell:focus {
    outline: 3px solid #000000;
    outline-offset: -3px;
  }
}

/* Windows High Contrast Mode */
@media (-ms-high-contrast: active) {
  .ng-ui-lib {
    border: 1px solid WindowText;
    background: Window;
    color: WindowText;
  }
  
  .ng-ui-lib .grid-header {
    background: ButtonFace;
    color: ButtonText;
  }
  
  .ng-ui-lib .grid-row.selected {
    background: Highlight;
    color: HighlightText;
  }
}

/* Forced colors mode (newer standard) */
@media (forced-colors: active) {
  .ng-ui-lib {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
  
  .ng-ui-lib .grid-row.selected {
    background: SelectedItem;
    color: SelectedItemText;
  }
  
  .ng-ui-lib .grid-cell:focus {
    outline: 2px solid Highlight;
  }
}
```

### Focus Management

```typescript
@Component({
  selector: 'app-focus-managed-grid'
})
export class FocusManagedGridComponent implements AfterViewInit {
  @ViewChild('grid') gridElement!: ElementRef;
  
  private focusTrap: FocusTrap | null = null;
  
  ngAfterViewInit() {
    this.setupFocusTrap();
    this.setupFocusIndicators();
  }
  
  private setupFocusTrap() {
    // Create focus trap for modal-like behavior when needed
    this.focusTrap = createFocusTrap(this.gridElement.nativeElement, {
      initialFocus: false,
      allowOutsideClick: true,
      returnFocusOnDeactivate: true,
      escapeDeactivates: true
    });
  }
  
  private setupFocusIndicators() {
    // Enhanced focus indicators
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'tabindex') {
          const element = mutation.target as HTMLElement;
          if (element.tabIndex === 0) {
            element.classList.add('focusable');
          } else {
            element.classList.remove('focusable');
          }
        }
      });
    });
    
    observer.observe(this.gridElement.nativeElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['tabindex']
    });
  }
  
  activateFocusTrap() {
    this.focusTrap?.activate();
  }
  
  deactivateFocusTrap() {
    this.focusTrap?.deactivate();
  }
}
```

## Reduced Motion Support

### Respecting User Preferences

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .ng-ui-lib * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .ng-ui-lib .loading-spinner {
    animation: none !important;
  }
  
  .ng-ui-lib .scroll-indicator {
    display: none;
  }
}

/* Alternative indicators for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ng-ui-lib .sorting-indicator {
    /* Use static icons instead of animations */
    transition: none;
  }
  
  .ng-ui-lib .row-highlight {
    /* Use solid colors instead of fade effects */
    background: var(--ng-ui-lib-primary-light);
  }
}
```

## Color and Vision Accessibility

### Color-blind Friendly Design

```typescript
@Component({
  selector: 'app-colorblind-friendly-grid'
})
export class ColorblindFriendlyGridComponent {
  columns: ColumnDefinition[] = [
    {
      id: 'status',
      field: 'status',
      header: 'Status',
      cellRenderer: this.getStatusRenderer(),
      // Don't rely on color alone
      screenReaderDescription: 'Status with icon and text indicators'
    }
  ];
  
  private getStatusRenderer(): string {
    return `
      <span class="status-indicator status-{{value}}" 
            role="img" 
            aria-label="{{getStatusAriaLabel(value)}}">
        {{getStatusIcon(value)}}
        <span class="status-text">{{value | titlecase}}</span>
      </span>
    `;
  }
  
  getStatusIcon(status: string): string {
    const icons = {
      active: '✓',      // Checkmark for active
      inactive: '✗',    // X for inactive
      pending: '⏳',     // Clock for pending
      error: '⚠️'       // Warning for error
    };
    return icons[status as keyof typeof icons] || '●';
  }
  
  getStatusAriaLabel(status: string): string {
    const labels = {
      active: 'Active status',
      inactive: 'Inactive status',
      pending: 'Pending status',
      error: 'Error status'
    };
    return labels[status as keyof typeof labels] || status;
  }
}
```

### Pattern and Texture Support

```css
/* Use patterns and textures in addition to colors */
.ng-ui-lib .priority-high {
  background: repeating-linear-gradient(
    45deg,
    var(--ng-ui-lib-danger),
    var(--ng-ui-lib-danger) 2px,
    transparent 2px,
    transparent 6px
  );
  border-left: 4px solid var(--ng-ui-lib-danger);
}

.ng-ui-lib .priority-medium {
  background: repeating-linear-gradient(
    90deg,
    var(--ng-ui-lib-warning),
    var(--ng-ui-lib-warning) 1px,
    transparent 1px,
    transparent 4px
  );
  border-left: 4px solid var(--ng-ui-lib-warning);
}

.ng-ui-lib .priority-low {
  background: dots 2px var(--ng-ui-lib-info);
  border-left: 4px solid var(--ng-ui-lib-info);
}
```

## Testing Accessibility

### Automated Testing Setup

```typescript
import { TestBed } from '@angular/core/testing';
import { axe, toHaveNoViolations } from 'jest-axe';

describe('Grid Accessibility', () => {
  beforeEach(() => {
    expect.extend(toHaveNoViolations);
  });

  it('should have no accessibility violations', async () => {
    const fixture = TestBed.createComponent(AccessibleGridComponent);
    fixture.detectChanges();
    
    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA attributes', () => {
    const fixture = TestBed.createComponent(AccessibleGridComponent);
    fixture.detectChanges();
    
    const gridElement = fixture.nativeElement.querySelector('.ng-ui-lib');
    expect(gridElement.getAttribute('role')).toBe('grid');
    expect(gridElement.getAttribute('aria-label')).toBeTruthy();
    expect(gridElement.getAttribute('aria-rowcount')).toBeTruthy();
    expect(gridElement.getAttribute('aria-colcount')).toBeTruthy();
  });

  it('should support keyboard navigation', () => {
    const fixture = TestBed.createComponent(AccessibleGridComponent);
    fixture.detectChanges();
    
    const gridElement = fixture.nativeElement.querySelector('.ng-ui-lib');
    
    // Test tab navigation
    gridElement.focus();
    expect(document.activeElement).toBe(gridElement);
    
    // Test arrow key navigation
    const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    gridElement.dispatchEvent(arrowDownEvent);
    
    // Verify focus moved
    const focusedCell = fixture.nativeElement.querySelector('[tabindex="0"]');
    expect(focusedCell).toBeTruthy();
  });
});
```

### Manual Testing Checklist

```typescript
interface AccessibilityChecklist {
  // Keyboard Navigation
  keyboardNavigation: {
    tabNavigation: boolean;      // Can navigate with Tab/Shift+Tab
    arrowNavigation: boolean;    // Can navigate with arrow keys
    enterActivation: boolean;    // Enter activates buttons/links
    escapeWorks: boolean;        // Escape cancels operations
    spaceSelects: boolean;       // Space selects rows
    homeEndWorks: boolean;       // Home/End navigation works
  };
  
  // Screen Reader
  screenReader: {
    gridRolePresent: boolean;    // Grid has role="grid"
    headersClear: boolean;       // Column headers are clear
    sortStateAnnounced: boolean; // Sort state is announced
    selectionAnnounced: boolean; // Selection changes announced
    errorsAnnounced: boolean;    // Error states announced
    liveRegionsWork: boolean;    // Live regions update properly
  };
  
  // Visual
  visual: {
    focusVisible: boolean;       // Focus indicators visible
    highContrastWorks: boolean;  // Works in high contrast mode
    colorNotAlone: boolean;      // Don't rely on color alone
    textReadable: boolean;       // Text meets contrast requirements
    touchTargets: boolean;       // Touch targets are large enough
  };
  
  // Motor
  motor: {
    largeTargets: boolean;       // Click targets are 44px minimum
    noHover: boolean;            // All functionality works without hover
    noTimedActions: boolean;     // No timed actions required
    dragAlternatives: boolean;   // Drag operations have alternatives
  };
}

// Usage in testing
const checkAccessibility = (): AccessibilityChecklist => {
  return {
    keyboardNavigation: {
      tabNavigation: testTabNavigation(),
      arrowNavigation: testArrowNavigation(),
      enterActivation: testEnterActivation(),
      escapeWorks: testEscapeKey(),
      spaceSelects: testSpaceKey(),
      homeEndWorks: testHomeEndKeys()
    },
    // ... other categories
  };
};
```

## Best Practices Summary

### Accessibility Guidelines

1. **Always provide meaningful labels**: Use aria-label, aria-labelledby, and aria-describedby
2. **Implement full keyboard support**: All mouse interactions should have keyboard alternatives
3. **Use semantic HTML**: Proper roles, headings, and structure
4. **Provide context**: Screen readers need context for understanding data relationships
5. **Test with real users**: Include users with disabilities in your testing process
6. **Follow WCAG guidelines**: Aim for WCAG 2.1 AA compliance minimum
7. **Consider all disabilities**: Visual, auditory, motor, and cognitive impairments
8. **Progressive enhancement**: Ensure core functionality works without JavaScript

### Common Pitfalls to Avoid

```typescript
// ❌ Bad - relies on color alone
cellRenderer: '<span style="color: red">{{value}}</span>'

// ✅ Good - uses color, icon, and text
cellRenderer: '<span class="status-error" role="img" aria-label="Error status">❌ {{value}}</span>'

// ❌ Bad - no keyboard support
cellRenderer: '<button onclick="doSomething({{id}})">Action</button>'

// ✅ Good - keyboard accessible
cellRenderer: '<button onclick="doSomething({{id}})" onkeydown="handleKeydown(event, {{id}})">Action</button>'

// ❌ Bad - no screen reader context
header: 'Status'

// ✅ Good - descriptive header
header: 'Employment Status',
ariaLabel: 'Current employment status, sortable column'
```

## Next Steps

1. **[Testing](./testing.md)** - Comprehensive testing strategies including accessibility testing
2. **[Internationalization](./internationalization.md)** - Multi-language support
3. **[Browser Compatibility](../recipes/browser-compatibility.md)** - Ensure accessibility across browsers
4. **[User Testing](../recipes/user-testing.md)** - Testing with users who have disabilities