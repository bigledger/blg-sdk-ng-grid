# Themes and Styling Guide

The BLG Grid provides a comprehensive theming system that allows you to customize the appearance of your grids to match your application's design system.

## Built-in Themes

### Default Theme
The default theme provides a clean, modern appearance suitable for most applications.

```typescript
const config: GridConfig = {
  theme: 'default' // or omit for default
};
```

### Available Built-in Themes

```typescript
// Modern light theme
const lightConfig: GridConfig = {
  theme: 'light'
};

// Dark theme
const darkConfig: GridConfig = {
  theme: 'dark'
};

// Compact theme (smaller padding, tighter spacing)
const compactConfig: GridConfig = {
  theme: 'compact'
};

// Material Design theme
const materialConfig: GridConfig = {
  theme: 'material'
};

// Bootstrap-compatible theme
const bootstrapConfig: GridConfig = {
  theme: 'bootstrap'
};
```

## CSS Custom Properties (CSS Variables)

The grid uses CSS custom properties for easy theming. You can override these variables to customize the appearance.

### Core Color Variables

```css
:root {
  /* Primary colors */
  --ng-ui-lib-primary-color: #007bff;
  --ng-ui-lib-primary-hover: #0056b3;
  --ng-ui-lib-primary-light: #e3f2fd;
  
  /* Background colors */
  --ng-ui-lib-bg-primary: #ffffff;
  --ng-ui-lib-bg-secondary: #f8f9fa;
  --ng-ui-lib-bg-tertiary: #e9ecef;
  
  /* Text colors */
  --ng-ui-lib-text-primary: #212529;
  --ng-ui-lib-text-secondary: #6c757d;
  --ng-ui-lib-text-muted: #adb5bd;
  
  /* Border colors */
  --ng-ui-lib-border-color: #dee2e6;
  --ng-ui-lib-border-light: #e9ecef;
  --ng-ui-lib-border-dark: #adb5bd;
  
  /* State colors */
  --ng-ui-lib-success: #28a745;
  --ng-ui-lib-warning: #ffc107;
  --ng-ui-lib-danger: #dc3545;
  --ng-ui-lib-info: #17a2b8;
}
```

### Sizing Variables

```css
:root {
  /* Spacing */
  --ng-ui-lib-spacing-xs: 4px;
  --ng-ui-lib-spacing-sm: 8px;
  --ng-ui-lib-spacing-md: 12px;
  --ng-ui-lib-spacing-lg: 16px;
  --ng-ui-lib-spacing-xl: 24px;
  
  /* Font sizes */
  --ng-ui-lib-font-size-xs: 11px;
  --ng-ui-lib-font-size-sm: 12px;
  --ng-ui-lib-font-size-base: 14px;
  --ng-ui-lib-font-size-lg: 16px;
  
  /* Row heights */
  --ng-ui-lib-row-height: 40px;
  --ng-ui-lib-row-height-sm: 32px;
  --ng-ui-lib-row-height-lg: 48px;
  
  /* Border radius */
  --ng-ui-lib-border-radius: 4px;
  --ng-ui-lib-border-radius-lg: 8px;
  
  /* Shadows */
  --ng-ui-lib-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --ng-ui-lib-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --ng-ui-lib-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
}
```

## Creating Custom Themes

### Method 1: CSS Variable Override

Create a custom theme by overriding CSS variables:

```css
/* custom-theme.css */
.ng-ui-lib.theme-corporate {
  /* Corporate brand colors */
  --ng-ui-lib-primary-color: #2c5aa0;
  --ng-ui-lib-primary-hover: #1a4480;
  --ng-ui-lib-primary-light: #e8f0ff;
  
  /* Background colors */
  --ng-ui-lib-bg-primary: #ffffff;
  --ng-ui-lib-bg-secondary: #f5f7fa;
  --ng-ui-lib-bg-tertiary: #eef2f7;
  
  /* Text colors */
  --ng-ui-lib-text-primary: #1a365d;
  --ng-ui-lib-text-secondary: #4a5568;
  
  /* Borders */
  --ng-ui-lib-border-color: #cbd5e0;
  
  /* Custom spacing for corporate look */
  --ng-ui-lib-row-height: 44px;
  --ng-ui-lib-spacing-md: 16px;
  
  /* Typography */
  --ng-ui-lib-font-size-base: 13px;
  font-family: 'Roboto', sans-serif;
}
```

```typescript
// Apply the custom theme
const config: GridConfig = {
  theme: 'corporate'
};
```

### Method 2: SCSS Theme System

Create a comprehensive SCSS theme system:

```scss
// _theme-variables.scss
$themes: (
  'corporate': (
    primary: #2c5aa0,
    primary-hover: #1a4480,
    primary-light: #e8f0ff,
    bg-primary: #ffffff,
    bg-secondary: #f5f7fa,
    text-primary: #1a365d,
    text-secondary: #4a5568,
    border-color: #cbd5e0,
    success: #48bb78,
    warning: #ed8936,
    danger: #f56565,
    font-family: ('Roboto', sans-serif),
    font-size-base: 13px,
    row-height: 44px,
    border-radius: 6px
  ),
  'dark': (
    primary: #4fd1c7,
    primary-hover: #38b2ac,
    primary-light: #234e52,
    bg-primary: #1a202c,
    bg-secondary: #2d3748,
    bg-tertiary: #4a5568,
    text-primary: #f7fafc,
    text-secondary: #e2e8f0,
    text-muted: #a0aec0,
    border-color: #4a5568,
    success: #48bb78,
    warning: #ed8936,
    danger: #f56565,
    font-family: ('Inter', sans-serif),
    font-size-base: 14px,
    row-height: 40px,
    border-radius: 4px
  )
);

// Theme mixin
@mixin apply-theme($theme-name) {
  $theme: map-get($themes, $theme-name);
  
  .ng-ui-lib.theme-#{$theme-name} {
    --ng-ui-lib-primary-color: #{map-get($theme, primary)};
    --ng-ui-lib-primary-hover: #{map-get($theme, primary-hover)};
    --ng-ui-lib-primary-light: #{map-get($theme, primary-light)};
    --ng-ui-lib-bg-primary: #{map-get($theme, bg-primary)};
    --ng-ui-lib-bg-secondary: #{map-get($theme, bg-secondary)};
    --ng-ui-lib-text-primary: #{map-get($theme, text-primary)};
    --ng-ui-lib-text-secondary: #{map-get($theme, text-secondary)};
    --ng-ui-lib-border-color: #{map-get($theme, border-color)};
    --ng-ui-lib-success: #{map-get($theme, success)};
    --ng-ui-lib-warning: #{map-get($theme, warning)};
    --ng-ui-lib-danger: #{map-get($theme, danger)};
    --ng-ui-lib-font-size-base: #{map-get($theme, font-size-base)};
    --ng-ui-lib-row-height: #{map-get($theme, row-height)};
    --ng-ui-lib-border-radius: #{map-get($theme, border-radius)};
    
    font-family: #{map-get($theme, font-family)};
  }
}

// Generate theme classes
@each $theme-name, $theme in $themes {
  @include apply-theme($theme-name);
}
```

## Component-Specific Styling

### Header Customization

```css
.ng-ui-lib .grid-header {
  background: var(--ng-ui-lib-bg-secondary);
  border-bottom: 2px solid var(--ng-ui-lib-primary-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ng-ui-lib .grid-header-cell {
  padding: var(--ng-ui-lib-spacing-md) var(--ng-ui-lib-spacing-lg);
  position: relative;
}

.ng-ui-lib .grid-header-cell:hover {
  background: var(--ng-ui-lib-bg-tertiary);
}

/* Sort indicators */
.ng-ui-lib .sort-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ng-ui-lib-primary-color);
  font-size: 12px;
}

.ng-ui-lib .sort-indicator.asc::before {
  content: '▲';
}

.ng-ui-lib .sort-indicator.desc::before {
  content: '▼';
}
```

### Row Customization

```css
.ng-ui-lib .grid-row {
  border-bottom: 1px solid var(--ng-ui-lib-border-light);
  transition: background-color 0.15s ease;
}

.ng-ui-lib .grid-row:hover {
  background: var(--ng-ui-lib-bg-secondary);
}

.ng-ui-lib .grid-row:nth-child(even) {
  background: rgba(0, 0, 0, 0.02);
}

.ng-ui-lib .grid-row.selected {
  background: var(--ng-ui-lib-primary-light);
  border-color: var(--ng-ui-lib-primary-color);
}

.ng-ui-lib .grid-row.focused {
  outline: 2px solid var(--ng-ui-lib-primary-color);
  outline-offset: -2px;
}
```

### Cell Customization

```css
.ng-ui-lib .grid-cell {
  padding: var(--ng-ui-lib-spacing-sm) var(--ng-ui-lib-spacing-md);
  border-right: 1px solid var(--ng-ui-lib-border-light);
  vertical-align: middle;
}

.ng-ui-lib .grid-cell.align-right {
  text-align: right;
}

.ng-ui-lib .grid-cell.align-center {
  text-align: center;
}

/* Cell editing */
.ng-ui-lib .grid-cell.editing {
  padding: 0;
  background: var(--ng-ui-lib-bg-primary);
}

.ng-ui-lib .cell-editor {
  width: 100%;
  height: 100%;
  padding: var(--ng-ui-lib-spacing-sm) var(--ng-ui-lib-spacing-md);
  border: 2px solid var(--ng-ui-lib-primary-color);
  outline: none;
  font-size: var(--ng-ui-lib-font-size-base);
}
```

## Dark Theme Implementation

### Complete Dark Theme

```css
.ng-ui-lib.theme-dark {
  --ng-ui-lib-primary-color: #4fd1c7;
  --ng-ui-lib-primary-hover: #38b2ac;
  --ng-ui-lib-primary-light: rgba(79, 209, 199, 0.1);
  
  --ng-ui-lib-bg-primary: #1a202c;
  --ng-ui-lib-bg-secondary: #2d3748;
  --ng-ui-lib-bg-tertiary: #4a5568;
  
  --ng-ui-lib-text-primary: #f7fafc;
  --ng-ui-lib-text-secondary: #e2e8f0;
  --ng-ui-lib-text-muted: #a0aec0;
  
  --ng-ui-lib-border-color: #4a5568;
  --ng-ui-lib-border-light: #2d3748;
  --ng-ui-lib-border-dark: #718096;
  
  --ng-ui-lib-success: #48bb78;
  --ng-ui-lib-warning: #ed8936;
  --ng-ui-lib-danger: #f56565;
  --ng-ui-lib-info: #4299e1;
  
  /* Dark theme specific shadows */
  --ng-ui-lib-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --ng-ui-lib-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --ng-ui-lib-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
}

.ng-ui-lib.theme-dark .grid-container {
  background: var(--ng-ui-lib-bg-primary);
  color: var(--ng-ui-lib-text-primary);
  box-shadow: var(--ng-ui-lib-shadow-lg);
}

.ng-ui-lib.theme-dark .grid-header {
  background: var(--ng-ui-lib-bg-secondary);
  border-bottom: 1px solid var(--ng-ui-lib-border-color);
}

.ng-ui-lib.theme-dark .grid-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.ng-ui-lib.theme-dark .grid-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.ng-ui-lib.theme-dark .grid-row.selected {
  background: var(--ng-ui-lib-primary-light);
  color: var(--ng-ui-lib-primary-color);
}
```

## Responsive Theming

### Breakpoint-Aware Themes

```css
/* Base theme */
.ng-ui-lib {
  --ng-ui-lib-row-height: 40px;
  --ng-ui-lib-font-size-base: 14px;
}

/* Tablet adjustments */
@media (max-width: 768px) {
  .ng-ui-lib {
    --ng-ui-lib-row-height: 36px;
    --ng-ui-lib-font-size-base: 13px;
    --ng-ui-lib-spacing-md: 8px;
  }
  
  .ng-ui-lib .grid-header-cell,
  .ng-ui-lib .grid-cell {
    padding: var(--ng-ui-lib-spacing-sm);
  }
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .ng-ui-lib {
    --ng-ui-lib-row-height: 32px;
    --ng-ui-lib-font-size-base: 12px;
    --ng-ui-lib-spacing-sm: 4px;
    --ng-ui-lib-spacing-md: 6px;
  }
}
```

## Advanced Theming Patterns

### Theme Service for Dynamic Switching

```typescript
import { Injectable, signal } from '@angular/core';

export type ThemeName = 'light' | 'dark' | 'corporate' | 'compact';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = signal<ThemeName>('light');
  
  readonly theme = this.currentTheme.asReadonly();
  
  setTheme(theme: ThemeName) {
    this.currentTheme.set(theme);
    this.applyThemeToDocument(theme);
    localStorage.setItem('ng-ui-lib-theme', theme);
  }
  
  initializeTheme() {
    const savedTheme = localStorage.getItem('ng-ui-lib-theme') as ThemeName;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Auto-detect system theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }
  
  private applyThemeToDocument(theme: ThemeName) {
    document.documentElement.setAttribute('data-blg-theme', theme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
  }
  
  toggleDarkMode() {
    const current = this.currentTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }
}
```

### Theme-Aware Component

```typescript
@Component({
  selector: 'app-themed-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="theme-controls">
      <button 
        *ngFor="let theme of availableThemes"
        (click)="themeService.setTheme(theme)"
        [class.active]="themeService.theme() === theme">
        {{ theme | titlecase }}
      </button>
    </div>

    <ng-ui-lib 
      [data]="data"
      [columns]="columns"
      [config]="gridConfig">
    </ng-ui-lib>
  `,
  styles: [`
    .theme-controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    .theme-controls button {
      padding: 8px 16px;
      border: 1px solid var(--ng-ui-lib-border-color);
      background: var(--ng-ui-lib-bg-primary);
      color: var(--ng-ui-lib-text-primary);
      border-radius: var(--ng-ui-lib-border-radius);
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-controls button:hover {
      background: var(--ng-ui-lib-bg-secondary);
    }

    .theme-controls button.active {
      background: var(--ng-ui-lib-primary-color);
      color: white;
      border-color: var(--ng-ui-lib-primary-color);
    }
  `]
})
export class ThemedGridComponent {
  availableThemes: ThemeName[] = ['light', 'dark', 'corporate', 'compact'];
  
  constructor(public themeService: ThemeService) {}
  
  gridConfig: GridConfig = {
    // Theme will be applied via CSS
    sortable: true,
    filterable: true,
    selectable: true
  };
}
```

## Custom Status and State Styling

### Status Indicators

```css
/* Status cell styling */
.ng-ui-lib .status-active {
  color: var(--ng-ui-lib-success);
  font-weight: 600;
}

.ng-ui-lib .status-active::before {
  content: '●';
  margin-right: 6px;
}

.ng-ui-lib .status-inactive {
  color: var(--ng-ui-lib-text-muted);
}

.ng-ui-lib .status-inactive::before {
  content: '○';
  margin-right: 6px;
}

.ng-ui-lib .status-pending {
  color: var(--ng-ui-lib-warning);
}

.ng-ui-lib .status-pending::before {
  content: '⏳';
  margin-right: 6px;
}

/* Priority indicators */
.ng-ui-lib .priority-high {
  background: linear-gradient(90deg, var(--ng-ui-lib-danger) 3px, transparent 3px);
  border-left: 3px solid var(--ng-ui-lib-danger);
}

.ng-ui-lib .priority-medium {
  background: linear-gradient(90deg, var(--ng-ui-lib-warning) 3px, transparent 3px);
  border-left: 3px solid var(--ng-ui-lib-warning);
}

.ng-ui-lib .priority-low {
  background: linear-gradient(90deg, var(--ng-ui-lib-info) 3px, transparent 3px);
  border-left: 3px solid var(--ng-ui-lib-info);
}
```

## Animation and Transitions

### Smooth Transitions

```css
.ng-ui-lib {
  /* Base transitions */
  --ng-ui-lib-transition-fast: 0.15s ease;
  --ng-ui-lib-transition-normal: 0.3s ease;
  --ng-ui-lib-transition-slow: 0.5s ease;
}

.ng-ui-lib .grid-row {
  transition: 
    background-color var(--ng-ui-lib-transition-fast),
    border-color var(--ng-ui-lib-transition-fast),
    transform var(--ng-ui-lib-transition-fast);
}

.ng-ui-lib .grid-cell {
  transition: all var(--ng-ui-lib-transition-fast);
}

/* Loading animations */
.ng-ui-lib .loading-row {
  background: linear-gradient(
    90deg,
    var(--ng-ui-lib-bg-secondary) 25%,
    var(--ng-ui-lib-bg-tertiary) 50%,
    var(--ng-ui-lib-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Selection animations */
.ng-ui-lib .grid-row.selected {
  animation: select-flash 0.3s ease;
}

@keyframes select-flash {
  0% { background: var(--ng-ui-lib-primary-color); }
  100% { background: var(--ng-ui-lib-primary-light); }
}
```

## Print Styles

### Print-Optimized Theme

```css
@media print {
  .ng-ui-lib {
    /* Print-specific colors */
    --ng-ui-lib-bg-primary: white;
    --ng-ui-lib-bg-secondary: white;
    --ng-ui-lib-text-primary: black;
    --ng-ui-lib-border-color: #333;
    
    /* Remove shadows and effects */
    --ng-ui-lib-shadow-sm: none;
    --ng-ui-lib-shadow-md: none;
    --ng-ui-lib-shadow-lg: none;
  }
  
  .ng-ui-lib .grid-container {
    box-shadow: none !important;
    border: 1px solid #333;
  }
  
  .ng-ui-lib .grid-header {
    background: #f0f0f0 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .ng-ui-lib .grid-row:hover {
    background: transparent !important;
  }
  
  /* Hide interactive elements */
  .ng-ui-lib .resize-handle,
  .ng-ui-lib .sort-indicator,
  .ng-ui-lib .filter-input {
    display: none !important;
  }
}
```

## Performance Considerations

### Optimized CSS for Large Grids

```css
.ng-ui-lib.performance-mode {
  /* Disable expensive effects for large datasets */
  --ng-ui-lib-transition-fast: 0s;
  --ng-ui-lib-shadow-sm: none;
  --ng-ui-lib-shadow-md: none;
}

.ng-ui-lib.performance-mode .grid-row {
  transition: none;
}

.ng-ui-lib.performance-mode .grid-row:nth-child(even) {
  background: none; /* Disable zebra striping for performance */
}

.ng-ui-lib.performance-mode .grid-row:hover {
  background: rgba(0, 0, 0, 0.02) !important;
}
```

## Best Practices

### 1. Use CSS Custom Properties
Always use CSS custom properties for consistent theming across components.

### 2. Follow Design System Patterns
Align your grid themes with your application's design system.

### 3. Test Accessibility
Ensure sufficient contrast ratios and keyboard navigation visibility.

### 4. Consider Performance
Disable expensive visual effects for large datasets.

### 5. Responsive Design
Make themes responsive for different screen sizes.

## Next Steps

1. **[Custom Styles](./custom-styles.md)** - Advanced styling techniques
2. **[Icons](./icons.md)** - Icon system integration  
3. **[Responsive Design](./responsive-design.md)** - Mobile-first grid styling
4. **[Performance Optimization](../advanced/performance-optimization.md)** - CSS performance tips