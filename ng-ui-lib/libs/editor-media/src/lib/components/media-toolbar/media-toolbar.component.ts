import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaItem, MediaToolbarAction } from '../../interfaces';

/**
 * Media toolbar with quick controls and image properties
 */
@Component({
  selector: 'ng-ui-media-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blg-media-toolbar" *ngIf="selectedItems().length > 0">
      <div class="toolbar-section">
        <span class="selection-count">{{ selectedItems().length }} selected</span>
      </div>
      
      <div class="toolbar-actions">
        <button type="button" 
                class="toolbar-btn"
                *ngFor="let action of visibleActions()"
                (click)="executeAction(action)"
                [title]="action.label">
          <i [class]="action.icon"></i>
          {{ action.label }}
        </button>
      </div>

      <div class="toolbar-section">
        <button type="button" class="toolbar-btn secondary" (click)="clearSelection()">
          Clear Selection
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./media-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaToolbarComponent {
  readonly selectedItems = input.required<MediaItem[]>();
  readonly actions = input<MediaToolbarAction[]>([]);
  
  readonly actionExecuted = output<{ action: MediaToolbarAction, items: MediaItem[] }>();
  readonly selectionCleared = output<void>();

  private readonly _visibleActions = signal<MediaToolbarAction[]>([]);

  readonly visibleActions = this._visibleActions.asReadonly();

  executeAction(action: MediaToolbarAction): void {
    this.actionExecuted.emit({ action, items: this.selectedItems() });
  }

  clearSelection(): void {
    this.selectionCleared.emit();
  }
}