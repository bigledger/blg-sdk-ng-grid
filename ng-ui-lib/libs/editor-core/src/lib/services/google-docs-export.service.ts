import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal, computed } from '@angular/core';
import { ExportConfig } from './editor-export.service';

/**
 * Google Drive API scopes needed for document operations
 */
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents'
];

/**
 * Google Docs specific export configuration
 */
export interface GoogleDocsExportConfig extends ExportConfig {
  // Authentication
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  
  // Document settings
  title?: string;
  folderId?: string; // Parent folder ID in Google Drive
  makePublic?: boolean;
  
  // Sharing settings
  shareWithEmails?: string[];
  accessLevel?: 'reader' | 'commenter' | 'writer';
  notifyUsers?: boolean;
  shareMessage?: string;
  
  // Document options
  preserveFormatting?: boolean;
  includeImages?: boolean;
  includeComments?: boolean;
  convertToGoogleFormat?: boolean; // Convert to native Google Docs format
  
  // Collaboration settings
  enableSuggestionMode?: boolean;
  allowComments?: boolean;
  copyCommentsAndSuggestions?: boolean;
  
  // Revision settings
  includeRevisionHistory?: boolean;
  
  // Template settings
  templateId?: string; // Use existing document as template
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userInfo: {
    email?: string;
    name?: string;
    picture?: string;
  } | null;
}

/**
 * Google Docs export result
 */
export interface GoogleDocsExportResult {
  success: boolean;
  documentId: string;
  documentUrl: string;
  webViewLink: string;
  editLink?: string;
  shareLinks?: Record<string, string>;
  error?: string;
  warnings?: string[];
}

/**
 * Document permission for sharing
 */
interface DocumentPermission {
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'reader' | 'commenter' | 'writer' | 'owner';
  emailAddress?: string;
  domain?: string;
  allowFileDiscovery?: boolean;
  sendNotificationEmail?: boolean;
  emailMessage?: string;
}

/**
 * Google Docs Export Service
 * Integrates with Google Drive and Docs APIs for seamless document export and collaboration
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleDocsExportService {
  private http = inject(HttpClient);
  
  // Authentication state
  private _authState = signal<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    userInfo: null
  });
  
  readonly authState = this._authState.asReadonly();
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly userInfo = computed(() => this._authState().userInfo);
  
  // API endpoints
  private readonly DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
  private readonly DOCS_API_BASE = 'https://www.googleapis.com/docs/v1';
  private readonly OAUTH2_BASE = 'https://www.googleapis.com/oauth2/v2';
  
  /**
   * Initialize Google APIs and authentication
   */
  async initialize(clientId: string): Promise<void> {
    // Load Google API script if not already loaded
    if (!window.gapi) {
      await this.loadGoogleAPIScript();
    }
    
    // Initialize Google API
    return new Promise((resolve, reject) => {
      window.gapi.load('auth2:client', async () => {
        try {
          await window.gapi.client.init({
            clientId: clientId,
            scope: GOOGLE_DRIVE_SCOPES.join(' '),
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
              'https://www.googleapis.com/discovery/v1/apis/docs/v1/rest'
            ]
          });
          
          // Check if user is already signed in
          const authInstance = window.gapi.auth2.getAuthInstance();
          if (authInstance.isSignedIn.get()) {
            await this.updateAuthState();
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Authenticate user with Google
   */
  async authenticate(): Promise<boolean> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      await this.updateAuthState();
      return true;
    } catch (error) {
      console.error('Google authentication failed:', error);
      return false;
    }
  }
  
  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      
      this._authState.set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        userInfo: null
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
  
  /**
   * Export content to Google Docs
   */
  async exportToGoogleDocs(
    content: string, 
    config: GoogleDocsExportConfig
  ): Promise<GoogleDocsExportResult> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google. Please sign in first.');
    }
    
    try {
      // Process content for Google Docs format
      const processedContent = await this.processContentForGoogleDocs(content, config);
      
      // Create document
      const documentResult = await this.createDocument(processedContent, config);
      
      // Share document if configured
      let shareLinks: Record<string, string> = {};
      if (config.shareWithEmails?.length || config.makePublic) {
        shareLinks = await this.shareDocument(documentResult.documentId, config);
      }
      
      return {
        success: true,
        documentId: documentResult.documentId,
        documentUrl: documentResult.documentUrl,
        webViewLink: documentResult.webViewLink,
        editLink: documentResult.editLink,
        shareLinks
      };
      
    } catch (error) {
      return {
        success: false,
        documentId: '',
        documentUrl: '',
        webViewLink: '',
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }
  
  /**
   * Create a new Google Document
   */
  private async createDocument(
    content: string, 
    config: GoogleDocsExportConfig
  ): Promise<{
    documentId: string;
    documentUrl: string;
    webViewLink: string;
    editLink: string;
  }> {
    const title = config.title || `Document ${new Date().toLocaleDateString()}`;
    
    if (config.convertToGoogleFormat) {
      // Create native Google Docs document
      return await this.createNativeGoogleDoc(content, title, config);
    } else {
      // Upload as file to Google Drive
      return await this.uploadToGoogleDrive(content, title, config);
    }
  }
  
  /**
   * Create native Google Docs document with formatting
   */
  private async createNativeGoogleDoc(
    content: string,
    title: string,
    config: GoogleDocsExportConfig
  ): Promise<{
    documentId: string;
    documentUrl: string;
    webViewLink: string;
    editLink: string;
  }> {
    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Convert to Google Docs requests
    const requests = await this.convertToGoogleDocsRequests(doc.body, config);
    
    // Create the document
    const createResponse = await window.gapi.client.docs.documents.create({
      title: title
    });
    
    const documentId = createResponse.result.documentId;
    
    // Apply formatting requests
    if (requests.length > 0) {
      await window.gapi.client.docs.documents.batchUpdate({
        documentId: documentId,
        requests: requests
      });
    }
    
    // Move to specific folder if specified
    if (config.folderId) {
      await this.moveToFolder(documentId, config.folderId);
    }
    
    return {
      documentId,
      documentUrl: `https://docs.google.com/document/d/${documentId}`,
      webViewLink: `https://docs.google.com/document/d/${documentId}/view`,
      editLink: `https://docs.google.com/document/d/${documentId}/edit`
    };
  }
  
  /**
   * Upload content as file to Google Drive
   */
  private async uploadToGoogleDrive(
    content: string,
    title: string,
    config: GoogleDocsExportConfig
  ): Promise<{
    documentId: string;
    documentUrl: string;
    webViewLink: string;
    editLink: string;
  }> {
    // Create HTML file content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
${content}
</body>
</html>`;
    
    // Create file metadata
    const metadata = {
      name: `${title}.html`,
      parents: config.folderId ? [config.folderId] : undefined,
      mimeType: 'text/html'
    };
    
    // Upload file
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([htmlContent], { type: 'text/html' }));
    
    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._authState().accessToken}`
      },
      body: form
    });
    
    const result = await uploadResponse.json();
    const documentId = result.id;
    
    return {
      documentId,
      documentUrl: `https://drive.google.com/file/d/${documentId}`,
      webViewLink: `https://drive.google.com/file/d/${documentId}/view`,
      editLink: `https://drive.google.com/file/d/${documentId}/edit`
    };
  }
  
  /**
   * Share document with specified users
   */
  private async shareDocument(
    documentId: string, 
    config: GoogleDocsExportConfig
  ): Promise<Record<string, string>> {
    const shareLinks: Record<string, string> = {};
    
    // Share with specific users
    if (config.shareWithEmails?.length) {
      for (const email of config.shareWithEmails) {
        const permission: DocumentPermission = {
          type: 'user',
          role: config.accessLevel || 'reader',
          emailAddress: email,
          sendNotificationEmail: config.notifyUsers || false,
          emailMessage: config.shareMessage
        };
        
        try {
          await this.addPermission(documentId, permission);
          shareLinks[email] = `https://docs.google.com/document/d/${documentId}`;
        } catch (error) {
          console.warn(`Failed to share with ${email}:`, error);
        }
      }
    }
    
    // Make public if requested
    if (config.makePublic) {
      const publicPermission: DocumentPermission = {
        type: 'anyone',
        role: 'reader',
        allowFileDiscovery: true
      };
      
      try {
        await this.addPermission(documentId, publicPermission);
        shareLinks['public'] = `https://docs.google.com/document/d/${documentId}`;
      } catch (error) {
        console.warn('Failed to make document public:', error);
      }
    }
    
    return shareLinks;
  }
  
  /**
   * Add permission to document
   */
  private async addPermission(documentId: string, permission: DocumentPermission): Promise<void> {
    await window.gapi.client.drive.permissions.create({
      fileId: documentId,
      resource: permission,
      sendNotificationEmail: permission.sendNotificationEmail,
      emailMessage: permission.emailMessage
    });
  }
  
  /**
   * Move document to specific folder
   */
  private async moveToFolder(documentId: string, folderId: string): Promise<void> {
    // Get current parents
    const fileResponse = await window.gapi.client.drive.files.get({
      fileId: documentId,
      fields: 'parents'
    });
    
    const currentParents = fileResponse.result.parents;
    
    // Update parents
    await window.gapi.client.drive.files.update({
      fileId: documentId,
      addParents: folderId,
      removeParents: currentParents?.join(',')
    });
  }
  
  /**
   * Process content for Google Docs compatibility
   */
  private async processContentForGoogleDocs(
    content: string, 
    config: GoogleDocsExportConfig
  ): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Process images if needed
    if (config.includeImages) {
      await this.processImagesForGoogleDocs(doc, config);
    }
    
    // Clean up unsupported elements
    this.cleanupForGoogleDocs(doc);
    
    return doc.body.innerHTML;
  }
  
  /**
   * Convert HTML to Google Docs API requests
   */
  private async convertToGoogleDocsRequests(element: Element, config: GoogleDocsExportConfig): Promise<any[]> {
    const requests: any[] = [];
    let index = 1; // Google Docs uses 1-based indexing
    
    // This is a simplified conversion
    // A full implementation would need to handle all HTML elements and their formatting
    const textContent = element.textContent || '';
    
    if (textContent.trim()) {
      // Insert text
      requests.push({
        insertText: {
          location: { index },
          text: textContent
        }
      });
      
      // Apply basic formatting (this would need to be more sophisticated)
      const boldElements = element.querySelectorAll('strong, b');
      boldElements.forEach(el => {
        const text = el.textContent || '';
        if (text.trim()) {
          requests.push({
            updateTextStyle: {
              range: {
                startIndex: index,
                endIndex: index + text.length
              },
              textStyle: {
                bold: true
              },
              fields: 'bold'
            }
          });
        }
      });
    }
    
    return requests;
  }
  
  /**
   * Process images for Google Docs
   */
  private async processImagesForGoogleDocs(doc: Document, config: GoogleDocsExportConfig): Promise<void> {
    const images = doc.querySelectorAll('img');
    
    for (const img of Array.from(images)) {
      try {
        if (img.src.startsWith('data:')) {
          // Image is already base64 encoded
          continue;
        }
        
        // Convert external images to base64 or upload to Google Drive
        const response = await fetch(img.src);
        const blob = await response.blob();
        
        if (config.convertToGoogleFormat) {
          // Upload image to Google Drive and get shareable link
          const imageUrl = await this.uploadImageToGoogleDrive(blob, `image-${Date.now()}`);
          img.src = imageUrl;
        } else {
          // Convert to base64
          const base64 = await this.blobToBase64(blob);
          img.src = base64;
        }
      } catch (error) {
        console.warn('Failed to process image:', error);
        // Remove problematic images
        img.remove();
      }
    }
  }
  
  /**
   * Upload image to Google Drive
   */
  private async uploadImageToGoogleDrive(blob: Blob, name: string): Promise<string> {
    const metadata = {
      name: name,
      parents: ['images'] // You might want to create a specific folder for images
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._authState().accessToken}`
      },
      body: form
    });
    
    const result = await response.json();
    
    // Make image publicly viewable
    await this.addPermission(result.id, {
      type: 'anyone',
      role: 'reader',
      allowFileDiscovery: false
    });
    
    return `https://drive.google.com/uc?id=${result.id}`;
  }
  
  /**
   * Clean up HTML for Google Docs compatibility
   */
  private cleanupForGoogleDocs(doc: Document): void {
    // Remove script tags
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove style tags (inline styles should be preserved)
    const styles = doc.querySelectorAll('style');
    styles.forEach(style => style.remove());
    
    // Convert complex elements to simpler equivalents
    const complexElements = doc.querySelectorAll('canvas, video, audio, iframe');
    complexElements.forEach(el => {
      const placeholder = doc.createElement('p');
      placeholder.textContent = `[${el.tagName.toLowerCase()} content not supported]`;
      el.parentNode?.replaceChild(placeholder, el);
    });
  }
  
  /**
   * Update authentication state
   */
  private async updateAuthState(): Promise<void> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      
      if (user.isSignedIn()) {
        const authResponse = user.getAuthResponse();
        const profile = user.getBasicProfile();
        
        this._authState.set({
          isAuthenticated: true,
          accessToken: authResponse.access_token,
          refreshToken: null, // Refresh token not available in implicit flow
          expiresAt: authResponse.expires_at,
          userInfo: {
            email: profile.getEmail(),
            name: profile.getName(),
            picture: profile.getImageUrl()
          }
        });
      }
    } catch (error) {
      console.error('Failed to update auth state:', error);
    }
  }
  
  /**
   * Load Google API script
   */
  private async loadGoogleAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }
  
  /**
   * Convert blob to base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  /**
   * Get user's Google Drive folders
   */
  async getFolders(): Promise<Array<{ id: string; name: string }>> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id,name)',
        orderBy: 'name'
      });
      
      return response.result.files || [];
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      return [];
    }
  }
  
  /**
   * Create a new folder in Google Drive
   */
  async createFolder(name: string, parentId?: string): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    };
    
    const response = await window.gapi.client.drive.files.create({
      resource: metadata
    });
    
    return response.result.id;
  }
  
  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    const state = this._authState();
    if (!state.expiresAt) return true;
    
    return Date.now() >= state.expiresAt;
  }
  
  /**
   * Refresh access token if needed
   */
  async refreshTokenIfNeeded(): Promise<void> {
    if (this.isTokenExpired()) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      
      if (user.isSignedIn()) {
        await user.reloadAuthResponse();
        await this.updateAuthState();
      }
    }
  }
}

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}