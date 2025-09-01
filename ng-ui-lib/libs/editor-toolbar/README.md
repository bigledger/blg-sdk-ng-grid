# @ng-ui/editor-toolbar

A comprehensive and customizable toolbar system for Angular applications. Built with Angular 20+ Signals and designed for modern web development.

## Features

### 🎯 Core Features
- **Multiple Toolbar Modes**: Fixed, floating/bubble, sticky, inline, and mobile-responsive
- **Rich Components**: Buttons, dropdowns, color picker, font selector, size selector
- **Signal-Based Architecture**: Built with Angular Signals for optimal performance
- **Fully Customizable**: JSON-based configuration system
- **Accessibility First**: WCAG 2.1 AA compliant with keyboard navigation
- **Theme Support**: Dark/light themes with custom theming capabilities
- **Mobile Optimized**: Touch-friendly controls and responsive design

### 🛠️ Component Library
- **Main Toolbar**: Orchestrates all toolbar functionality
- **Button Component**: Handles various button types and states  
- **Dropdown Component**: Supports grouped options and search
- **Color Picker**: Predefined palettes and custom color input
- **Font Selector**: Font family selection with previews
- **Size Selector**: Font size selection with units

### 📱 Toolbar Modes
- **Fixed**: Toolbar fixed at top of viewport
- **Floating**: Bubble toolbar that appears on text selection
- **Sticky**: Toolbar that follows scroll position
- **Inline**: Toolbar embedded within content
- **Mobile**: Optimized for mobile devices with touch controls

## Installation

```bash
npm install @ng-ui/editor-toolbar
```

## Basic Usage

### Import the Library

```typescript
import { 
  ToolbarComponent,
  ToolbarStateService,
  TOOLBAR_CONFIGS 
} from '@ng-ui/editor-toolbar';
```

### Simple Toolbar Setup

```typescript
import { Component, signal } from '@angular/core';
import { ToolbarComponent, TOOLBAR_CONFIGS } from '@ng-ui/editor-toolbar';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ToolbarComponent],
  template: `
    <blg-toolbar 
      [config]="toolbarConfig()"
      [visible]="true"
      (buttonClick)="onButtonClick($event)"
      (colorPick)="onColorPick($event)"
    />
    <div class="editor-content">
      <!-- Your editor content -->
    </div>
  `
})
export class EditorComponent {
  toolbarConfig = signal(TOOLBAR_CONFIGS.FULL);

  onButtonClick(event: any) {
    console.log('Button clicked:', event);
  }

  onColorPick(event: any) {
    console.log('Color picked:', event.color);
  }
}
```

## Configuration

### Toolbar Configuration Interface

```typescript
interface ToolbarConfig {
  mode: 'fixed' | 'floating' | 'sticky' | 'inline' | 'mobile';
  theme?: ToolbarTheme;
  sections: ToolbarSection[];
  breakpoints?: ToolbarBreakpoints;
  visible?: boolean;
  cssClasses?: string[];
  keyboardNavigation?: boolean;
  touchFriendly?: boolean;
  animations?: ToolbarAnimations;
}
```

### Custom Toolbar Configuration

```typescript
const customConfig: ToolbarConfig = {
  mode: 'fixed',
  keyboardNavigation: true,
  touchFriendly: true,
  sections: [
    {
      id: 'formatting',
      title: 'Text Formatting',
      buttons: [
        {
          id: 'bold',
          type: 'toggle',
          icon: 'format_bold',
          tooltip: 'Bold (Ctrl+B)',
          action: 'bold',
          shortcut: 'Ctrl+B'
        },
        {
          id: 'italic',
          type: 'toggle',
          icon: 'format_italic', 
          tooltip: 'Italic (Ctrl+I)',
          action: 'italic',
          shortcut: 'Ctrl+I'
        },
        {
          id: 'font-color',
          type: 'color-picker',
          icon: 'format_color_text',
          tooltip: 'Text Color',
          properties: { 
            palette: ['#000000', '#ff0000', '#00ff00', '#0000ff'] 
          }
        }
      ],
      separator: true
    }
  ]
};
```

## Component Types

### Button Types
- **button**: Simple click button
- **toggle**: Toggle button with active/inactive states
- **dropdown**: Dropdown with selectable options
- **color-picker**: Color selection component
- **font-selector**: Font family selector
- **size-selector**: Font size selector
- **separator**: Visual separator
- **group**: Button group container

### Button Configuration

```typescript
interface ToolbarButton {
  id: string;
  type: ToolbarButtonType;
  icon?: string;
  label?: string;
  tooltip?: string;
  action?: string | (() => void);
  visible?: boolean;
  enabled?: boolean;
  active?: boolean;
  options?: ToolbarButtonOption[];
  properties?: Record<string, any>;
  shortcut?: string;
}
```

## Advanced Features

### State Management with Signals

```typescript
import { ToolbarStateService } from '@ng-ui/editor-toolbar';

export class EditorComponent {
  private toolbarState = inject(ToolbarStateService);

  // React to state changes
  readonly activeButtons = this.toolbarState.activeButtons;
  readonly currentMode = this.toolbarState.currentMode;

  toggleBold() {
    this.toolbarState.toggleButton('bold');
  }

  setMode(mode: 'fixed' | 'floating') {
    this.toolbarState.setMode(mode);
  }
}
```

### Custom Themes

```typescript
const darkTheme: ToolbarTheme = {
  primary: '#2196f3',
  background: '#2d2d2d', 
  textColor: '#ffffff',
  borderColor: '#404040',
  hoverColor: '#3d3d3d',
  activeColor: '#1976d2',
  shadow: '0 2px 8px rgba(0,0,0,0.3)'
};

const toolbarConfig = {
  ...TOOLBAR_CONFIGS.FULL,
  theme: darkTheme
};
```

### Responsive Configuration

```typescript
const responsiveConfig = {
  ...TOOLBAR_CONFIGS.FULL,
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  sections: [
    {
      id: 'main',
      buttons: [...],
      responsive: {
        hideOnMobile: false,
        collapseOnMobile: true,
        mobilePriority: 1
      }
    }
  ]
};
```

## Event Handling

### Available Events

```typescript
// Button interactions
(buttonClick)="onButtonClick($event)"
(buttonToggle)="onButtonToggle($event)" 
(dropdownSelect)="onDropdownSelect($event)"

// Specialized component events
(colorPick)="onColorPick($event)"
(fontSelect)="onFontSelect($event)"
(sizeSelect)="onSizeSelect($event)"

// State changes
(modeChange)="onModeChange($event)"
(stateChange)="onStateChange($event)"
```

### Event Handler Examples

```typescript
onButtonClick(event: ToolbarButtonEvent) {
  console.log('Button:', event.button.id);
  console.log('Action:', event.action);
  
  // Handle different actions
  switch(event.button.action) {
    case 'bold':
      this.applyBold();
      break;
    case 'insertLink':
      this.showLinkDialog();
      break;
  }
}

onColorPick(event: ToolbarColorEvent) {
  console.log('Selected color:', event.color);
  console.log('Format:', event.format);
  this.applyTextColor(event.color);
}
```

## Styling and CSS Variables

The toolbar uses CSS variables for easy theming:

```css
.blg-toolbar {
  --toolbar-background: #ffffff;
  --toolbar-text-color: #333333;
  --toolbar-border-color: #e0e0e0;
  --toolbar-hover-color: #f5f5f5;
  --toolbar-active-color: #e3f2fd;
  --toolbar-disabled-color: #bdbdbd;
  --toolbar-shadow: 0 2px 4px rgba(0,0,0,0.12);
  --toolbar-border-radius: 4px;
  --toolbar-icon-size: 20px;
}
```

### Custom CSS Classes

```css
.my-custom-toolbar {
  --toolbar-background: #f8f9fa;
  --toolbar-border-color: #dee2e6;
}

.toolbar-button-large {
  min-height: 48px;
  font-size: 16px;
}
```

## Accessibility

The toolbar is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support with arrow keys
- **Screen Reader Support**: ARIA labels and roles
- **High Contrast**: Compatible with high contrast themes
- **Focus Management**: Proper focus handling and visual indicators
- **Touch Targets**: 44px minimum touch target size

### Keyboard Shortcuts

- **Tab**: Navigate between toolbar sections
- **Arrow Keys**: Navigate within sections
- **Enter/Space**: Activate buttons
- **Escape**: Close dropdowns/dialogs
- **Custom shortcuts**: As defined in button configuration

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## API Reference

### Main Components

- `ToolbarComponent` - Main toolbar container
- `ToolbarButtonComponent` - Individual toolbar button
- `ToolbarDropdownComponent` - Dropdown selector
- `ToolbarColorPickerComponent` - Color picker
- `ToolbarFontSelectorComponent` - Font selector  
- `ToolbarSizeSelectorComponent` - Size selector

### Services

- `ToolbarStateService` - Central state management

### Types

- `ToolbarConfig` - Main configuration interface
- `ToolbarButton` - Button configuration
- `ToolbarSection` - Section configuration
- `ToolbarEvents` - Event type definitions

## Examples

Check out the included demo application for comprehensive examples of:

- Different toolbar modes
- Custom configurations
- Event handling
- Theming
- Responsive behavior
- Integration patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- [GitHub Issues](https://github.com/blg/editor-toolbar/issues)
- [Documentation](https://github.com/blg/editor-toolbar/wiki)
- [Examples](https://github.com/blg/editor-toolbar/tree/main/examples)