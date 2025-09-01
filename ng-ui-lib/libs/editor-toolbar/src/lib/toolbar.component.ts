import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorExportComponent, ExportConfig, ExportResult } from '@ng-ui/editor-core';

/**
 * Editor Toolbar Component
 * Provides toolbar interface for editor commands with integrated export functionality
 */
@Component({
  selector: 'ng-ui-editor-toolbar',
  standalone: true,
  imports: [CommonModule, EditorExportComponent],
  template: `
    <div class="blg-editor-toolbar">
      <!-- Standard toolbar groups -->
      <div class="blg-toolbar-group" *ngFor="let group of toolbarGroups()">
        <button 
          *ngFor="let tool of group.tools"
          class="blg-toolbar-button"
          [disabled]="disabled()"
          (click)="executeCommand(tool)">
          {{ tool }}
        </button>
      </div>
      
      <!-- Export functionality -->
      <div class="blg-toolbar-group blg-toolbar-group--export">
        <ng-ui-editor-export
          [disabled]="disabled()"
          (exportStarted)="onExportStarted($event)"
          (exportCompleted)="onExportCompleted($event)"
          (exportFailed)="onExportFailed($event)">
        </ng-ui-editor-export>
      </div>
    </div>
  `,
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorToolbarComponent {
  disabled = input(false);
  toolbarGroups = input<any[]>([]);
  showExport = input(true);
  
  commandExecuted = output<string>();
  exportStarted = output<ExportConfig>();
  exportCompleted = output<ExportResult>();
  exportFailed = output<string>();

  executeCommand(command: string): void {
    this.commandExecuted.emit(command);
  }

  onExportStarted(config: ExportConfig): void {
    this.exportStarted.emit(config);
  }

  onExportCompleted(result: ExportResult): void {
    this.exportCompleted.emit(result);
  }

  onExportFailed(error: string): void {
    this.exportFailed.emit(error);
  }
}