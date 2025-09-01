# Text Formatting Features

BLG Editor provides comprehensive rich text formatting capabilities that rival professional word processors. This guide covers all available text formatting options and how to use them effectively.

## 📋 Table of Contents

- [Basic Text Formatting](#basic-text-formatting)
- [Text Styles](#text-styles)
- [Headings & Structure](#headings--structure)
- [Lists](#lists)
- [Text Alignment](#text-alignment)
- [Typography Controls](#typography-controls)
- [Advanced Formatting](#advanced-formatting)
- [Custom Formatting](#custom-formatting)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [API Reference](#api-reference)

## ✨ Basic Text Formatting

### Bold, Italic, and Underline

The fundamental text formatting options:

```typescript
// Configuration
const config: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'basic-formatting',
        tools: ['bold', 'italic', 'underline', 'strikethrough']
      }
    ]
  }
};
```

**Available Options:**
- **Bold** (`Ctrl+B`) - Makes text bold
- **Italic** (`Ctrl+I`) - Makes text italic  
- **Underline** (`Ctrl+U`) - Underlines text
- **Strikethrough** (`Ctrl+Shift+S`) - Strikes through text

**Programmatic Usage:**
```typescript
// Apply formatting via commands
editor.executeCommand('bold');
editor.executeCommand('italic');
editor.executeCommand('underline');
editor.executeCommand('strikethrough');

// Check if formatting is active
const isBold = editor.isCommandActive('bold');
const isItalic = editor.isCommandActive('italic');
```

### Code Formatting

Format text as inline code or code blocks:

```typescript
const codeConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'code',
        tools: ['code', 'codeBlock']
      }
    ]
  }
};
```

**Features:**
- **Inline Code** (`Ctrl+`) - Formats selection as inline code
- **Code Block** (`Ctrl+Shift+`) - Creates a code block
- **Syntax Highlighting** - Optional syntax highlighting support
- **Language Selection** - Specify programming language

**Example Usage:**
```typescript
// Apply inline code formatting
editor.executeCommand('code');

// Insert code block with language
editor.executeCommand('codeBlock', { language: 'typescript' });
```

## 🎨 Text Styles

### Quote Blocks

Create elegant blockquotes for highlighting important text:

```typescript
const quoteConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'blocks',
        tools: ['blockquote', 'pullQuote']
      }
    ]
  }
};
```

**Types:**
- **Blockquote** - Standard indented quote
- **Pull Quote** - Centered, highlighted quote

**Usage:**
```typescript
// Create blockquote
editor.executeCommand('blockquote');

// Create pull quote with attribution
editor.executeCommand('pullQuote', { 
  attribution: 'Author Name' 
});
```

### Highlight and Mark

Highlight important text with background colors:

```typescript
const highlightConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'highlight',
        tools: ['highlight', 'mark']
      }
    ]
  }
};
```

**Options:**
```typescript
// Highlight with default color
editor.executeCommand('highlight');

// Highlight with custom color
editor.executeCommand('highlight', { color: '#ffeb3b' });

// Mark text (semantic highlighting)
editor.executeCommand('mark');
```

## 📄 Headings & Structure

### Heading Levels

Create document structure with headings:

```typescript
const headingConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'headings',
        label: 'Document Structure',
        tools: [
          'heading1', 'heading2', 'heading3', 
          'heading4', 'heading5', 'heading6',
          'paragraph'
        ]
      }
    ]
  }
};
```

**Keyboard Shortcuts:**
- `Ctrl+Alt+1` - Heading 1
- `Ctrl+Alt+2` - Heading 2
- `Ctrl+Alt+3` - Heading 3
- `Ctrl+Alt+0` - Paragraph

**Programmatic Usage:**
```typescript
// Apply heading levels
editor.executeCommand('heading1');
editor.executeCommand('heading2');
editor.executeCommand('paragraph');

// Check current heading level
const currentLevel = editor.getCurrentHeadingLevel();
```

### Table of Contents

Generate automatic table of contents:

```typescript
const tocConfig: EditorConfig = {
  plugins: [
    {
      name: 'table-of-contents',
      enabled: true,
      options: {
        levels: [1, 2, 3], // Include H1, H2, H3
        position: 'top',
        autoUpdate: true
      }
    }
  ]
};
```

## 📝 Lists

### Bullet and Numbered Lists

Create organized content with lists:

```typescript
const listConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'lists',
        tools: ['bulletList', 'orderedList', 'checkList']
      }
    ]
  }
};
```

**List Types:**
- **Bullet List** (`Ctrl+Shift+8`) - Unordered list
- **Numbered List** (`Ctrl+Shift+7`) - Ordered list  
- **Checklist** (`Ctrl+Shift+9`) - Interactive checkboxes

**Advanced List Features:**
```typescript
// Create nested lists
editor.executeCommand('bulletList');
editor.executeCommand('increaseIndent'); // Nest item

// Create custom list styles
editor.executeCommand('bulletList', {
  style: 'disc' | 'circle' | 'square'
});

editor.executeCommand('orderedList', {
  style: 'decimal' | 'alpha' | 'roman'
});
```

### List Management

```typescript
// List manipulation commands
editor.executeCommand('increaseIndent'); // Indent list item
editor.executeCommand('decreaseIndent'); // Outdent list item
editor.executeCommand('splitListItem');  // Split current item
editor.executeCommand('joinListItems');  // Join with previous item
```

## 📐 Text Alignment

### Horizontal Alignment

Control text alignment within the editor:

```typescript
const alignConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'alignment',
        tools: [
          'alignLeft', 'alignCenter', 
          'alignRight', 'alignJustify'
        ]
      }
    ]
  }
};
```

**Alignment Options:**
- **Left Align** (`Ctrl+Shift+L`) - Default alignment
- **Center** (`Ctrl+Shift+E`) - Center alignment
- **Right Align** (`Ctrl+Shift+R`) - Right alignment
- **Justify** (`Ctrl+Shift+J`) - Justified text

**Usage:**
```typescript
// Apply alignment
editor.executeCommand('alignCenter');
editor.executeCommand('alignRight');

// Get current alignment
const alignment = editor.getCurrentAlignment(); // 'left' | 'center' | 'right' | 'justify'
```

### Text Direction

Support for right-to-left languages:

```typescript
const directionConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'direction',
        tools: ['textDirection']
      }
    ]
  }
};

// Set text direction
editor.executeCommand('textDirection', { direction: 'rtl' });
editor.executeCommand('textDirection', { direction: 'ltr' });
```

## 🎯 Typography Controls

### Font Family

Customize font families:

```typescript
const fontConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'typography',
        tools: ['fontFamily', 'fontSize']
      }
    ]
  },
  formatting: {
    defaultFontFamily: 'system-ui, sans-serif',
    allowedFonts: [
      'Arial, sans-serif',
      'Georgia, serif',
      'Monaco, monospace',
      'system-ui, sans-serif'
    ]
  }
};
```

**Usage:**
```typescript
// Change font family
editor.executeCommand('fontFamily', { 
  family: 'Georgia, serif' 
});

// Get current font family
const currentFont = editor.getCurrentFontFamily();
```

### Font Size

Control text size:

```typescript
// Predefined sizes
const sizeConfig: EditorConfig = {
  formatting: {
    allowedFontSizes: [
      '12px', '14px', '16px', '18px', '20px', 
      '24px', '32px', '48px'
    ]
  }
};

// Apply font size
editor.executeCommand('fontSize', { size: '18px' });

// Relative size changes
editor.executeCommand('increaseFontSize');
editor.executeCommand('decreaseFontSize');
```

### Text Color

Apply colors to text and backgrounds:

```typescript
const colorConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'colors',
        tools: ['textColor', 'backgroundColor']
      }
    ]
  }
};

// Apply colors
editor.executeCommand('textColor', { color: '#ff5722' });
editor.executeCommand('backgroundColor', { color: '#fff3e0' });

// Color picker integration
editor.executeCommand('textColor', { 
  color: '#custom',
  picker: true 
});
```

## 🚀 Advanced Formatting

### Text Transformation

Transform text case and styling:

```typescript
const transformConfig: EditorConfig = {
  toolbar: {
    groups: [
      {
        id: 'transform',
        tools: [
          'uppercase', 'lowercase', 'capitalize',
          'removeFormat', 'clearFormatting'
        ]
      }
    ]
  }
};

// Text transformations
editor.executeCommand('uppercase');    // UPPER CASE
editor.executeCommand('lowercase');    // lower case  
editor.executeCommand('capitalize');   // Title Case

// Remove formatting
editor.executeCommand('removeFormat');      // Remove all formatting
editor.executeCommand('clearFormatting');   // Clear specific formatting
```

### Find and Replace

Advanced text manipulation:

```typescript
const searchConfig: EditorConfig = {
  plugins: [
    {
      name: 'find-replace',
      enabled: true,
      options: {
        caseSensitive: false,
        wholeWords: false,
        regex: false
      }
    }
  ]
};

// Find and replace operations
editor.executeCommand('find', { term: 'search term' });
editor.executeCommand('replace', { 
  find: 'old text', 
  replace: 'new text',
  all: false 
});
```

## 🎨 Custom Formatting

### Custom Styles

Define custom formatting styles:

```typescript
const customStylesConfig: EditorConfig = {
  formatting: {
    customStyles: {
      'highlight-yellow': {
        backgroundColor: '#fff9c4',
        padding: '2px 4px',
        borderRadius: '3px'
      },
      'large-text': {
        fontSize: '1.25em',
        fontWeight: 'bold'
      },
      'small-caps': {
        fontVariant: 'small-caps',
        letterSpacing: '0.1em'
      }
    }
  },
  toolbar: {
    groups: [
      {
        id: 'custom',
        tools: [
          'style:highlight-yellow',
          'style:large-text', 
          'style:small-caps'
        ]
      }
    ]
  }
};
```

### Format Painter

Copy formatting from one text to another:

```typescript
// Copy formatting
editor.executeCommand('copyFormat');

// Apply copied formatting
editor.executeCommand('pasteFormat');

// Format painter mode (click to apply multiple times)
editor.executeCommand('formatPainter', { persistent: true });
```

### Style Inspector

Debug and inspect applied styles:

```typescript
const inspectorConfig: EditorConfig = {
  plugins: [
    {
      name: 'style-inspector',
      enabled: true,
      options: {
        showInToolbar: true,
        position: 'right'
      }
    }
  ]
};

// Get applied styles at cursor
const styles = editor.getAppliedStyles();
console.log('Current styles:', styles);
```

## ⌨️ Keyboard Shortcuts

### Default Shortcuts

| Shortcut | Action | Command |
|----------|--------|---------|
| `Ctrl+B` | Bold | `bold` |
| `Ctrl+I` | Italic | `italic` |
| `Ctrl+U` | Underline | `underline` |
| `Ctrl+Shift+S` | Strikethrough | `strikethrough` |
| `Ctrl+` | Code | `code` |
| `Ctrl+Shift+` | Code Block | `codeBlock` |
| `Ctrl+>` | Blockquote | `blockquote` |
| `Ctrl+Shift+7` | Ordered List | `orderedList` |
| `Ctrl+Shift+8` | Bullet List | `bulletList` |
| `Ctrl+Shift+9` | Checklist | `checkList` |
| `Tab` | Increase Indent | `increaseIndent` |
| `Shift+Tab` | Decrease Indent | `decreaseIndent` |
| `Ctrl+Shift+L` | Align Left | `alignLeft` |
| `Ctrl+Shift+E` | Align Center | `alignCenter` |
| `Ctrl+Shift+R` | Align Right | `alignRight` |
| `Ctrl+Shift+J` | Justify | `alignJustify` |

### Custom Shortcuts

Define custom keyboard shortcuts:

```typescript
const shortcutConfig: EditorConfig = {
  accessibility: {
    keyboardShortcuts: {
      'Ctrl+H': 'highlight',
      'Ctrl+M': 'mark',
      'Alt+1': 'heading1',
      'Alt+2': 'heading2',
      'Alt+3': 'heading3',
      'F2': 'formatPainter',
      'Ctrl+Shift+C': 'copyFormat',
      'Ctrl+Shift+V': 'pasteFormat'
    }
  }
};
```

## 🔧 API Reference

### Formatting Commands

```typescript
// Basic formatting
editor.executeCommand('bold');
editor.executeCommand('italic'); 
editor.executeCommand('underline');
editor.executeCommand('strikethrough');

// Text styles
editor.executeCommand('code');
editor.executeCommand('blockquote');
editor.executeCommand('highlight', { color: '#ffeb3b' });

// Structure
editor.executeCommand('heading1');
editor.executeCommand('heading2');
editor.executeCommand('paragraph');

// Lists
editor.executeCommand('bulletList');
editor.executeCommand('orderedList');
editor.executeCommand('checkList');

// Alignment
editor.executeCommand('alignLeft');
editor.executeCommand('alignCenter');
editor.executeCommand('alignRight');
editor.executeCommand('alignJustify');

// Typography
editor.executeCommand('fontFamily', { family: 'Arial, sans-serif' });
editor.executeCommand('fontSize', { size: '18px' });
editor.executeCommand('textColor', { color: '#333' });
editor.executeCommand('backgroundColor', { color: '#f0f0f0' });
```

### Query Methods

```typescript
// Check if command is active
editor.isCommandActive('bold'); // boolean
editor.isCommandActive('italic'); // boolean

// Get current formatting
editor.getCurrentFontFamily(); // string
editor.getCurrentFontSize(); // string
editor.getCurrentAlignment(); // 'left' | 'center' | 'right' | 'justify'
editor.getCurrentHeadingLevel(); // number | null

// Get applied styles
editor.getAppliedStyles(); // CSSStyleDeclaration
editor.getComputedStyle(); // CSSStyleDeclaration
```

### Format Events

```typescript
// Listen to formatting changes
editor.on('formatChange', (event) => {
  console.log('Format changed:', event.command, event.active);
});

editor.on('selectionFormatChange', (event) => {
  console.log('Selection formatting:', event.formats);
});
```

## 🎯 Best Practices

### Performance

1. **Batch formatting operations**:
   ```typescript
   editor.startBatch();
   editor.executeCommand('bold');
   editor.executeCommand('italic');
   editor.executeCommand('fontSize', { size: '18px' });
   editor.endBatch();
   ```

2. **Use semantic formatting**:
   ```typescript
   // Prefer semantic commands
   editor.executeCommand('emphasis'); // instead of italic
   editor.executeCommand('strong');   // instead of bold
   ```

### Accessibility

1. **Always provide keyboard shortcuts**
2. **Use semantic HTML elements**
3. **Provide clear labels for custom styles**

### User Experience

1. **Show current formatting in toolbar**
2. **Provide visual feedback for actions**
3. **Support undo/redo for all operations**

---

*For advanced formatting scenarios, see our [Advanced Examples](../../examples/advanced/) section.*