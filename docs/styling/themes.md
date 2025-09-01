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
  --blg-grid-primary-color: #007bff;
  --blg-grid-primary-hover: #0056b3;
  --blg-grid-primary-light: #e3f2fd;
  
  /* Background colors */
  --blg-grid-bg-primary: #ffffff;
  --blg-grid-bg-secondary: #f8f9fa;
  --blg-grid-bg-tertiary: #e9ecef;
  
  /* Text colors */
  --blg-grid-text-primary: #212529;
  --blg-grid-text-secondary: #6c757d;
  --blg-grid-text-muted: #adb5bd;
  
  /* Border colors */
  --blg-grid-border-color: #dee2e6;
  --blg-grid-border-light: #e9ecef;
  --blg-grid-border-dark: #adb5bd;
  
  /* State colors */
  --blg-grid-success: #28a745;
  --blg-grid-warning: #ffc107;
  --blg-grid-danger: #dc3545;
  --blg-grid-info: #17a2b8;
}
```

### Sizing Variables

```css
:root {
  /* Spacing */
  --blg-grid-spacing-xs: 4px;
  --blg-grid-spacing-sm: 8px;
  --blg-grid-spacing-md: 12px;
  --blg-grid-spacing-lg: 16px;
  --blg-grid-spacing-xl: 24px;
  
  /* Font sizes */
  --blg-grid-font-size-xs: 11px;
  --blg-grid-font-size-sm: 12px;
  --blg-grid-font-size-base: 14px;
  --blg-grid-font-size-lg: 16px;
  
  /* Row heights */
  --blg-grid-row-height: 40px;
  --blg-grid-row-height-sm: 32px;
  --blg-grid-row-height-lg: 48px;
  
  /* Border radius */
  --blg-grid-border-radius: 4px;
  --blg-grid-border-radius-lg: 8px;
  
  /* Shadows */
  --blg-grid-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --blg-grid-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --blg-grid-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
}
```

## Creating Custom Themes

### Method 1: CSS Variable Override

Create a custom theme by overriding CSS variables:

```css
/* custom-theme.css */
.blg-grid.theme-corporate {
  /* Corporate brand colors */
  --blg-grid-primary-color: #2c5aa0;
  --blg-grid-primary-hover: #1a4480;
  --blg-grid-primary-light: #e8f0ff;
  
  /* Background colors */
  --blg-grid-bg-primary: #ffffff;
  --blg-grid-bg-secondary: #f5f7fa;
  --blg-grid-bg-tertiary: #eef2f7;
  
  /* Text colors */
  --blg-grid-text-primary: #1a365d;
  --blg-grid-text-secondary: #4a5568;
  
  /* Borders */
  --blg-grid-border-color: #cbd5e0;
  
  /* Custom spacing for corporate look */
  --blg-grid-row-height: 44px;
  --blg-grid-spacing-md: 16px;
  
  /* Typography */
  --blg-grid-font-size-base: 13px;
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
  
  .blg-grid.theme-#{$theme-name} {
    --blg-grid-primary-color: #{map-get($theme, primary)};
    --blg-grid-primary-hover: #{map-get($theme, primary-hover)};
    --blg-grid-primary-light: #{map-get($theme, primary-light)};
    --blg-grid-bg-primary: #{map-get($theme, bg-primary)};
    --blg-grid-bg-secondary: #{map-get($theme, bg-secondary)};
    --blg-grid-text-primary: #{map-get($theme, text-primary)};
    --blg-grid-text-secondary: #{map-get($theme, text-secondary)};
    --blg-grid-border-color: #{map-get($theme, border-color)};
    --blg-grid-success: #{map-get($theme, success)};
    --blg-grid-warning: #{map-get($theme, warning)};
    --blg-grid-danger: #{map-get($theme, danger)};
    --blg-grid-font-size-base: #{map-get($theme, font-size-base)};
    --blg-grid-row-height: #{map-get($theme, row-height)};
    --blg-grid-border-radius: #{map-get($theme, border-radius)};
    
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
.blg-grid .grid-header {
  background: var(--blg-grid-bg-secondary);
  border-bottom: 2px solid var(--blg-grid-primary-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.blg-grid .grid-header-cell {
  padding: var(--blg-grid-spacing-md) var(--blg-grid-spacing-lg);
  position: relative;
}

.blg-grid .grid-header-cell:hover {
  background: var(--blg-grid-bg-tertiary);
}

/* Sort indicators */
.blg-grid .sort-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--blg-grid-primary-color);
  font-size: 12px;
}

.blg-grid .sort-indicator.asc::before {
  content: '▲';
}

.blg-grid .sort-indicator.desc::before {
  content: '▼';
}
```

### Row Customization

```css
.blg-grid .grid-row {
  border-bottom: 1px solid var(--blg-grid-border-light);
  transition: background-color 0.15s ease;
}

.blg-grid .grid-row:hover {
  background: var(--blg-grid-bg-secondary);
}

.blg-grid .grid-row:nth-child(even) {
  background: rgba(0, 0, 0, 0.02);
}

.blg-grid .grid-row.selected {
  background: var(--blg-grid-primary-light);
  border-color: var(--blg-grid-primary-color);
}

.blg-grid .grid-row.focused {
  outline: 2px solid var(--blg-grid-primary-color);
  outline-offset: -2px;
}
```

### Cell Customization

```css
.blg-grid .grid-cell {
  padding: var(--blg-grid-spacing-sm) var(--blg-grid-spacing-md);
  border-right: 1px solid var(--blg-grid-border-light);
  vertical-align: middle;
}

.blg-grid .grid-cell.align-right {
  text-align: right;
}

.blg-grid .grid-cell.align-center {
  text-align: center;
}

/* Cell editing */
.blg-grid .grid-cell.editing {
  padding: 0;
  background: var(--blg-grid-bg-primary);
}

.blg-grid .cell-editor {
  width: 100%;
  height: 100%;
  padding: var(--blg-grid-spacing-sm) var(--blg-grid-spacing-md);
  border: 2px solid var(--blg-grid-primary-color);
  outline: none;
  font-size: var(--blg-grid-font-size-base);
}
```

## Dark Theme Implementation

### Complete Dark Theme

```css
.blg-grid.theme-dark {
  --blg-grid-primary-color: #4fd1c7;
  --blg-grid-primary-hover: #38b2ac;
  --blg-grid-primary-light: rgba(79, 209, 199, 0.1);
  
  --blg-grid-bg-primary: #1a202c;
  --blg-grid-bg-secondary: #2d3748;
  --blg-grid-bg-tertiary: #4a5568;
  
  --blg-grid-text-primary: #f7fafc;
  --blg-grid-text-secondary: #e2e8f0;
  --blg-grid-text-muted: #a0aec0;
  
  --blg-grid-border-color: #4a5568;
  --blg-grid-border-light: #2d3748;
  --blg-grid-border-dark: #718096;
  
  --blg-grid-success: #48bb78;
  --blg-grid-warning: #ed8936;
  --blg-grid-danger: #f56565;
  --blg-grid-info: #4299e1;
  
  /* Dark theme specific shadows */
  --blg-grid-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --blg-grid-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --blg-grid-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
}

.blg-grid.theme-dark .grid-container {
  background: var(--blg-grid-bg-primary);
  color: var(--blg-grid-text-primary);
  box-shadow: var(--blg-grid-shadow-lg);
}

.blg-grid.theme-dark .grid-header {
  background: var(--blg-grid-bg-secondary);
  border-bottom: 1px solid var(--blg-grid-border-color);
}

.blg-grid.theme-dark .grid-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.blg-grid.theme-dark .grid-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.blg-grid.theme-dark .grid-row.selected {
  background: var(--blg-grid-primary-light);
  color: var(--blg-grid-primary-color);
}
```

## Responsive Theming

### Breakpoint-Aware Themes

```css
/* Base theme */
.blg-grid {
  --blg-grid-row-height: 40px;
  --blg-grid-font-size-base: 14px;
}

/* Tablet adjustments */
@media (max-width: 768px) {
  .blg-grid {
    --blg-grid-row-height: 36px;
    --blg-grid-font-size-base: 13px;
    --blg-grid-spacing-md: 8px;
  }
  
  .blg-grid .grid-header-cell,
  .blg-grid .grid-cell {
    padding: var(--blg-grid-spacing-sm);
  }
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .blg-grid {
    --blg-grid-row-height: 32px;
    --blg-grid-font-size-base: 12px;
    --blg-grid-spacing-sm: 4px;
    --blg-grid-spacing-md: 6px;
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
    localStorage.setItem('blg-grid-theme', theme);
  }
  
  initializeTheme() {
    const savedTheme = localStorage.getItem('blg-grid-theme') as ThemeName;
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

    <blg-grid 
      [data]="data"
      [columns]="columns"
      [config]="gridConfig">
    </blg-grid>
  `,
  styles: [`
    .theme-controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    .theme-controls button {
      padding: 8px 16px;
      border: 1px solid var(--blg-grid-border-color);
      background: var(--blg-grid-bg-primary);
      color: var(--blg-grid-text-primary);
      border-radius: var(--blg-grid-border-radius);
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-controls button:hover {
      background: var(--blg-grid-bg-secondary);
    }

    .theme-controls button.active {
      background: var(--blg-grid-primary-color);
      color: white;
      border-color: var(--blg-grid-primary-color);
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
.blg-grid .status-active {
  color: var(--blg-grid-success);
  font-weight: 600;
}

.blg-grid .status-active::before {
  content: '●';
  margin-right: 6px;
}

.blg-grid .status-inactive {
  color: var(--blg-grid-text-muted);
}

.blg-grid .status-inactive::before {
  content: '○';
  margin-right: 6px;
}

.blg-grid .status-pending {
  color: var(--blg-grid-warning);
}

.blg-grid .status-pending::before {
  content: '⏳';
  margin-right: 6px;
}

/* Priority indicators */
.blg-grid .priority-high {
  background: linear-gradient(90deg, var(--blg-grid-danger) 3px, transparent 3px);
  border-left: 3px solid var(--blg-grid-danger);
}

.blg-grid .priority-medium {
  background: linear-gradient(90deg, var(--blg-grid-warning) 3px, transparent 3px);
  border-left: 3px solid var(--blg-grid-warning);
}

.blg-grid .priority-low {
  background: linear-gradient(90deg, var(--blg-grid-info) 3px, transparent 3px);
  border-left: 3px solid var(--blg-grid-info);
}
```

## Animation and Transitions

### Smooth Transitions

```css
.blg-grid {
  /* Base transitions */
  --blg-grid-transition-fast: 0.15s ease;
  --blg-grid-transition-normal: 0.3s ease;
  --blg-grid-transition-slow: 0.5s ease;
}

.blg-grid .grid-row {
  transition: 
    background-color var(--blg-grid-transition-fast),
    border-color var(--blg-grid-transition-fast),
    transform var(--blg-grid-transition-fast);
}

.blg-grid .grid-cell {
  transition: all var(--blg-grid-transition-fast);
}

/* Loading animations */
.blg-grid .loading-row {
  background: linear-gradient(
    90deg,
    var(--blg-grid-bg-secondary) 25%,
    var(--blg-grid-bg-tertiary) 50%,
    var(--blg-grid-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Selection animations */
.blg-grid .grid-row.selected {
  animation: select-flash 0.3s ease;
}

@keyframes select-flash {
  0% { background: var(--blg-grid-primary-color); }
  100% { background: var(--blg-grid-primary-light); }
}
```

## Print Styles

### Print-Optimized Theme

```css
@media print {
  .blg-grid {
    /* Print-specific colors */
    --blg-grid-bg-primary: white;
    --blg-grid-bg-secondary: white;
    --blg-grid-text-primary: black;
    --blg-grid-border-color: #333;
    
    /* Remove shadows and effects */
    --blg-grid-shadow-sm: none;
    --blg-grid-shadow-md: none;
    --blg-grid-shadow-lg: none;
  }
  
  .blg-grid .grid-container {
    box-shadow: none !important;
    border: 1px solid #333;
  }
  
  .blg-grid .grid-header {
    background: #f0f0f0 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .blg-grid .grid-row:hover {
    background: transparent !important;
  }
  
  /* Hide interactive elements */
  .blg-grid .resize-handle,
  .blg-grid .sort-indicator,
  .blg-grid .filter-input {
    display: none !important;
  }
}
```

## Performance Considerations

### Optimized CSS for Large Grids

```css
.blg-grid.performance-mode {
  /* Disable expensive effects for large datasets */
  --blg-grid-transition-fast: 0s;
  --blg-grid-shadow-sm: none;
  --blg-grid-shadow-md: none;
}

.blg-grid.performance-mode .grid-row {
  transition: none;
}

.blg-grid.performance-mode .grid-row:nth-child(even) {
  background: none; /* Disable zebra striping for performance */
}

.blg-grid.performance-mode .grid-row:hover {
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