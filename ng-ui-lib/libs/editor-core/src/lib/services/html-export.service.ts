import { Injectable } from '@angular/core';
import { ExportConfig } from './editor-export.service';

/**
 * HTML export style themes
 */
export enum HtmlTheme {
  MINIMAL = 'minimal',
  CLASSIC = 'classic',
  MODERN = 'modern',
  GITHUB = 'github',
  ACADEMIC = 'academic',
  BOOTSTRAP = 'bootstrap',
  MATERIAL = 'material'
}

/**
 * HTML export configuration
 */
export interface HtmlExportConfig extends ExportConfig {
  // Styling options
  theme?: HtmlTheme;
  inlineStyles?: boolean;
  externalCss?: boolean;
  customCss?: string;
  responsive?: boolean;
  darkModeSupport?: boolean;
  
  // Content options
  includeImages?: boolean;
  optimizeImages?: boolean;
  embedImages?: boolean; // Base64 embed
  includeComments?: boolean;
  includeMetadata?: boolean;
  minifyHtml?: boolean;
  
  // Document structure
  includeNavigation?: boolean;
  includeTableOfContents?: boolean;
  addPrintStyles?: boolean;
  addSyntaxHighlighting?: boolean;
  
  // SEO and metadata
  documentTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  author?: string;
  language?: string;
  canonicalUrl?: string;
  
  // Social media
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  };
  
  twitterCard?: {
    card?: 'summary' | 'summary_large_image';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

/**
 * HTML Export Service
 * Creates clean, styled HTML output with various theming and optimization options
 */
@Injectable({
  providedIn: 'root'
})
export class HtmlExportService {
  
  /**
   * Export content to HTML format
   */
  async exportToHtml(content: string, config: HtmlExportConfig): Promise<string> {
    // Process content
    const processedContent = await this.processContent(content, config);
    
    // Generate CSS
    const styles = this.generateStyles(config);
    
    // Generate metadata
    const metadata = this.generateMetadata(config);
    
    // Create HTML structure
    const htmlDocument = this.createHtmlDocument(
      processedContent,
      styles,
      metadata,
      config
    );
    
    // Minify if requested
    if (config.minifyHtml) {
      return this.minifyHtml(htmlDocument);
    }
    
    return htmlDocument;
  }
  
  /**
   * Process HTML content for export
   */
  private async processContent(content: string, config: HtmlExportConfig): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Process images
    if (config.includeImages) {
      await this.processImages(doc, config);
    }
    
    // Add syntax highlighting
    if (config.addSyntaxHighlighting) {
      this.addSyntaxHighlighting(doc);
    }
    
    // Add table of contents
    if (config.includeTableOfContents) {
      this.addTableOfContents(doc);
    }
    
    // Add navigation
    if (config.includeNavigation) {
      this.addNavigation(doc);
    }
    
    // Clean up and optimize
    this.cleanupContent(doc, config);
    
    return doc.body.innerHTML;
  }
  
  /**
   * Generate CSS styles based on theme and configuration
   */
  private generateStyles(config: HtmlExportConfig): string {
    const theme = config.theme || HtmlTheme.MODERN;
    let css = this.getThemeStyles(theme);
    
    // Add responsive styles
    if (config.responsive) {
      css += this.getResponsiveStyles();
    }
    
    // Add dark mode support
    if (config.darkModeSupport) {
      css += this.getDarkModeStyles(theme);
    }
    
    // Add print styles
    if (config.addPrintStyles) {
      css += this.getPrintStyles();
    }
    
    // Add custom CSS
    if (config.customCss) {
      css += '\n\n/* Custom Styles */\n' + config.customCss;
    }
    
    return css;
  }
  
  /**
   * Get theme-specific CSS styles
   */
  private getThemeStyles(theme: HtmlTheme): string {
    const styles: Record<HtmlTheme, string> = {
      [HtmlTheme.MINIMAL]: `
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1, h2, h3, h4, h5, h6 { color: #222; margin-top: 2rem; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 1rem 0; padding-left: 1rem; color: #666; }
        table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
        th { background: #f9f9f9; }
        img { max-width: 100%; height: auto; }
      `,
      
      [HtmlTheme.CLASSIC]: `
        body {
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.8;
          color: #333;
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
          background: #fefefe;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #2c3e50;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        h1 { font-size: 2.5em; border-bottom: 3px solid #3498db; padding-bottom: 0.5rem; }
        h2 { font-size: 2em; border-bottom: 1px solid #bdc3c7; padding-bottom: 0.3rem; }
        a { color: #3498db; text-decoration: none; border-bottom: 1px dotted #3498db; }
        a:hover { border-bottom-style: solid; }
        blockquote {
          border-left: 4px solid #3498db;
          margin: 2rem 0;
          padding: 1rem 2rem;
          background: #ecf0f1;
          font-style: italic;
        }
        code {
          background: #2c3e50;
          color: #ecf0f1;
          padding: 0.3em 0.6em;
          border-radius: 4px;
          font-size: 0.9em;
        }
        pre {
          background: #2c3e50;
          color: #ecf0f1;
          padding: 2rem;
          border-radius: 8px;
          overflow-x: auto;
          line-height: 1.4;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 2rem 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th, td { border: 1px solid #bdc3c7; padding: 1rem; }
        th { background: #34495e; color: white; font-weight: bold; }
        tr:nth-child(even) { background: #f8f9fa; }
      `,
      
      [HtmlTheme.MODERN]: `
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.7;
          color: #1a202c;
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          background: #ffffff;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: 700;
          color: #2d3748;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }
        h1 { font-size: 3rem; color: #1a202c; }
        h2 { font-size: 2.25rem; }
        h3 { font-size: 1.875rem; }
        a {
          color: #4299e1;
          text-decoration: none;
          transition: color 0.2s;
        }
        a:hover { color: #2b6cb0; }
        p { margin-bottom: 1.5rem; }
        blockquote {
          border-left: 4px solid #4299e1;
          margin: 2rem 0;
          padding: 1rem 2rem;
          background: linear-gradient(90deg, #ebf8ff 0%, #f7fafc 100%);
          border-radius: 0 8px 8px 0;
        }
        code {
          background: #f7fafc;
          color: #e53e3e;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          border: 1px solid #e2e8f0;
        }
        pre {
          background: #1a202c;
          color: #f7fafc;
          padding: 2rem;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        pre code {
          background: none;
          color: inherit;
          padding: 0;
          border: none;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 2rem 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
        }
        th, td {
          padding: 1rem 1.5rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #4299e1;
          color: white;
          font-weight: 600;
        }
        tr:hover { background: #f7fafc; }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `,
      
      [HtmlTheme.GITHUB]: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          line-height: 1.5;
          color: #24292f;
          max-width: 980px;
          margin: 0 auto;
          padding: 2rem;
          background: #ffffff;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 16px;
          line-height: 1.25;
        }
        h1, h2 {
          border-bottom: 1px solid #d0d7de;
          padding-bottom: 0.3em;
        }
        a { color: #0969da; text-decoration: none; }
        a:hover { text-decoration: underline; }
        blockquote {
          padding: 0 1em;
          color: #656d76;
          border-left: 0.25em solid #d0d7de;
          margin: 0;
        }
        code {
          background: rgba(175, 184, 193, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-size: 85%;
        }
        pre {
          background: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
        }
        pre code {
          background: transparent;
          padding: 0;
        }
        table {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
          margin: 16px 0;
        }
        th, td {
          padding: 6px 13px;
          border: 1px solid #d0d7de;
        }
        th {
          background: #f6f8fa;
          font-weight: 600;
        }
        tr:nth-child(2n) { background: #f6f8fa; }
        img { max-width: 100%; box-sizing: content-box; }
      `,
      
      [HtmlTheme.ACADEMIC]: `
        body {
          font-family: 'Computer Modern', 'Latin Modern Roman', 'Times New Roman', serif;
          line-height: 1.8;
          color: #2e3440;
          max-width: 800px;
          margin: 0 auto;
          padding: 3rem 2rem;
          text-align: justify;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Computer Modern', 'Latin Modern Roman', serif;
          font-weight: bold;
          color: #2e3440;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          text-align: left;
        }
        h1 { font-size: 2.2em; text-align: center; margin-bottom: 2rem; }
        h2 { font-size: 1.6em; }
        h3 { font-size: 1.3em; }
        p { margin-bottom: 1rem; text-indent: 1.5em; }
        p:first-child, h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p { text-indent: 0; }
        a { color: #5e81ac; text-decoration: none; }
        a:hover { text-decoration: underline; }
        blockquote {
          margin: 2rem 0;
          padding: 1rem 2rem;
          border-left: none;
          font-style: italic;
          text-align: center;
          background: #eceff4;
        }
        code, pre {
          font-family: 'Computer Modern Typewriter', 'Latin Modern Mono', monospace;
          font-size: 0.9em;
        }
        code {
          background: #eceff4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
        }
        pre {
          background: #eceff4;
          padding: 1.5rem;
          border-radius: 5px;
          overflow-x: auto;
          margin: 2rem 0;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 2rem auto;
          font-size: 0.95em;
        }
        th, td {
          border: 1px solid #4c566a;
          padding: 0.8rem;
          text-align: center;
        }
        th {
          background: #eceff4;
          font-weight: bold;
        }
        .footnotes {
          margin-top: 3rem;
          border-top: 1px solid #d8dee9;
          padding-top: 1rem;
          font-size: 0.9em;
        }
      `,
      
      [HtmlTheme.BOOTSTRAP]: `
        body {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          color: #212529;
          background-color: #fff;
          margin: 0;
          padding: 2rem 1rem;
        }
        .container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 15px;
        }
        h1, h2, h3, h4, h5, h6 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-weight: 500;
          line-height: 1.2;
          color: inherit;
        }
        h1 { font-size: calc(1.375rem + 1.5vw); }
        h2 { font-size: calc(1.325rem + 0.9vw); }
        h3 { font-size: calc(1.3rem + 0.6vw); }
        p { margin-top: 0; margin-bottom: 1rem; }
        a {
          color: #0d6efd;
          text-decoration: underline;
        }
        a:hover { color: #0a58ca; }
        blockquote {
          margin: 0 0 1rem;
          padding: 0.5rem 1rem;
          border-left: 0.25rem solid #dee2e6;
          background-color: #f8f9fa;
        }
        code {
          font-size: 0.875em;
          color: #d63384;
          background-color: #f8f9fa;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
        pre {
          display: block;
          margin-top: 0;
          margin-bottom: 1rem;
          overflow: auto;
          font-size: 0.875em;
          background-color: #f8f9fa;
          padding: 0.5rem;
          border-radius: 0.25rem;
        }
        pre code {
          font-size: inherit;
          color: inherit;
          background-color: transparent;
          padding: 0;
        }
        .table {
          width: 100%;
          margin-bottom: 1rem;
          color: #212529;
          vertical-align: top;
          border-color: #dee2e6;
        }
        .table th, .table td {
          padding: 0.5rem;
          border-top: 1px solid #dee2e6;
        }
        .table thead th {
          vertical-align: bottom;
          border-bottom: 2px solid #dee2e6;
          background-color: #f8f9fa;
        }
        img { max-width: 100%; height: auto; }
      `,
      
      [HtmlTheme.MATERIAL]: `
        body {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.87);
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          background: #fafafa;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: 400;
          margin: 24px 0 16px 0;
          color: rgba(0, 0, 0, 0.87);
        }
        h1 { font-size: 3.5rem; font-weight: 300; }
        h2 { font-size: 2.8125rem; font-weight: 300; }
        h3 { font-size: 2.25rem; }
        h4 { font-size: 1.75rem; }
        p { margin: 16px 0; }
        a {
          color: #1976d2;
          text-decoration: none;
          transition: color 0.2s;
        }
        a:hover { color: #1565c0; }
        blockquote {
          margin: 24px 0;
          padding: 16px 24px;
          background: #fff;
          border-left: 4px solid #1976d2;
          box-shadow: 0 2px 4px rgba(0,0,0,0.12);
          border-radius: 0 4px 4px 0;
        }
        code {
          background: rgba(0, 0, 0, 0.08);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
          font-family: 'Roboto Mono', monospace;
        }
        pre {
          background: #263238;
          color: #fff;
          padding: 24px;
          border-radius: 8px;
          overflow-x: auto;
          box-shadow: 0 4px 8px rgba(0,0,0,0.12);
          margin: 24px 0;
        }
        pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid rgba(0,0,0,0.12);
        }
        th {
          background: #f5f5f5;
          font-weight: 500;
          color: rgba(0,0,0,0.87);
        }
        tr:hover { background: rgba(0,0,0,0.04); }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
      `
    };
    
    return styles[theme] || styles[HtmlTheme.MODERN];
  }
  
  /**
   * Get responsive CSS styles
   */
  private getResponsiveStyles(): string {
    return `
      
      /* Responsive Styles */
      @media (max-width: 768px) {
        body {
          padding: 1rem 0.5rem;
          font-size: 0.9rem;
        }
        
        h1 { font-size: 2rem; }
        h2 { font-size: 1.6rem; }
        h3 { font-size: 1.3rem; }
        
        pre {
          padding: 1rem;
          font-size: 0.8rem;
        }
        
        table {
          font-size: 0.8rem;
        }
        
        th, td {
          padding: 0.5rem 0.3rem;
        }
        
        blockquote {
          margin: 1rem 0;
          padding: 0.5rem 1rem;
        }
      }
      
      @media (max-width: 480px) {
        body {
          padding: 0.5rem 0.25rem;
          line-height: 1.5;
        }
        
        h1 { font-size: 1.8rem; }
        h2 { font-size: 1.4rem; }
        h3 { font-size: 1.2rem; }
        
        pre {
          padding: 0.75rem;
          font-size: 0.75rem;
        }
        
        table {
          display: block;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
      }
    `;
  }
  
  /**
   * Get dark mode CSS styles
   */
  private getDarkModeStyles(theme: HtmlTheme): string {
    const darkStyles: Record<HtmlTheme, string> = {
      [HtmlTheme.MINIMAL]: `
        @media (prefers-color-scheme: dark) {
          body { background: #1a1a1a; color: #e1e1e1; }
          h1, h2, h3, h4, h5, h6 { color: #f1f1f1; }
          a { color: #66b3ff; }
          code, pre { background: #2d2d2d; color: #f1f1f1; }
          blockquote { border-left-color: #555; color: #ccc; }
          th { background: #2d2d2d; }
          th, td { border-color: #555; }
        }
      `,
      [HtmlTheme.MODERN]: `
        @media (prefers-color-scheme: dark) {
          body { background: #0f1419; color: #e6e6e6; }
          h1, h2, h3, h4, h5, h6 { color: #ffffff; }
          a { color: #4fc3f7; }
          a:hover { color: #29b6f6; }
          blockquote { 
            background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
            border-left-color: #4fc3f7;
          }
          code { background: #1e293b; color: #f97316; border-color: #334155; }
          pre { background: #0f172a; color: #f1f5f9; }
          th { background: #1e293b; }
          th, td { border-color: #334155; }
          tr:hover { background: #1e293b; }
        }
      `,
      [HtmlTheme.GITHUB]: `
        @media (prefers-color-scheme: dark) {
          body { background: #0d1117; color: #c9d1d9; }
          h1, h2, h3, h4, h5, h6 { color: #f0f6fc; }
          h1, h2 { border-bottom-color: #21262d; }
          a { color: #58a6ff; }
          blockquote { color: #8b949e; border-left-color: #30363d; }
          code { background: rgba(110, 118, 129, 0.4); }
          pre { background: #161b22; }
          th { background: #161b22; }
          th, td { border-color: #30363d; }
          tr:nth-child(2n) { background: #161b22; }
        }
      `,
      [HtmlTheme.CLASSIC]: `
        @media (prefers-color-scheme: dark) {
          body { background: #1a1a1a; color: #e8e6e3; }
          h1, h2, h3, h4, h5, h6 { color: #f0f0f0; }
          h1 { border-bottom-color: #4a90e2; }
          h2 { border-bottom-color: #666; }
          a { color: #4a90e2; border-bottom-color: #4a90e2; }
          blockquote { background: #2a2a2a; border-left-color: #4a90e2; }
          code, pre { background: #2a2a2a; color: #f0f0f0; }
          th { background: #333; color: #f0f0f0; }
          th, td { border-color: #555; }
          tr:nth-child(even) { background: #222; }
        }
      `,
      [HtmlTheme.ACADEMIC]: `
        @media (prefers-color-scheme: dark) {
          body { background: #2e3440; color: #d8dee9; }
          h1, h2, h3, h4, h5, h6 { color: #eceff4; }
          a { color: #88c0d0; }
          blockquote { background: #3b4252; }
          code, pre { background: #3b4252; color: #d8dee9; }
          th { background: #434c5e; color: #eceff4; }
          th, td { border-color: #4c566a; }
        }
      `,
      [HtmlTheme.BOOTSTRAP]: `
        @media (prefers-color-scheme: dark) {
          body { background: #212529; color: #dee2e6; }
          a { color: #6ea8fe; }
          a:hover { color: #9ec5fe; }
          blockquote, code, pre { background: #343a40; }
          .table th { background: #495057; }
          .table th, .table td { border-color: #495057; }
        }
      `,
      [HtmlTheme.MATERIAL]: `
        @media (prefers-color-scheme: dark) {
          body { background: #121212; color: rgba(255,255,255,0.87); }
          h1, h2, h3, h4, h5, h6 { color: rgba(255,255,255,0.87); }
          a { color: #bb86fc; }
          a:hover { color: #d7b9ff; }
          blockquote { background: #1e1e1e; border-left-color: #bb86fc; }
          code { background: rgba(255,255,255,0.1); }
          pre { background: #1e1e1e; }
          table { background: #1e1e1e; }
          th { background: #2d2d2d; color: rgba(255,255,255,0.87); }
          th, td { border-bottom-color: rgba(255,255,255,0.12); }
          tr:hover { background: rgba(255,255,255,0.04); }
        }
      `
    };
    
    return darkStyles[theme] || darkStyles[HtmlTheme.MODERN];
  }
  
  /**
   * Get print-specific CSS styles
   */
  private getPrintStyles(): string {
    return `
      
      /* Print Styles */
      @media print {
        body {
          font-size: 12pt;
          line-height: 1.3;
          color: #000;
          background: #fff;
          max-width: none;
          margin: 0;
          padding: 1cm;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        
        p, blockquote {
          page-break-inside: avoid;
          orphans: 3;
          widows: 3;
        }
        
        img {
          page-break-inside: avoid;
          max-width: 100% !important;
        }
        
        table {
          page-break-inside: avoid;
        }
        
        th {
          page-break-after: avoid;
        }
        
        a {
          color: #000;
          text-decoration: underline;
        }
        
        a[href^="http"]:after {
          content: " (" attr(href) ")";
          font-size: 0.8em;
        }
        
        code, pre {
          border: 1px solid #ccc;
          page-break-inside: avoid;
        }
        
        .no-print {
          display: none;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .page-break-after {
          page-break-after: always;
        }
      }
    `;
  }
  
  /**
   * Generate HTML metadata
   */
  private generateMetadata(config: HtmlExportConfig): string {
    let metadata = '';
    
    // Basic meta tags
    metadata += '<meta charset="UTF-8">\n';
    metadata += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    
    if (config.documentTitle) {
      metadata += `<title>${this.escapeHtml(config.documentTitle)}</title>\n`;
    }
    
    if (config.metaDescription) {
      metadata += `<meta name="description" content="${this.escapeHtml(config.metaDescription)}">\n`;
    }
    
    if (config.metaKeywords?.length) {
      metadata += `<meta name="keywords" content="${config.metaKeywords.map(k => this.escapeHtml(k)).join(', ')}">\n`;
    }
    
    if (config.author) {
      metadata += `<meta name="author" content="${this.escapeHtml(config.author)}">\n`;
    }
    
    if (config.language) {
      metadata += `<meta name="language" content="${config.language}">\n`;
    }
    
    if (config.canonicalUrl) {
      metadata += `<link rel="canonical" href="${config.canonicalUrl}">\n`;
    }
    
    // Open Graph
    if (config.openGraph) {
      const og = config.openGraph;
      if (og.title) metadata += `<meta property="og:title" content="${this.escapeHtml(og.title)}">\n`;
      if (og.description) metadata += `<meta property="og:description" content="${this.escapeHtml(og.description)}">\n`;
      if (og.image) metadata += `<meta property="og:image" content="${og.image}">\n`;
      if (og.url) metadata += `<meta property="og:url" content="${og.url}">\n`;
      if (og.type) metadata += `<meta property="og:type" content="${og.type}">\n`;
    }
    
    // Twitter Card
    if (config.twitterCard) {
      const tw = config.twitterCard;
      if (tw.card) metadata += `<meta name="twitter:card" content="${tw.card}">\n`;
      if (tw.site) metadata += `<meta name="twitter:site" content="${tw.site}">\n`;
      if (tw.creator) metadata += `<meta name="twitter:creator" content="${tw.creator}">\n`;
      if (tw.title) metadata += `<meta name="twitter:title" content="${this.escapeHtml(tw.title)}">\n`;
      if (tw.description) metadata += `<meta name="twitter:description" content="${this.escapeHtml(tw.description)}">\n`;
      if (tw.image) metadata += `<meta name="twitter:image" content="${tw.image}">\n`;
    }
    
    return metadata;
  }
  
  /**
   * Create complete HTML document
   */
  private createHtmlDocument(
    content: string,
    styles: string,
    metadata: string,
    config: HtmlExportConfig
  ): string {
    const title = config.documentTitle || 'Document';
    const lang = config.language || 'en';
    
    let html = `<!DOCTYPE html>\n`;
    html += `<html lang="${lang}">\n`;
    html += `<head>\n`;
    html += metadata;
    
    // Add styles
    if (config.inlineStyles !== false) {
      html += `<style>\n${styles}\n</style>\n`;
    }
    
    if (config.externalCss) {
      // Add external CSS links here if needed
    }
    
    html += `</head>\n`;
    html += `<body>\n`;
    
    // Add container if using Bootstrap theme
    if (config.theme === HtmlTheme.BOOTSTRAP) {
      html += `<div class="container">\n`;
      html += content;
      html += `</div>\n`;
    } else {
      html += content;
    }
    
    html += `</body>\n`;
    html += `</html>`;
    
    return html;
  }
  
  /**
   * Process images in the document
   */
  private async processImages(doc: Document, config: HtmlExportConfig): Promise<void> {
    const images = doc.querySelectorAll('img');
    
    for (const img of Array.from(images)) {
      if (config.embedImages) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const base64 = await this.blobToBase64(blob);
          img.src = base64;
        } catch (error) {
          console.warn('Failed to embed image:', error);
        }
      }
      
      if (config.optimizeImages) {
        // Add loading="lazy" for performance
        img.setAttribute('loading', 'lazy');
        
        // Add alt text if missing
        if (!img.alt) {
          img.alt = 'Image';
        }
      }
    }
  }
  
  /**
   * Add syntax highlighting to code blocks
   */
  private addSyntaxHighlighting(doc: Document): void {
    const codeBlocks = doc.querySelectorAll('pre code, code[class*="language-"]');
    
    codeBlocks.forEach(block => {
      const element = block as HTMLElement;
      
      // Add syntax highlighting classes
      if (!element.className.includes('hljs')) {
        element.className += ' hljs';
      }
      
      // You could integrate with libraries like Prism.js or highlight.js here
      // For now, just add the appropriate classes
    });
  }
  
  /**
   * Add table of contents
   */
  private addTableOfContents(doc: Document): void {
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) return;
    
    const tocContainer = doc.createElement('nav');
    tocContainer.className = 'table-of-contents';
    tocContainer.innerHTML = '<h2>Table of Contents</h2>';
    
    const tocList = doc.createElement('ul');
    
    headings.forEach((heading, index) => {
      const element = heading as HTMLElement;
      const level = parseInt(element.tagName.charAt(1));
      const text = element.textContent || '';
      const id = `heading-${index}`;
      
      element.id = id;
      
      const listItem = doc.createElement('li');
      listItem.className = `toc-level-${level}`;
      listItem.innerHTML = `<a href="#${id}">${this.escapeHtml(text)}</a>`;
      
      tocList.appendChild(listItem);
    });
    
    tocContainer.appendChild(tocList);
    
    // Insert TOC at the beginning of the content
    if (doc.body.firstChild) {
      doc.body.insertBefore(tocContainer, doc.body.firstChild);
    } else {
      doc.body.appendChild(tocContainer);
    }
  }
  
  /**
   * Add navigation menu
   */
  private addNavigation(doc: Document): void {
    const nav = doc.createElement('nav');
    nav.className = 'document-navigation no-print';
    nav.innerHTML = `
      <div class="nav-links">
        <button onclick="window.print()" class="nav-button">Print</button>
        <button onclick="window.history.back()" class="nav-button">Back</button>
      </div>
    `;
    
    if (doc.body.firstChild) {
      doc.body.insertBefore(nav, doc.body.firstChild);
    } else {
      doc.body.appendChild(nav);
    }
  }
  
  /**
   * Clean up and optimize content
   */
  private cleanupContent(doc: Document, config: HtmlExportConfig): void {
    // Remove empty paragraphs
    const emptyParagraphs = doc.querySelectorAll('p:empty');
    emptyParagraphs.forEach(p => p.remove());
    
    // Clean up extra whitespace
    const textNodes = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = textNodes.nextNode()) {
      if (node.textContent) {
        node.textContent = node.textContent.replace(/\s+/g, ' ');
      }
    }
    
    // Remove comments if not requested
    if (!config.includeComments) {
      const comments = doc.querySelectorAll('[data-comment]');
      comments.forEach(comment => {
        comment.removeAttribute('data-comment');
      });
    }
  }
  
  /**
   * Minify HTML output
   */
  private minifyHtml(html: string): string {
    return html
      .replace(/\n\s*\n/g, '\n')
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Utility functions
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}