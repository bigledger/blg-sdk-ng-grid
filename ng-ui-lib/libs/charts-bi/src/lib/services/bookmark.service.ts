import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

interface Bookmark {
  id: string;
  dashboardId: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  drillDownStack: string[];
  viewState?: ViewState;
  tags?: string[];
  isPublic: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ViewState {
  selectedWidgets?: string[];
  widgetStates?: Record<string, any>;
  zoom?: number;
  scroll?: { x: number; y: number };
}

interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  bookmarks: string[];
  parentId?: string;
  isSystem: boolean;
  createdBy: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private readonly storageKey = 'bi_dashboard_bookmarks';
  private readonly foldersKey = 'bi_dashboard_bookmark_folders';
  
  private bookmarks$ = new BehaviorSubject<Bookmark[]>([]);
  private folders$ = new BehaviorSubject<BookmarkFolder[]>([]);

  readonly bookmarks = this.bookmarks$.asObservable();
  readonly folders = this.folders$.asObservable();

  constructor(private http: HttpClient) {
    this.loadBookmarks();
    this.loadFolders();
  }

  /**
   * Save a new bookmark
   */
  saveBookmark(dashboardId: string, bookmarkData: Partial<Bookmark>): Observable<string> {
    const bookmark: Bookmark = {
      id: this.generateId(),
      dashboardId,
      name: bookmarkData.name || 'Unnamed Bookmark',
      description: bookmarkData.description,
      filters: bookmarkData.filters || {},
      drillDownStack: bookmarkData.drillDownStack || [],
      viewState: bookmarkData.viewState,
      tags: bookmarkData.tags || [],
      isPublic: bookmarkData.isPublic || false,
      isDefault: bookmarkData.isDefault || false,
      createdBy: this.getCurrentUser(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.persistBookmark(bookmark).pipe(
      tap(() => {
        const currentBookmarksValue = this.bookmarks$.value;
        this.bookmarks$.next([...currentBookmarksValue, bookmark]);
      }),
      map(() => bookmark.id)
    );
  }

  /**
   * Load a bookmark by ID
   */
  loadBookmark(bookmarkId: string): Observable<Bookmark> {
    const bookmark = this.bookmarks$.value.find(b => b.id === bookmarkId);
    
    if (bookmark) {
      return of(bookmark);
    }
    
    // Try to load from server if not in local state
    return this.fetchBookmark(bookmarkId);
  }

  /**
   * Update existing bookmark
   */
  updateBookmark(bookmarkId: string, updates: Partial<Bookmark>): Observable<void> {
    const bookmark = this.bookmarks$.value.find(b => b.id === bookmarkId);
    
    if (!bookmark) {
      throw new Error(`Bookmark not found: ${bookmarkId}`);
    }

    const updatedBookmark: Bookmark = {
      ...bookmark,
      ...updates,
      updatedAt: new Date()
    };

    return this.persistBookmark(updatedBookmark).pipe(
      tap(() => {
        const bookmarksValue = this.bookmarks$.value;
        const index = bookmarksValue.findIndex(b => b.id === bookmarkId);
        if (index !== -1) {
          const updatedBookmarksValue = [...bookmarksValue];
          updatedBookmarksValue[index] = updatedBookmark;
          this.bookmarks$.next(updatedBookmarksValue);
        }
      })
    );
  }

  /**
   * Delete bookmark
   */
  deleteBookmark(bookmarkId: string): Observable<void> {
    return this.removeBookmark(bookmarkId).pipe(
      tap(() => {
        const bookmarksValue = this.bookmarks$.value;
        this.bookmarks$.next(bookmarksValue.filter(b => b.id !== bookmarkId));
      })
    );
  }

  /**
   * Get bookmarks for specific dashboard
   */
  getBookmarksForDashboard(dashboardId: string): Observable<Bookmark[]> {
    return this.bookmarks.pipe(
      map(bookmarks => bookmarks.filter(b => b.dashboardId === dashboardId))
    );
  }

  /**
   * Get public bookmarks
   */
  getPublicBookmarks(): Observable<Bookmark[]> {
    return this.bookmarks.pipe(
      map(bookmarks => bookmarks.filter(b => b.isPublic))
    );
  }

  /**
   * Get user's bookmarks
   */
  getUserBookmarks(userId?: string): Observable<Bookmark[]> {
    const currentUser = userId || this.getCurrentUser();
    return this.bookmarks.pipe(
      map(bookmarks => bookmarks.filter(b => b.createdBy === currentUser))
    );
  }

  /**
   * Search bookmarks
   */
  searchBookmarks(query: string, filters?: BookmarkSearchFilters): Observable<Bookmark[]> {
    return this.bookmarks.pipe(
      map(bookmarks => {
        let filtered = bookmarks;

        // Text search
        if (query.trim()) {
          const searchTerm = query.toLowerCase();
          filtered = filtered.filter(bookmark =>
            bookmark.name.toLowerCase().includes(searchTerm) ||
            bookmark.description?.toLowerCase().includes(searchTerm) ||
            bookmark.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }

        // Apply filters
        if (filters) {
          if (filters.dashboardId) {
            filtered = filtered.filter(b => b.dashboardId === filters.dashboardId);
          }
          if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(b => 
              filters.tags!.some(tag => b.tags?.includes(tag))
            );
          }
          if (filters.isPublic !== undefined) {
            filtered = filtered.filter(b => b.isPublic === filters.isPublic);
          }
          if (filters.createdBy) {
            filtered = filtered.filter(b => b.createdBy === filters.createdBy);
          }
          if (filters.dateRange) {
            filtered = filtered.filter(b => {
              const createdDate = new Date(b.createdAt);
              return createdDate >= filters.dateRange!.start && 
                     createdDate <= filters.dateRange!.end;
            });
          }
        }

        return filtered;
      })
    );
  }

  /**
   * Create bookmark folder
   */
  createFolder(folderData: Partial<BookmarkFolder>): Observable<string> {
    const folder: BookmarkFolder = {
      id: this.generateId(),
      name: folderData.name || 'New Folder',
      description: folderData.description,
      bookmarks: folderData.bookmarks || [],
      parentId: folderData.parentId,
      isSystem: false,
      createdBy: this.getCurrentUser(),
      createdAt: new Date()
    };

    return this.persistFolder(folder).pipe(
      tap(() => {
        const currentFoldersValue = this.folders$.value;
        this.folders$.next([...currentFoldersValue, folder]);
      }),
      map(() => folder.id)
    );
  }

  /**
   * Update folder
   */
  updateFolder(folderId: string, updates: Partial<BookmarkFolder>): Observable<void> {
    const folder = this.folders$.value.find(f => f.id === folderId);
    
    if (!folder) {
      throw new Error(`Folder not found: ${folderId}`);
    }

    const updatedFolder: BookmarkFolder = {
      ...folder,
      ...updates
    };

    return this.persistFolder(updatedFolder).pipe(
      tap(() => {
        const foldersValue = this.folders$.value;
        const index = foldersValue.findIndex(f => f.id === folderId);
        if (index !== -1) {
          const updatedFoldersValue = [...foldersValue];
          updatedFoldersValue[index] = updatedFolder;
          this.folders$.next(updatedFoldersValue);
        }
      })
    );
  }

  /**
   * Delete folder
   */
  deleteFolder(folderId: string, moveBookmarks?: string): Observable<void> {
    const folder = this.folders$.value.find(f => f.id === folderId);
    
    if (!folder) {
      throw new Error(`Folder not found: ${folderId}`);
    }

    if (folder.isSystem) {
      throw new Error('Cannot delete system folder');
    }

    // Move bookmarks if specified
    if (moveBookmarks && folder.bookmarks.length > 0) {
      return this.moveBookmarksToFolder(folder.bookmarks, moveBookmarks).pipe(
        tap(() => this.removeFolderFromState(folderId))
      );
    }

    return this.removeFolder(folderId).pipe(
      tap(() => this.removeFolderFromState(folderId))
    );
  }

  /**
   * Move bookmark to folder
   */
  moveBookmarkToFolder(bookmarkId: string, folderId: string): Observable<void> {
    return this.moveBookmarksToFolder([bookmarkId], folderId);
  }

  /**
   * Move multiple bookmarks to folder
   */
  moveBookmarksToFolder(bookmarkIds: string[], folderId: string): Observable<void> {
    // Remove from current folders
    const foldersValue = this.folders$.value.map(folder => ({
      ...folder,
      bookmarks: folder.bookmarks.filter(id => !bookmarkIds.includes(id))
    }));

    // Add to target folder
    const targetFolderIndex = foldersValue.findIndex(f => f.id === folderId);
    if (targetFolderIndex !== -1) {
      foldersValue[targetFolderIndex] = {
        ...foldersValue[targetFolderIndex],
        bookmarks: [...foldersValue[targetFolderIndex].bookmarks, ...bookmarkIds]
      };
    }

    this.folders$.next(foldersValue);
    return this.persistAllFolders(foldersValue);
  }

  /**
   * Get folder hierarchy
   */
  getFolderHierarchy(): Observable<FolderNode[]> {
    return this.folders.pipe(
      map(folders => this.buildFolderHierarchy(folders))
    );
  }

  /**
   * Set default bookmark for dashboard
   */
  setDefaultBookmark(dashboardId: string, bookmarkId: string): Observable<void> {
    const bookmarksValue = this.bookmarks$.value.map(bookmark => ({
      ...bookmark,
      isDefault: bookmark.dashboardId === dashboardId ? 
        (bookmark.id === bookmarkId) : bookmark.isDefault
    }));

    this.bookmarks$.next(bookmarksValue);
    return this.persistAllBookmarks(bookmarksValue);
  }

  /**
   * Get default bookmark for dashboard
   */
  getDefaultBookmark(dashboardId: string): Observable<Bookmark | null> {
    return this.bookmarks.pipe(
      map(bookmarks => {
        const defaultBookmark = bookmarks.find(b => 
          b.dashboardId === dashboardId && b.isDefault
        );
        return defaultBookmark || null;
      })
    );
  }

  /**
   * Share bookmark (make public)
   */
  shareBookmark(bookmarkId: string, isPublic: boolean = true): Observable<void> {
    return this.updateBookmark(bookmarkId, { isPublic });
  }

  /**
   * Duplicate bookmark
   */
  duplicateBookmark(bookmarkId: string, newName?: string): Observable<string> {
    const original = this.bookmarks$.value.find(b => b.id === bookmarkId);
    
    if (!original) {
      throw new Error(`Bookmark not found: ${bookmarkId}`);
    }

    const duplicated = {
      ...original,
      name: newName || `${original.name} (Copy)`,
      isDefault: false // Duplicates are never default
    };

    delete (duplicated as any).id; // Remove ID to create new one

    return this.saveBookmark(original.dashboardId, duplicated);
  }

  /**
   * Export bookmarks
   */
  exportBookmarks(bookmarkIds?: string[]): Observable<BookmarkExport> {
    return this.bookmarks.pipe(
      map(bookmarks => {
        const toExport = bookmarkIds ? 
          bookmarks.filter(b => bookmarkIds.includes(b.id)) : 
          bookmarks;

        const folders = this.folders$.value.filter(f => 
          f.bookmarks.some(id => toExport.some(b => b.id === id))
        );

        return {
          version: '1.0',
          exportedAt: new Date(),
          bookmarks: toExport,
          folders: folders
        };
      })
    );
  }

  /**
   * Import bookmarks
   */
  importBookmarks(exportData: BookmarkExport): Observable<ImportResult> {
    const results: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    // Import folders first
    const folderImports = exportData.folders?.map(folder => {
      const existingFolder = this.folders$.value.find(f => f.name === folder.name);
      if (!existingFolder) {
        return this.createFolder(folder).pipe(
          tap(() => results.imported++),
          catchError(error => {
            results.errors.push(`Folder ${folder.name}: ${error.message}`);
            return of(null);
          })
        );
      } else {
        results.skipped++;
        return of(existingFolder.id);
      }
    }) || [];

    // Then import bookmarks
    const bookmarkImports = exportData.bookmarks.map(bookmark => {
      const existing = this.bookmarks$.value.find(b => 
        b.name === bookmark.name && b.dashboardId === bookmark.dashboardId
      );
      
      if (!existing) {
        return this.saveBookmark(bookmark.dashboardId, bookmark).pipe(
          tap(() => results.imported++),
          catchError(error => {
            results.errors.push(`Bookmark ${bookmark.name}: ${error.message}`);
            return of(null);
          })
        );
      } else {
        results.skipped++;
        return of(existing.id);
      }
    });

    return of(results); // Simplified for now
  }

  // Private helper methods

  private loadBookmarks(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const bookmarks = JSON.parse(stored).map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt)
        }));
        this.bookmarks$.next(bookmarks);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }

  private loadFolders(): void {
    const stored = localStorage.getItem(this.foldersKey);
    if (stored) {
      try {
        const folders = JSON.parse(stored).map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt)
        }));
        this.folders$.next(folders);
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    } else {
      // Create default folders
      this.createDefaultFolders();
    }
  }

  private createDefaultFolders(): void {
    const defaultFolders: BookmarkFolder[] = [
      {
        id: 'default',
        name: 'Default',
        description: 'Default bookmark folder',
        bookmarks: [],
        isSystem: true,
        createdBy: 'system',
        createdAt: new Date()
      },
      {
        id: 'shared',
        name: 'Shared',
        description: 'Shared bookmarks from other users',
        bookmarks: [],
        isSystem: true,
        createdBy: 'system',
        createdAt: new Date()
      }
    ];

    this.folders$.next(defaultFolders);
    this.persistAllFolders(defaultFolders).subscribe();
  }

  private generateId(): string {
    return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUser(): string {
    // This would get the current user from authentication service
    return 'current_user';
  }

  private persistBookmark(bookmark: Bookmark): Observable<void> {
    // In a real app, this would save to server
    const bookmarksValue = this.bookmarks$.value;
    const index = bookmarksValue.findIndex(b => b.id === bookmark.id);
    
    let updated: Bookmark[];
    if (index !== -1) {
      updated = [...bookmarksValue];
      updated[index] = bookmark;
    } else {
      updated = [...bookmarksValue, bookmark];
    }

    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return of(void 0);
  }

  private persistAllBookmarks(bookmarks: Bookmark[]): Observable<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
    return of(void 0);
  }

  private persistFolder(folder: BookmarkFolder): Observable<void> {
    const foldersValue = this.folders$.value;
    const index = foldersValue.findIndex(f => f.id === folder.id);
    
    let updated: BookmarkFolder[];
    if (index !== -1) {
      updated = [...foldersValue];
      updated[index] = folder;
    } else {
      updated = [...foldersValue, folder];
    }

    localStorage.setItem(this.foldersKey, JSON.stringify(updated));
    return of(void 0);
  }

  private persistAllFolders(folders: BookmarkFolder[]): Observable<void> {
    localStorage.setItem(this.foldersKey, JSON.stringify(folders));
    return of(void 0);
  }

  private removeBookmark(bookmarkId: string): Observable<void> {
    // In a real app, this would delete from server
    return of(void 0);
  }

  private removeFolder(folderId: string): Observable<void> {
    // In a real app, this would delete from server
    return of(void 0);
  }

  private fetchBookmark(bookmarkId: string): Observable<Bookmark> {
    // In a real app, this would fetch from server
    throw new Error(`Bookmark not found: ${bookmarkId}`);
  }

  private removeFolderFromState(folderId: string): void {
    const foldersValue = this.folders$.value;
    this.folders$.next(foldersValue.filter(f => f.id !== folderId));
  }

  private buildFolderHierarchy(folders: BookmarkFolder[]): FolderNode[] {
    const folderMap = new Map<string, FolderNode>();
    const rootNodes: FolderNode[] = [];

    // Create nodes
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: []
      });
    });

    // Build hierarchy
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }
}

// Supporting interfaces
interface BookmarkSearchFilters {
  dashboardId?: string;
  tags?: string[];
  isPublic?: boolean;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface FolderNode extends BookmarkFolder {
  children: FolderNode[];
}

interface BookmarkExport {
  version: string;
  exportedAt: Date;
  bookmarks: Bookmark[];
  folders?: BookmarkFolder[];
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}