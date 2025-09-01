import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormattingCommand } from '../../interfaces/formatting-command.interface';

/**
 * Toolbar button component for formatting commands
 */
@Component({
  selector: 'ng-ui-toolbar-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="toolbar-button"
      [class.active]="isActive()"
      [class.disabled]="isDisabled()"
      [disabled]="isDisabled()"
      [title]="tooltipText()"
      (click)="onClick()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <span class="button-icon" [class]="iconClass()"></span>
      <span class="button-text" *ngIf="showText">{{ command().name }}</span>
      <span class="keyboard-shortcut" *ngIf="showShortcut && command().shortcut">
        {{ command().shortcut }}
      </span>
    </button>
  `,
  styles: [`
    .toolbar-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 4px 8px;
      border: 1px solid #e0e0e0;
      background: #ffffff;
      color: #333333;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      gap: 4px;
      position: relative;
      
      &:hover:not(:disabled) {
        background: #f5f5f5;
        border-color: #d0d0d0;
      }
      
      &:active:not(:disabled) {
        background: #e8e8e8;
        transform: translateY(1px);
      }
      
      &.active {
        background: #2196f3;
        color: #ffffff;
        border-color: #1976d2;
        
        &:hover:not(:disabled) {
          background: #1976d2;
        }
      }
      
      &:disabled,
      &.disabled {
        background: #f9f9f9;
        color: #cccccc;
        border-color: #f0f0f0;
        cursor: not-allowed;
      }
      
      .button-icon {
        font-size: 16px;
        line-height: 1;
        
        /* Material Icons support */
        &.material-icons {
          font-family: 'Material Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 18px;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings: 'liga';
        }
      }
      
      .button-text {
        font-size: 12px;
        white-space: nowrap;
      }
      
      .keyboard-shortcut {
        font-size: 10px;
        opacity: 0.7;
        margin-left: auto;
      }
    }
    
    /* Tooltip styles */
    .toolbar-button[title]:hover::after {
      content: attr(title);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      margin-bottom: 4px;
      pointer-events: none;
    }
    
    .toolbar-button[title]:hover::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      pointer-events: none;
    }
  `]
})
export class ToolbarButtonComponent {
  @Input({ required: true }) command = signal<FormattingCommand>({} as FormattingCommand);
  @Input() showText = signal<boolean>(false);
  @Input() showShortcut = signal<boolean>(true);
  @Input() size = signal<'small' | 'medium' | 'large'>('medium');
  
  @Output() clicked = new EventEmitter<FormattingCommand>();
  @Output() hovered = new EventEmitter<{ command: FormattingCommand; hovered: boolean }>();
  
  private _isHovered = signal(false);
  
  readonly isActive = computed(() => this.command()?.isActive || false);
  readonly isDisabled = computed(() => this.command()?.isEnabled === false);
  readonly iconClass = computed(() => {
    const icon = this.command()?.icon;
    if (!icon) return '';
    
    // Support both material icons and custom icon classes
    if (icon.startsWith('mat-') || icon.startsWith('material-')) {
      return `material-icons ${icon}`;
    }
    
    return icon;
  });
  
  readonly tooltipText = computed(() => {
    const cmd = this.command();
    if (!cmd) return '';
    
    let tooltip = cmd.description || cmd.name;
    if (cmd.shortcut && this.showShortcut()) {
      tooltip += ` (${cmd.shortcut})`;
    }
    
    return tooltip;
  });
  
  onClick(): void {
    const cmd = this.command();
    if (cmd && cmd.isEnabled !== false) {
      this.clicked.emit(cmd);
    }
  }
  
  onMouseEnter(): void {
    this._isHovered.set(true);
    this.hovered.emit({ command: this.command(), hovered: true });
  }
  
  onMouseLeave(): void {
    this._isHovered.set(false);
    this.hovered.emit({ command: this.command(), hovered: false });
  }
}