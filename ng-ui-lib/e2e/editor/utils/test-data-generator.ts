import { faker } from '@faker-js/faker';

/**
 * Test data generators for editor testing
 */
export class EditorTestData {
  /**
   * Generate random text content
   */
  static generateText(options?: {
    sentences?: number;
    paragraphs?: number;
    words?: number;
  }): string {
    if (options?.words) {
      return faker.lorem.words(options.words);
    }
    if (options?.sentences) {
      return faker.lorem.sentences(options.sentences);
    }
    if (options?.paragraphs) {
      return faker.lorem.paragraphs(options.paragraphs, '\n\n');
    }
    return faker.lorem.paragraph();
  }

  /**
   * Generate HTML content with various formatting
   */
  static generateFormattedHtml(): string {
    return `
      <h1>Main Heading</h1>
      <p>This is a <strong>bold</strong> paragraph with <em>italic</em> text and <u>underlined</u> content.</p>
      <h2>Subheading</h2>
      <p>Here's some <code>inline code</code> and a <del>strikethrough</del> text.</p>
      <blockquote>
        This is a blockquote with important information.
      </blockquote>
      <ul>
        <li>First list item</li>
        <li>Second list item with <strong>bold</strong> text</li>
        <li>Third list item</li>
      </ul>
      <ol>
        <li>Ordered list item one</li>
        <li>Ordered list item two</li>
      </ol>
    `;
  }

  /**
   * Generate table data
   */
  static generateTableData(rows: number, cols: number): string[][] {
    const data: string[][] = [];
    
    // Header row
    const headers: string[] = [];
    for (let j = 0; j < cols; j++) {
      headers.push(`Header ${j + 1}`);
    }
    data.push(headers);
    
    // Data rows
    for (let i = 1; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(faker.lorem.words(2));
      }
      data.push(row);
    }
    
    return data;
  }

  /**
   * Generate table HTML
   */
  static generateTableHtml(rows: number, cols: number): string {
    const data = this.generateTableData(rows, cols);
    let html = '<table><thead><tr>';
    
    // Header
    data[0].forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Body rows
    for (let i = 1; i < data.length; i++) {
      html += '<tr>';
      data[i].forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    return html;
  }

  /**
   * Generate sample image URLs
   */
  static generateImageUrls(count: number = 1): string[] {
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
      urls.push(faker.image.url({ width: 300, height: 200 }));
    }
    return urls;
  }

  /**
   * Generate sample video URLs
   */
  static generateVideoUrls(): string[] {
    return [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://vimeo.com/147365861',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://player.vimeo.com/video/147365861',
    ];
  }

  /**
   * Generate complex document structure
   */
  static generateComplexDocument(): string {
    return `
      <h1>Document Title</h1>
      <p>Introduction paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
      
      <h2>Section 1: Text Formatting</h2>
      <p>This section demonstrates various <u>text</u> <del>formatting</del> <code>options</code>.</p>
      
      <blockquote>
        This is an important quote that stands out from the regular text.
      </blockquote>
      
      <h2>Section 2: Lists</h2>
      <ul>
        <li>First unordered item</li>
        <li>Second unordered item with <strong>emphasis</strong></li>
        <li>Third unordered item</li>
      </ul>
      
      <ol>
        <li>First ordered item</li>
        <li>Second ordered item</li>
        <li>Third ordered item</li>
      </ol>
      
      <h2>Section 3: Table Data</h2>
      ${this.generateTableHtml(4, 3)}
      
      <h2>Section 4: Code Examples</h2>
      <pre><code>function example() {
  console.log('Hello World');
  return true;
}</code></pre>
      
      <p>Final paragraph with mixed formatting: <strong><em>bold italic</em></strong> and <code>inline code</code>.</p>
    `;
  }

  /**
   * Generate keyboard shortcuts test data
   */
  static getKeyboardShortcuts(): Array<{
    shortcut: string;
    description: string;
    expectedAction: string;
    platform?: 'mac' | 'windows' | 'linux';
  }> {
    return [
      { shortcut: 'Control+b', description: 'Bold text', expectedAction: 'toggle-bold' },
      { shortcut: 'Control+i', description: 'Italic text', expectedAction: 'toggle-italic' },
      { shortcut: 'Control+u', description: 'Underline text', expectedAction: 'toggle-underline' },
      { shortcut: 'Control+k', description: 'Insert link', expectedAction: 'insert-link' },
      { shortcut: 'Control+z', description: 'Undo', expectedAction: 'undo' },
      { shortcut: 'Control+y', description: 'Redo', expectedAction: 'redo' },
      { shortcut: 'Control+a', description: 'Select all', expectedAction: 'select-all' },
      { shortcut: 'Control+c', description: 'Copy', expectedAction: 'copy' },
      { shortcut: 'Control+v', description: 'Paste', expectedAction: 'paste' },
      { shortcut: 'Control+x', description: 'Cut', expectedAction: 'cut' },
      { shortcut: 'Tab', description: 'Indent', expectedAction: 'indent' },
      { shortcut: 'Shift+Tab', description: 'Outdent', expectedAction: 'outdent' },
      { shortcut: 'Enter', description: 'New line', expectedAction: 'new-line' },
      { shortcut: 'Shift+Enter', description: 'Line break', expectedAction: 'line-break' },
    ];
  }

  /**
   * Generate mobile test scenarios
   */
  static getMobileTestScenarios(): Array<{
    name: string;
    viewport: { width: number; height: number };
    userAgent: string;
    actions: string[];
  }> {
    return [
      {
        name: 'iPhone 12',
        viewport: { width: 390, height: 844 },
        userAgent: 'iPhone',
        actions: ['tap', 'double-tap', 'long-press', 'swipe']
      },
      {
        name: 'iPad',
        viewport: { width: 768, height: 1024 },
        userAgent: 'iPad',
        actions: ['tap', 'pinch', 'scroll', 'multi-touch']
      },
      {
        name: 'Android Phone',
        viewport: { width: 360, height: 640 },
        userAgent: 'Android',
        actions: ['tap', 'swipe', 'long-press', 'scroll']
      }
    ];
  }

  /**
   * Generate accessibility test scenarios
   */
  static getAccessibilityScenarios(): Array<{
    name: string;
    description: string;
    testType: 'keyboard' | 'screenreader' | 'contrast' | 'aria';
    expectedBehavior: string;
  }> {
    return [
      {
        name: 'Keyboard navigation',
        description: 'Navigate through editor using only keyboard',
        testType: 'keyboard',
        expectedBehavior: 'All interactive elements should be reachable via Tab key'
      },
      {
        name: 'ARIA labels',
        description: 'Check proper ARIA labeling',
        testType: 'aria',
        expectedBehavior: 'All buttons and inputs should have appropriate ARIA labels'
      },
      {
        name: 'Screen reader support',
        description: 'Test with screen reader technology',
        testType: 'screenreader',
        expectedBehavior: 'Content should be readable by screen readers'
      },
      {
        name: 'Color contrast',
        description: 'Verify sufficient color contrast',
        testType: 'contrast',
        expectedBehavior: 'Text should meet WCAG contrast requirements'
      }
    ];
  }

  /**
   * Generate performance test data
   */
  static generateLargeDocument(): string {
    let content = '<h1>Large Document Test</h1>';
    
    for (let i = 0; i < 100; i++) {
      content += `<h2>Section ${i + 1}</h2>`;
      content += `<p>${this.generateText({ sentences: 5 })}</p>`;
      
      if (i % 10 === 0) {
        content += this.generateTableHtml(3, 3);
      }
      
      if (i % 15 === 0) {
        content += `<ul>`;
        for (let j = 0; j < 5; j++) {
          content += `<li>${faker.lorem.sentence()}</li>`;
        }
        content += '</ul>';
      }
    }
    
    return content;
  }

  /**
   * Generate test file paths for media uploads
   */
  static getTestFilePaths(): {
    images: string[];
    videos: string[];
    documents: string[];
    invalid: string[];
  } {
    return {
      images: [
        'test-assets/sample-image-1.jpg',
        'test-assets/sample-image-2.png',
        'test-assets/sample-image-3.gif',
        'test-assets/sample-image-4.webp'
      ],
      videos: [
        'test-assets/sample-video-1.mp4',
        'test-assets/sample-video-2.webm',
        'test-assets/sample-video-3.ogg'
      ],
      documents: [
        'test-assets/sample-document.pdf',
        'test-assets/sample-spreadsheet.xlsx',
        'test-assets/sample-presentation.pptx'
      ],
      invalid: [
        'test-assets/invalid-file.xyz',
        'test-assets/corrupted-image.jpg',
        'test-assets/empty-file.txt'
      ]
    };
  }
}