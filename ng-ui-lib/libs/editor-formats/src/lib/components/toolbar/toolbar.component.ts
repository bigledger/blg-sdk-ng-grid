import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarButtonComponent } from './toolbar-button.component';
import { ToolbarDropdownComponent, DropdownOption } from './toolbar-dropdown.component';
import { FormattingCommand, FormattingCommandType } from '../../interfaces/formatting-command.interface';
import { EditorCommandService } from '../../services/editor-command.service';

export interface ToolbarGroup {
  name: string;
  commands: FormattingCommand[];
  separator?: boolean;
}

/**
 * Main toolbar component containing all formatting tools
 */
@Component({
  selector: 'ng-ui-editor-toolbar',
  standalone: true,
  imports: [CommonModule, ToolbarButtonComponent, ToolbarDropdownComponent],
  template: `
    <div class="editor-toolbar" [class.compact]="compact()">
      <div class="toolbar-content">
        <ng-container *ngFor="let group of toolbarGroups(); let last = last">
          <div class="toolbar-group" [attr.data-group]="group.name">
            <ng-container *ngFor="let command of group.commands">
              <!-- Regular button commands -->
              <ng-ui-toolbar-button
                *ngIf="!isDropdownCommand(command)"
                [command]="command"
                [showText]="showText()"
                [showShortcut]="showShortcuts()"
                (clicked)="onCommandClicked($event)"
              />
              
              <!-- Font family dropdown -->
              <ng-ui-toolbar-dropdown
                *ngIf="command.id === 'fontFamily'"
                [command]="command"
                [options]="fontFamilyOptions"
                [showText]="showText()"
                [selectedValue]="currentFontFamily"
                (optionSelected)="onFontFamilySelected($event)"
              />
              
              <!-- Font size dropdown -->
              <ng-ui-toolbar-dropdown
                *ngIf="command.id === 'fontSize'"
                [command]="command"
                [options]="fontSizeOptions"
                [showText]="showText()"
                [selectedValue]="currentFontSize"
                (optionSelected)="onFontSizeSelected($event)"
              />
              
              <!-- Text color picker -->
              <div *ngIf="command.id === 'textColor'" class="color-picker-wrapper">
                <ng-ui-toolbar-button
                  [command]="command"
                  [showText]="showText()"
                  [showShortcut]="showShortcuts()"
                  (clicked)="onColorPickerClicked('text')"
                />
                <input
                  type="color"
                  class="color-input"
                  [value]="currentTextColor()"
                  (change)="onTextColorChanged($event)"
                  hidden
                  #textColorPicker
                />
              </div>
              
              <!-- Background color picker -->
              <div *ngIf="command.id === 'backgroundColor'" class="color-picker-wrapper">
                <ng-ui-toolbar-button
                  [command]="command"
                  [showText]="showText()"
                  [showShortcut]="showShortcuts()"
                  (clicked)="onColorPickerClicked('background')"
                />
                <input
                  type="color"
                  class="color-input"
                  [value]="currentBackgroundColor()"
                  (change)="onBackgroundColorChanged($event)"
                  hidden
                  #backgroundColorPicker
                />
              </div>
              
              <!-- Line height dropdown -->
              <ng-ui-toolbar-dropdown
                *ngIf="command.id === 'lineHeight'"
                [command]="command"
                [options]="lineHeightOptions"
                [showText]="showText()"
                [selectedValue]="currentLineHeight"
                (optionSelected)="onLineHeightSelected($event)"
              />
              
              <!-- List style dropdown -->
              <ng-ui-toolbar-dropdown
                *ngIf="command.id === 'listStyle'"
                [command]="command"
                [options]="currentListStyleOptions()"
                [showText]="showText()"
                [selectedValue]="currentListStyle"
                (optionSelected)="onListStyleSelected($event)"
              />
            </ng-container>
          </div>
          
          <!-- Group separator -->
          <div class="toolbar-separator" *ngIf="!last && group.separator"></div>
        </ng-container>
      </div>
      
      <!-- Overflow menu for small screens -->
      <div class="toolbar-overflow" *ngIf="compact()">
        <button type="button" class="overflow-button" (click)="toggleOverflowMenu()">
          <span class="material-icons">more_vert</span>
        </button>
        
        <div class="overflow-menu" *ngIf="showOverflowMenu" (clickOutside)="closeOverflowMenu()">
          <!-- Overflow menu content -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-toolbar {
      display: flex;
      align-items: center;
      padding: 8px;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 4px 4px 0 0;
      gap: 4px;
      flex-wrap: wrap;
      
      &.compact {
        padding: 4px;
        gap: 2px;
        
        .toolbar-group {
          gap: 2px;
        }
      }
    }
    
    .toolbar-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      flex-wrap: wrap;
    }
    
    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .toolbar-separator {
      width: 1px;
      height: 24px;
      background: #d0d0d0;
      margin: 0 4px;
    }
    
    .color-picker-wrapper {
      position: relative;
      display: inline-block;
    }
    
    .color-input {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
    
    .toolbar-overflow {
      margin-left: auto;
    }
    
    .overflow-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid #e0e0e0;
      background: #ffffff;
      color: #333333;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover {
        background: #f5f5f5;
        border-color: #d0d0d0;
      }
    }
    
    .overflow-menu {
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 200px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 4px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .editor-toolbar {
        flex-wrap: wrap;
        
        .toolbar-group {
          flex-wrap: wrap;
        }
      }
    }
  `]
})
export class ToolbarComponent {
  @Input() commands = signal<FormattingCommand[]>([]);
  @Input() compact = signal<boolean>(false);
  @Input() showText = signal<boolean>(false);
  @Input() showShortcuts = signal<boolean>(true);
  @Input() groupLayout = signal<boolean>(true);
  
  @Output() commandExecuted = new EventEmitter<{ command: FormattingCommand; value?: any }>();
  
  private commandService = inject(EditorCommandService);
  
  showOverflowMenu = false;
  currentFontFamily = '';
  currentFontSize = '';
  currentLineHeight = '';
  currentListStyle = '';
  
  private _currentTextColor = signal('#000000');
  private _currentBackgroundColor = signal('#ffffff');
  
  readonly currentTextColor = this._currentTextColor.asReadonly();
  readonly currentBackgroundColor = this._currentBackgroundColor.asReadonly();
  
  readonly toolbarGroups = computed(() => {
    if (!this.groupLayout()) {
      return [{ name: 'all', commands: this.commands(), separator: false }];
    }
    
    const commandsByType = this.commandService.commandsByType();
    const groups: ToolbarGroup[] = [];
    
    // Basic text formatting
    if (commandsByType[FormattingCommandType.BASIC_TEXT]) {
      groups.push({
        name: 'basic',
        commands: commandsByType[FormattingCommandType.BASIC_TEXT],
        separator: true
      });
    }
    
    // Font formatting
    if (commandsByType[FormattingCommandType.FONT]) {
      groups.push({
        name: 'font',
        commands: commandsByType[FormattingCommandType.FONT],
        separator: true
      });
    }
    
    // Color formatting
    if (commandsByType[FormattingCommandType.COLOR]) {
      groups.push({
        name: 'color',
        commands: commandsByType[FormattingCommandType.COLOR],
        separator: true
      });
    }
    
    // Paragraph formatting
    if (commandsByType[FormattingCommandType.PARAGRAPH]) {
      groups.push({
        name: 'paragraph',
        commands: commandsByType[FormattingCommandType.PARAGRAPH],
        separator: true
      });
    }
    
    // Heading formatting
    if (commandsByType[FormattingCommandType.HEADING]) {
      groups.push({
        name: 'heading',
        commands: commandsByType[FormattingCommandType.HEADING],
        separator: true
      });
    }
    
    // List formatting
    if (commandsByType[FormattingCommandType.LIST]) {
      groups.push({
        name: 'list',
        commands: commandsByType[FormattingCommandType.LIST],
        separator: true
      });
    }
    
    // Special formatting
    if (commandsByType[FormattingCommandType.SPECIAL]) {
      groups.push({
        name: 'special',
        commands: commandsByType[FormattingCommandType.SPECIAL],
        separator: false
      });
    }
    
    return groups;
  });
  
  // Dropdown options
  fontFamilyOptions: DropdownOption[] = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Arial Black', value: 'Arial Black, sans-serif' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' }
  ];
  
  fontSizeOptions: DropdownOption[] = [
    { label: '8px', value: '8px' },
    { label: '10px', value: '10px' },
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' },
    { label: '24px', value: '24px' },
    { label: '28px', value: '28px' },
    { label: '32px', value: '32px' },
    { label: '36px', value: '36px' },
    { label: '48px', value: '48px' }
  ];
  
  lineHeightOptions: DropdownOption[] = [
    { label: '1.0', value: '1.0' },
    { label: '1.15', value: '1.15' },
    { label: '1.2', value: '1.2' },
    { label: '1.5', value: '1.5' },
    { label: '2.0', value: '2.0' },
    { label: '2.5', value: '2.5' },
    { label: '3.0', value: '3.0' }
  ];
  
  readonly currentListStyleOptions = computed(() => {
    // This would dynamically change based on current list type
    return [
      { label: '1, 2, 3', value: 'decimal' },
      { label: '01, 02, 03', value: 'decimal-leading-zero' },
      { label: 'a, b, c', value: 'lower-alpha' },
      { label: 'A, B, C', value: 'upper-alpha' },
      { label: 'i, ii, iii', value: 'lower-roman' },
      { label: 'I, II, III', value: 'upper-roman' }
    ];
  });
  
  onCommandClicked(command: FormattingCommand): void {
    this.commandService.executeCommand(command.id);
    this.commandExecuted.emit({ command });
  }
  
  onFontFamilySelected(event: { command: FormattingCommand; option: DropdownOption }): void {
    this.currentFontFamily = event.option.value;
    this.commandService.executeCommand('fontFamily', event.option.value);
    this.commandExecuted.emit({ command: event.command, value: event.option.value });
  }
  
  onFontSizeSelected(event: { command: FormattingCommand; option: DropdownOption }): void {
    this.currentFontSize = event.option.value;
    this.commandService.executeCommand('fontSize', event.option.value);
    this.commandExecuted.emit({ command: event.command, value: event.option.value });
  }
  
  onLineHeightSelected(event: { command: FormattingCommand; option: DropdownOption }): void {
    this.currentLineHeight = event.option.value;
    this.commandService.executeCommand('lineHeight', event.option.value);
    this.commandExecuted.emit({ command: event.command, value: event.option.value });
  }
  
  onListStyleSelected(event: { command: FormattingCommand; option: DropdownOption }): void {
    this.currentListStyle = event.option.value;
    this.commandService.executeCommand('listStyle', event.option.value);
    this.commandExecuted.emit({ command: event.command, value: event.option.value });
  }
  
  onColorPickerClicked(type: 'text' | 'background'): void {
    const input = type === 'text' ? 
      document.querySelector('input[type="color"]#textColorPicker') as HTMLInputElement :
      document.querySelector('input[type="color"]#backgroundColorPicker') as HTMLInputElement;
    
    if (input) {
      input.click();
    }
  }
  
  onTextColorChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this._currentTextColor.set(color);
    
    this.commandService.executeCommand('textColor', color);
    const command = this.commandService.getCommand('textColor');
    if (command) {
      this.commandExecuted.emit({ command, value: color });
    }
  }
  
  onBackgroundColorChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this._currentBackgroundColor.set(color);
    
    this.commandService.executeCommand('backgroundColor', color);
    const command = this.commandService.getCommand('backgroundColor');
    if (command) {
      this.commandExecuted.emit({ command, value: color });
    }
  }
  
  isDropdownCommand(command: FormattingCommand): boolean {
    return ['fontFamily', 'fontSize', 'lineHeight', 'listStyle'].includes(command.id);
  }
  
  toggleOverflowMenu(): void {
    this.showOverflowMenu = !this.showOverflowMenu;
  }
  
  closeOverflowMenu(): void {
    this.showOverflowMenu = false;
  }
}