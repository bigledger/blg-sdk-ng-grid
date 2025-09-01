import { Injectable } from '@angular/core';

/**
 * Editor Formats Service
 * Handles text formatting operations
 */
@Injectable({
  providedIn: 'root'
})
export class EditorFormatsService {
  formatBold(text: string): string {
    return `<strong>${text}</strong>`;
  }

  formatItalic(text: string): string {
    return `<em>${text}</em>`;
  }
}