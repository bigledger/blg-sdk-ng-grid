import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { ExportConfig, ExportResult, ExportFormat, GoogleCredentials } from '../interfaces';
import { ProgressTrackingService } from '../services/progress-tracking.service';

/**
 * Google API Service URLs
 */
const GOOGLE_APIS = {
  sheets: 'https://sheets.googleapis.com/v4/spreadsheets',
  docs: 'https://docs.googleapis.com/v1/documents',
  drive: 'https://www.googleapis.com/drive/v3/files',
  oauth: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token'
};

/**
 * Google Sheets Export Configuration
 */
export interface GoogleSheetsConfig {
  title?: string;
  sheets?: GoogleSheetData[];
  sharing?: GoogleSharingSettings;
  formatting?: GoogleSheetsFormatting;
}

/**
 * Google Sheet Data
 */
export interface GoogleSheetData {
  name: string;
  data: any[][];
  formatting?: GoogleSheetsFormatting;
}

/**
 * Google Docs Export Configuration
 */
export interface GoogleDocsConfig {
  title?: string;
  content: GoogleDocContent[];
  sharing?: GoogleSharingSettings;
  template?: string;
}

/**
 * Google Doc Content Element
 */
export interface GoogleDocContent {
  type: 'paragraph' | 'table' | 'image' | 'heading';
  content: any;
  formatting?: any;
}

/**
 * Google Sharing Settings
 */
export interface GoogleSharingSettings {
  type: 'private' | 'public' | 'domain';
  role: 'reader' | 'writer' | 'owner';
  users?: string[];
  allowComments?: boolean;
  allowEditing?: boolean;
}

/**
 * Google Sheets Formatting
 */
export interface GoogleSheetsFormatting {
  freezeHeader?: boolean;
  autoResize?: boolean;
  alternatingColors?: boolean;
  borders?: boolean;
  headerStyle?: any;
  dataStyle?: any;
}

/**
 * Google Exporter Service
 * 
 * Handles exports to Google Sheets and Google Docs
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleExporter {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly progressService = inject(ProgressTrackingService);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private credentials: GoogleCredentials | null = null;

  /**
   * Export to Google Sheets or Google Docs
   */
  export(config: ExportConfig): Observable<ExportResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Google export is only supported in browser environment'));
    }

    this.progressService.startProgress('google-export', 'Initializing Google export');

    // Set credentials from config
    if (config.credentials) {
      this.setCredentials(config.credentials);
    }

    return this.authenticate().pipe(
      switchMap(() => {
        if (config.format === ExportFormat.GOOGLE_SHEETS) {
          return this.exportToGoogleSheets(config);
        } else if (config.format === ExportFormat.GOOGLE_DOCS) {
          return this.exportToGoogleDocs(config);
        } else {
          return throwError(() => new Error(`Unsupported Google format: ${config.format}`));
        }
      }),
      catchError(error => {
        this.progressService.cancelProgress('google-export');
        return throwError(() => error);
      })
    );
  }

  /**
   * Export to Google Sheets
   */
  private exportToGoogleSheets(config: ExportConfig): Observable<ExportResult> {
    this.progressService.updateProgress('google-export', 25, 'Creating Google Sheets document');

    const sheetsConfig = this.createSheetsConfig(config);
    
    return this.createSpreadsheet(sheetsConfig).pipe(
      switchMap(spreadsheet => {
        this.progressService.updateProgress('google-export', 50, 'Adding data to sheets');
        
        return this.populateSpreadsheet(spreadsheet.spreadsheetId, sheetsConfig);
      }),
      switchMap(result => {
        this.progressService.updateProgress('google-export', 75, 'Applying formatting');
        
        return this.formatSpreadsheet(result.spreadsheetId, sheetsConfig);
      }),
      switchMap(result => {
        if (sheetsConfig.sharing) {
          this.progressService.updateProgress('google-export', 90, 'Setting up sharing');
          return this.shareDocument(result.spreadsheetId, sheetsConfig.sharing);
        }
        return from(Promise.resolve(result));
      }),
      map(result => {
        this.progressService.completeProgress('google-export');
        
        return {
          success: true,
          googleFileId: result.spreadsheetId,
          url: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`,
          metadata: {
            format: 'google-sheets',
            title: sheetsConfig.title,
            sheetCount: sheetsConfig.sheets?.length || 1
          }
        } as ExportResult;
      })
    );
  }

  /**
   * Export to Google Docs
   */
  private exportToGoogleDocs(config: ExportConfig): Observable<ExportResult> {
    this.progressService.updateProgress('google-export', 25, 'Creating Google Docs document');

    const docsConfig = this.createDocsConfig(config);
    
    return this.createDocument(docsConfig).pipe(
      switchMap(document => {
        this.progressService.updateProgress('google-export', 50, 'Adding content to document');
        
        return this.populateDocument(document.documentId, docsConfig);
      }),
      switchMap(result => {
        if (docsConfig.sharing) {
          this.progressService.updateProgress('google-export', 75, 'Setting up sharing');
          return this.shareDocument(result.documentId, docsConfig.sharing);
        }
        return from(Promise.resolve(result));
      }),
      map(result => {
        this.progressService.completeProgress('google-export');
        
        return {
          success: true,
          googleFileId: result.documentId,
          url: `https://docs.google.com/document/d/${result.documentId}/edit`,
          metadata: {
            format: 'google-docs',
            title: docsConfig.title
          }
        } as ExportResult;
      })
    );
  }

  /**
   * Create Google Sheets configuration
   */
  private createSheetsConfig(config: ExportConfig): GoogleSheetsConfig {
    const data = this.normalizeDataForSheets(config.data);
    
    return {
      title: config.filename || 'NG-UI Export',
      sheets: [{
        name: config.sheetName || 'Data',
        data: data,
        formatting: {
          freezeHeader: true,
          autoResize: true,
          alternatingColors: true,
          borders: true
        }
      }],
      sharing: config.sharing as GoogleSharingSettings,
      formatting: {
        freezeHeader: true,
        autoResize: true,
        alternatingColors: true,
        borders: true
      }
    };
  }

  /**
   * Create Google Docs configuration
   */
  private createDocsConfig(config: ExportConfig): GoogleDocsConfig {
    const content = this.normalizeDataForDocs(config.data);
    
    return {
      title: config.filename || 'NG-UI Export',
      content: content,
      sharing: config.sharing as GoogleSharingSettings,
      template: config.templateId
    };
  }

  /**
   * Normalize data for Google Sheets
   */
  private normalizeDataForSheets(data: any): any[][] {
    if (!data) return [['No data available']];

    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === 'object' && data[0] !== null) {
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(header => item[header] || ''));
        return [headers, ...rows];
      } else {
        return [['Value'], ...data.map(item => [String(item)])];
      }
    }

    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data);
      return [['Property', 'Value'], ...entries.map(([key, value]) => [key, String(value)])];
    }

    return [['Data'], [String(data)]];
  }

  /**
   * Normalize data for Google Docs
   */
  private normalizeDataForDocs(data: any): GoogleDocContent[] {
    const content: GoogleDocContent[] = [];

    if (Array.isArray(data) && data.length > 0) {
      content.push({
        type: 'heading',
        content: 'Data Export',
        formatting: { fontSize: 18, bold: true }
      });

      if (typeof data[0] === 'object' && data[0] !== null) {
        const headers = Object.keys(data[0]);
        const tableData = [headers, ...data.map(item => headers.map(header => String(item[header] || '')))];
        
        content.push({
          type: 'table',
          content: tableData,
          formatting: { borders: true, headerStyle: { bold: true } }
        });
      } else {
        data.forEach((item, index) => {
          content.push({
            type: 'paragraph',
            content: `${index + 1}. ${String(item)}`,
            formatting: { fontSize: 11 }
          });
        });
      }
    } else if (typeof data === 'object' && data !== null) {
      content.push({
        type: 'heading',
        content: 'Object Properties',
        formatting: { fontSize: 18, bold: true }
      });

      Object.entries(data).forEach(([key, value]) => {
        content.push({
          type: 'paragraph',
          content: `${key}: ${String(value)}`,
          formatting: { fontSize: 11 }
        });
      });
    } else {
      content.push({
        type: 'paragraph',
        content: String(data),
        formatting: { fontSize: 11 }
      });
    }

    return content;
  }

  /**
   * Authenticate with Google APIs
   */
  private authenticate(): Observable<any> {
    if (this.accessToken) {
      return from(Promise.resolve({ access_token: this.accessToken }));
    }

    if (!this.credentials) {
      return throwError(() => new Error('Google credentials not provided'));
    }

    // Use service account or OAuth flow based on available credentials
    if (this.credentials.serviceAccountKey) {
      return this.authenticateServiceAccount();
    } else if (this.credentials.accessToken) {
      this.accessToken = this.credentials.accessToken;
      return from(Promise.resolve({ access_token: this.accessToken }));
    } else {
      return this.authenticateOAuth();
    }
  }

  /**
   * Authenticate using service account
   */
  private authenticateServiceAccount(): Observable<any> {
    // Service account authentication would typically be done server-side
    // This is a placeholder implementation
    return throwError(() => new Error('Service account authentication must be implemented server-side'));
  }

  /**
   * Authenticate using OAuth
   */
  private authenticateOAuth(): Observable<any> {
    if (!this.credentials?.clientId) {
      return throwError(() => new Error('OAuth client ID is required'));
    }

    // In a real implementation, this would open OAuth popup
    // For now, we'll assume the access token is provided
    return throwError(() => new Error('OAuth flow must be implemented with proper redirect handling'));
  }

  /**
   * Create new Google Spreadsheet
   */
  private createSpreadsheet(config: GoogleSheetsConfig): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const body = {
      properties: {
        title: config.title
      },
      sheets: config.sheets?.map(sheet => ({
        properties: {
          title: sheet.name,
          gridProperties: {
            rowCount: sheet.data.length,
            columnCount: sheet.data[0]?.length || 1
          }
        }
      }))
    };

    return this.http.post(GOOGLE_APIS.sheets, body, { headers });
  }

  /**
   * Populate spreadsheet with data
   */
  private populateSpreadsheet(spreadsheetId: string, config: GoogleSheetsConfig): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    if (!config.sheets || config.sheets.length === 0) {
      return from(Promise.resolve({ spreadsheetId }));
    }

    const requests = config.sheets.map(sheet => {
      return this.http.put(
        `${GOOGLE_APIS.sheets}/${spreadsheetId}/values/${sheet.name}!A1`,
        {
          values: sheet.data,
          majorDimension: 'ROWS'
        },
        { 
          headers,
          params: { valueInputOption: 'RAW' }
        }
      );
    });

    return from(Promise.all(requests.map(req => req.toPromise()))).pipe(
      map(() => ({ spreadsheetId }))
    );
  }

  /**
   * Format spreadsheet
   */
  private formatSpreadsheet(spreadsheetId: string, config: GoogleSheetsConfig): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const requests: any[] = [];

    if (config.formatting?.freezeHeader) {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId: 0,
            gridProperties: {
              frozenRowCount: 1
            }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      });
    }

    if (config.formatting?.autoResize) {
      requests.push({
        autoResizeDimensions: {
          dimensions: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0
          }
        }
      });
    }

    if (requests.length === 0) {
      return from(Promise.resolve({ spreadsheetId }));
    }

    return this.http.post(
      `${GOOGLE_APIS.sheets}/${spreadsheetId}:batchUpdate`,
      { requests },
      { headers }
    ).pipe(
      map(() => ({ spreadsheetId }))
    );
  }

  /**
   * Create new Google Document
   */
  private createDocument(config: GoogleDocsConfig): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const body = {
      title: config.title
    };

    return this.http.post(GOOGLE_APIS.docs, body, { headers });
  }

  /**
   * Populate document with content
   */
  private populateDocument(documentId: string, config: GoogleDocsConfig): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const requests = this.createDocumentRequests(config.content);

    if (requests.length === 0) {
      return from(Promise.resolve({ documentId }));
    }

    return this.http.post(
      `${GOOGLE_APIS.docs}/${documentId}:batchUpdate`,
      { requests },
      { headers }
    ).pipe(
      map(() => ({ documentId }))
    );
  }

  /**
   * Create document requests from content
   */
  private createDocumentRequests(content: GoogleDocContent[]): any[] {
    const requests: any[] = [];
    let index = 1; // Start after the document title

    content.forEach(item => {
      switch (item.type) {
        case 'heading':
          requests.push({
            insertText: {
              location: { index },
              text: item.content + '\n'
            }
          });
          requests.push({
            updateParagraphStyle: {
              range: {
                startIndex: index,
                endIndex: index + item.content.length
              },
              paragraphStyle: {
                namedStyleType: 'HEADING_1'
              },
              fields: 'namedStyleType'
            }
          });
          index += item.content.length + 1;
          break;

        case 'paragraph':
          requests.push({
            insertText: {
              location: { index },
              text: item.content + '\n'
            }
          });
          index += item.content.length + 1;
          break;

        case 'table':
          // Table insertion is more complex and would require additional implementation
          const tableText = this.convertTableToText(item.content);
          requests.push({
            insertText: {
              location: { index },
              text: tableText + '\n'
            }
          });
          index += tableText.length + 1;
          break;
      }
    });

    return requests;
  }

  /**
   * Convert table data to text representation
   */
  private convertTableToText(tableData: any[][]): string {
    return tableData.map(row => 
      row.map(cell => String(cell)).join(' | ')
    ).join('\n');
  }

  /**
   * Share document with specified settings
   */
  private shareDocument(fileId: string, sharing: GoogleSharingSettings): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const permissions: any[] = [];

    if (sharing.type === 'public') {
      permissions.push({
        type: 'anyone',
        role: sharing.role
      });
    } else if (sharing.users) {
      sharing.users.forEach(email => {
        permissions.push({
          type: 'user',
          role: sharing.role,
          emailAddress: email
        });
      });
    }

    const permissionRequests = permissions.map(permission =>
      this.http.post(
        `${GOOGLE_APIS.drive}/${fileId}/permissions`,
        permission,
        { headers }
      )
    );

    return from(Promise.all(permissionRequests.map(req => req.toPromise()))).pipe(
      map(() => ({ [sharing.type === 'public' ? 'spreadsheetId' : 'documentId']: fileId }))
    );
  }

  /**
   * Set Google credentials
   */
  setCredentials(credentials: GoogleCredentials): void {
    this.credentials = credentials;
    if (credentials.accessToken) {
      this.accessToken = credentials.accessToken;
    }
    if (credentials.refreshToken) {
      this.refreshToken = credentials.refreshToken;
    }
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.credentials = null;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${GOOGLE_APIS.oauth}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    return this.http.post(GOOGLE_APIS.token, body.toString(), { headers }).pipe(
      map((response: any) => {
        this.accessToken = response.access_token;
        this.refreshToken = response.refresh_token;
        return response;
      })
    );
  }
}