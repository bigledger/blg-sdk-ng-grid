import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service for handling file downloads in the browser
 */
@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Download a blob as a file
   */
  downloadBlob(blob: Blob, filename: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('File download is only supported in browser environment');
      return;
    }

    try {
      const url = URL.createObjectURL(blob);
      this.downloadFromUrl(url, filename);
      
      // Clean up object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error downloading blob:', error);
      throw error;
    }
  }

  /**
   * Download text content as a file
   */
  downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('File download is only supported in browser environment');
      return;
    }

    try {
      const blob = new Blob([content], { type: mimeType });
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error downloading text:', error);
      throw error;
    }
  }

  /**
   * Download a file from a URL
   */
  downloadFromUrl(url: string, filename: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('File download is only supported in browser environment');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading from URL:', error);
      throw error;
    }
  }

  /**
   * Download JSON data as a file
   */
  downloadJson(data: any, filename: string): void {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      this.downloadText(jsonString, filename, 'application/json');
    } catch (error) {
      console.error('Error downloading JSON:', error);
      throw error;
    }
  }

  /**
   * Download CSV data as a file
   */
  downloadCsv(data: string, filename: string): void {
    try {
      this.downloadText(data, filename, 'text/csv');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      throw error;
    }
  }

  /**
   * Download HTML content as a file
   */
  downloadHtml(content: string, filename: string): void {
    try {
      this.downloadText(content, filename, 'text/html');
    } catch (error) {
      console.error('Error downloading HTML:', error);
      throw error;
    }
  }

  /**
   * Download XML content as a file
   */
  downloadXml(content: string, filename: string): void {
    try {
      this.downloadText(content, filename, 'application/xml');
    } catch (error) {
      console.error('Error downloading XML:', error);
      throw error;
    }
  }

  /**
   * Check if downloads are supported in the current environment
   */
  isDownloadSupported(): boolean {
    return isPlatformBrowser(this.platformId) && 
           typeof document !== 'undefined' && 
           document.createElement !== undefined;
  }

  /**
   * Get appropriate MIME type for a file extension
   */
  getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      csv: 'text/csv',
      json: 'application/json',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      html: 'text/html',
      xml: 'application/xml',
      txt: 'text/plain',
      zip: 'application/zip'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Create a download link element with specified attributes
   */
  createDownloadLink(url: string, filename: string, text?: string): HTMLAnchorElement {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Download links can only be created in browser environment');
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    if (text) {
      link.textContent = text;
    }
    
    return link;
  }

  /**
   * Trigger download with custom options
   */
  downloadWithOptions(options: {
    data: Blob | string;
    filename: string;
    mimeType?: string;
    autoRevoke?: boolean;
    revokeDelay?: number;
  }): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('File download is only supported in browser environment');
      return;
    }

    const { 
      data, 
      filename, 
      mimeType, 
      autoRevoke = true, 
      revokeDelay = 1000 
    } = options;

    try {
      let blob: Blob;
      
      if (data instanceof Blob) {
        blob = data;
      } else if (typeof data === 'string') {
        blob = new Blob([data], { 
          type: mimeType || this.getMimeType(filename.split('.').pop() || '') 
        });
      } else {
        throw new Error('Invalid data type for download');
      }

      const url = URL.createObjectURL(blob);
      this.downloadFromUrl(url, filename);

      if (autoRevoke) {
        setTimeout(() => URL.revokeObjectURL(url), revokeDelay);
      }
    } catch (error) {
      console.error('Error in downloadWithOptions:', error);
      throw error;
    }
  }
}