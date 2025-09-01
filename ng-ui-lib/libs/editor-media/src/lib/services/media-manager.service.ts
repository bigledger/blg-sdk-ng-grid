import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { 
  MediaItem, 
  ImageItem, 
  VideoItem, 
  FileItem,
  MediaType,
  MediaFilter,
  MediaSortBy,
  SortOrder,
  GalleryViewMode,
  MediaOperationResult
} from '../interfaces';

/**
 * Central service for managing media items, filtering, sorting, and gallery operations
 */
@Injectable({
  providedIn: 'root'
})
export class MediaManagerService {
  private readonly _mediaItems = signal<MediaItem[]>([]);
  private readonly _selectedItems = signal<Set<string>>(new Set());
  private readonly _filter = signal<MediaFilter>({});
  private readonly _sortBy = signal<MediaSortBy>('date');
  private readonly _sortOrder = signal<SortOrder>('desc');
  private readonly _viewMode = signal<GalleryViewMode>('grid');
  private readonly _searchQuery = signal<string>('');

  /** All media items */
  readonly allItems = this._mediaItems.asReadonly();

  /** Selected items */
  readonly selectedItems = computed(() => 
    this.allItems().filter(item => this._selectedItems().has(item.id))
  );

  /** Filtered and sorted media items */
  readonly filteredItems = computed(() => {
    let items = this.allItems();
    const filter = this._filter();
    const searchQuery = this._searchQuery().toLowerCase();

    // Apply search query
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.altText?.toLowerCase().includes(searchQuery) ||
        item.caption?.toLowerCase().includes(searchQuery)
      );
    }

    // Apply type filter
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      items = items.filter(item => types.includes(item.type));
    }

    // Apply size filter
    if (filter.sizeRange) {
      items = items.filter(item => {
        if (!item.size) return true;
        const { min, max } = filter.sizeRange!;
        return (!min || item.size >= min) && (!max || item.size <= max);
      });
    }

    // Apply date filter
    if (filter.dateRange) {
      items = items.filter(item => {
        const { from, to } = filter.dateRange!;
        const itemDate = item.createdAt;
        return (!from || itemDate >= from) && (!to || itemDate <= to);
      });
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      items = items.filter(item =>
        filter.tags!.some(tag =>
          item.metadata?.tags?.includes(tag) ||
          item.name.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    // Apply sorting
    const sortBy = this._sortBy();
    const sortOrder = this._sortOrder();

    items.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  });

  /** Image items only */
  readonly imageItems = computed(() =>
    this.filteredItems().filter((item): item is ImageItem => item.type === 'image')
  );

  /** Video items only */
  readonly videoItems = computed(() =>
    this.filteredItems().filter((item): item is VideoItem => item.type === 'video')
  );

  /** File items only */
  readonly fileItems = computed(() =>
    this.filteredItems().filter((item): item is FileItem => item.type === 'file')
  );

  /** Statistics */
  readonly stats = computed(() => {
    const items = this.allItems();
    return {
      total: items.length,
      images: items.filter(item => item.type === 'image').length,
      videos: items.filter(item => item.type === 'video').length,
      files: items.filter(item => item.type === 'file').length,
      totalSize: items.reduce((sum, item) => sum + (item.size || 0), 0),
      selected: this._selectedItems().size
    };
  });

  /** Current view mode */
  readonly viewMode = this._viewMode.asReadonly();

  /** Current filter */
  readonly currentFilter = this._filter.asReadonly();

  /** Current sort settings */
  readonly currentSort = computed(() => ({
    sortBy: this._sortBy(),
    sortOrder: this._sortOrder()
  }));

  // Observables for external subscribers
  private readonly itemAdded$ = new Subject<MediaItem>();
  private readonly itemRemoved$ = new Subject<string>();
  private readonly itemUpdated$ = new Subject<MediaItem>();
  private readonly selectionChanged$ = new Subject<string[]>();
  private readonly filterChanged$ = new Subject<MediaFilter>();

  constructor() {}

  /**
   * Add media item
   */
  addItem(item: MediaItem): MediaOperationResult<MediaItem> {
    try {
      // Check for duplicates
      const existing = this.allItems().find(existing => 
        existing.name === item.name && existing.size === item.size
      );

      if (existing) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR' as any,
            message: 'Item already exists'
          }
        };
      }

      this._mediaItems.update(items => [...items, item]);
      this.itemAdded$.next(item);

      return { success: true, data: item };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'PROCESSING_FAILED' as any,
          message: error instanceof Error ? error.message : 'Failed to add item'
        }
      };
    }
  }

  /**
   * Add multiple items
   */
  addItems(items: MediaItem[]): MediaOperationResult<MediaItem[]> {
    try {
      const newItems = items.filter(item => 
        !this.allItems().some(existing => 
          existing.name === item.name && existing.size === item.size
        )
      );

      this._mediaItems.update(current => [...current, ...newItems]);
      newItems.forEach(item => this.itemAdded$.next(item));

      return { success: true, data: newItems };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'PROCESSING_FAILED' as any,
          message: error instanceof Error ? error.message : 'Failed to add items'
        }
      };
    }
  }

  /**
   * Remove media item
   */
  removeItem(id: string): MediaOperationResult<void> {
    try {
      const item = this.allItems().find(item => item.id === id);
      if (!item) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR' as any,
            message: 'Item not found'
          }
        };
      }

      this._mediaItems.update(items => items.filter(item => item.id !== id));
      this._selectedItems.update(selected => {
        const newSelected = new Set(selected);
        newSelected.delete(id);
        return newSelected;
      });

      this.itemRemoved$.next(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'PROCESSING_FAILED' as any,
          message: error instanceof Error ? error.message : 'Failed to remove item'
        }
      };
    }
  }

  /**
   * Update media item
   */
  updateItem(id: string, updates: Partial<MediaItem>): MediaOperationResult<MediaItem> {
    try {
      const itemIndex = this.allItems().findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR' as any,
            message: 'Item not found'
          }
        };
      }

      this._mediaItems.update(items => {
        const newItems = [...items];
        newItems[itemIndex] = { ...newItems[itemIndex], ...updates, updatedAt: new Date() };
        return newItems;
      });

      const updatedItem = this.allItems()[itemIndex];
      this.itemUpdated$.next(updatedItem);

      return { success: true, data: updatedItem };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'PROCESSING_FAILED' as any,
          message: error instanceof Error ? error.message : 'Failed to update item'
        }
      };
    }
  }

  /**
   * Get item by ID
   */
  getItem(id: string): MediaItem | undefined {
    return this.allItems().find(item => item.id === id);
  }

  /**
   * Select item
   */
  selectItem(id: string): void {
    this._selectedItems.update(selected => new Set([...selected, id]));
    this.selectionChanged$.next(Array.from(this._selectedItems()));
  }

  /**
   * Deselect item
   */
  deselectItem(id: string): void {
    this._selectedItems.update(selected => {
      const newSelected = new Set(selected);
      newSelected.delete(id);
      return newSelected;
    });
    this.selectionChanged$.next(Array.from(this._selectedItems()));
  }

  /**
   * Toggle item selection
   */
  toggleSelection(id: string): void {
    if (this._selectedItems().has(id)) {
      this.deselectItem(id);
    } else {
      this.selectItem(id);
    }
  }

  /**
   * Select multiple items
   */
  selectItems(ids: string[]): void {
    this._selectedItems.update(selected => new Set([...selected, ...ids]));
    this.selectionChanged$.next(Array.from(this._selectedItems()));
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this._selectedItems.set(new Set());
    this.selectionChanged$.next([]);
  }

  /**
   * Select all filtered items
   */
  selectAll(): void {
    const allIds = this.filteredItems().map(item => item.id);
    this.selectItems(allIds);
  }

  /**
   * Set filter
   */
  setFilter(filter: MediaFilter): void {
    this._filter.set(filter);
    this.filterChanged$.next(filter);
  }

  /**
   * Update filter
   */
  updateFilter(partialFilter: Partial<MediaFilter>): void {
    this._filter.update(current => ({ ...current, ...partialFilter }));
    this.filterChanged$.next(this._filter());
  }

  /**
   * Clear filter
   */
  clearFilter(): void {
    this._filter.set({});
    this.filterChanged$.next({});
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  /**
   * Set sort settings
   */
  setSorting(sortBy: MediaSortBy, sortOrder: SortOrder): void {
    this._sortBy.set(sortBy);
    this._sortOrder.set(sortOrder);
  }

  /**
   * Set view mode
   */
  setViewMode(mode: GalleryViewMode): void {
    this._viewMode.set(mode);
  }

  /**
   * Get items by type
   */
  getItemsByType(type: MediaType): MediaItem[] {
    return this.filteredItems().filter(item => item.type === type);
  }

  /**
   * Get recent items
   */
  getRecentItems(count: number = 10): MediaItem[] {
    return this.allItems()
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, count);
  }

  /**
   * Export selected items metadata
   */
  exportSelectedItems(): MediaItem[] {
    return this.selectedItems();
  }

  /**
   * Clear all items
   */
  clear(): void {
    this._mediaItems.set([]);
    this._selectedItems.set(new Set());
  }

  // Observable getters
  get onItemAdded(): Observable<MediaItem> {
    return this.itemAdded$.asObservable();
  }

  get onItemRemoved(): Observable<string> {
    return this.itemRemoved$.asObservable();
  }

  get onItemUpdated(): Observable<MediaItem> {
    return this.itemUpdated$.asObservable();
  }

  get onSelectionChanged(): Observable<string[]> {
    return this.selectionChanged$.asObservable();
  }

  get onFilterChanged(): Observable<MediaFilter> {
    return this.filterChanged$.asObservable();
  }
}