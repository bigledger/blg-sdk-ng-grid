import { Component, Input, Output, EventEmitter, computed, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormattingCommand } from '../../interfaces/formatting-command.interface';

export interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
  description?: string;
  separator?: boolean;
}

/**
 * Toolbar dropdown component for formatting commands with multiple options
 */
@Component({
  selector: 'ng-ui-toolbar-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toolbar-dropdown" [class.open]="isOpen()">
      <button
        #triggerButton
        type="button"
        class="dropdown-trigger"
        [class.active]="command().isActive"
        [class.disabled]="isDisabled()"
        [disabled]="isDisabled()"
        [title]="tooltipText()"
        (click)="toggleDropdown()"
      >
        <span class="button-icon" [class]="iconClass()"></span>
        <span class="button-text" *ngIf="showText">{{ command().name }}</span>
        <span class="dropdown-arrow">▼</span>
      </button>
      
      <div class="dropdown-menu" *ngIf="isOpen()" #dropdownMenu>
        <div 
          *ngFor="let option of options()" 
          class="dropdown-item"
          [class.separator]="option.separator"
          [class.selected]="isSelected(option)"
          (click)="selectOption(option)"
        >
          <span class="item-icon" *ngIf="option.icon" [class]="option.icon"></span>
          <div class="item-content">
            <span class="item-label">{{ option.label }}</span>
            <span class="item-description" *ngIf="option.description">{{ option.description }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop to close dropdown -->
    <div class="dropdown-backdrop" *ngIf="isOpen()" (click)="closeDropdown()"></div>
  `,
  styles: [`
    .toolbar-dropdown {
      position: relative;
      display: inline-block;
    }
    
    .dropdown-trigger {
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
      
      &:hover:not(:disabled) {
        background: #f5f5f5;
        border-color: #d0d0d0;
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
      }
      
      .button-text {
        font-size: 12px;
        white-space: nowrap;
      }
      
      .dropdown-arrow {
        font-size: 10px;
        transition: transform 0.2s ease;
      }
    }
    
    .toolbar-dropdown.open .dropdown-trigger .dropdown-arrow {
      transform: rotate(180deg);
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 200px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 2px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      gap: 8px;
      
      &:hover {
        background: #f5f5f5;
      }
      
      &.selected {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      &.separator {
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 4px;
        padding-bottom: 12px;
      }
      
      .item-icon {
        font-size: 16px;
        width: 16px;
        text-align: center;
        
        &.material-icons {
          font-family: 'Material Icons';
          font-size: 18px;
        }
      }
      
      .item-content {
        flex: 1;
        
        .item-label {
          display: block;
          font-size: 14px;
          line-height: 1.2;
        }
        
        .item-description {
          display: block;
          font-size: 12px;
          color: #666666;
          margin-top: 2px;
        }
      }
    }
    
    .dropdown-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
      background: transparent;
    }
    
    /* Tooltip styles */
    .dropdown-trigger[title]:hover::after {
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
      z-index: 1001;
      margin-bottom: 4px;
      pointer-events: none;
    }
    
    .dropdown-trigger[title]:hover::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.8);
      z-index: 1001;
      pointer-events: none;
    }
  `]
})
export class ToolbarDropdownComponent {
  @ViewChild('triggerButton') triggerButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef<HTMLDivElement>;
  
  @Input({ required: true }) command = signal<FormattingCommand>({} as FormattingCommand);
  @Input({ required: true }) options = signal<DropdownOption[]>([]);
  @Input() showText = signal<boolean>(false);
  @Input() selectedValue = signal<any>(null);
  
  @Output() optionSelected = new EventEmitter<{ command: FormattingCommand; option: DropdownOption }>();
  @Output() dropdownOpened = new EventEmitter<FormattingCommand>();
  @Output() dropdownClosed = new EventEmitter<FormattingCommand>();
  
  private _isOpen = signal(false);
  
  readonly isOpen = this._isOpen.asReadonly();
  readonly isDisabled = computed(() => this.command()?.isEnabled === false);
  
  readonly iconClass = computed(() => {
    const icon = this.command()?.icon;
    if (!icon) return '';
    
    if (icon.startsWith('mat-') || icon.startsWith('material-')) {
      return `material-icons ${icon}`;
    }
    
    return icon;
  });
  
  readonly tooltipText = computed(() => {
    const cmd = this.command();
    if (!cmd) return '';
    
    let tooltip = cmd.description || cmd.name;
    if (cmd.shortcut) {
      tooltip += ` (${cmd.shortcut})`;
    }
    
    return tooltip;
  });
  
  toggleDropdown(): void {
    if (this.isDisabled()) return;
    
    if (this._isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }
  
  openDropdown(): void {
    this._isOpen.set(true);
    this.dropdownOpened.emit(this.command());
    
    // Position dropdown menu
    setTimeout(() => {
      this.positionDropdown();
    });
  }
  
  closeDropdown(): void {
    this._isOpen.set(false);
    this.dropdownClosed.emit(this.command());
  }
  
  selectOption(option: DropdownOption): void {
    if (option.separator) return;
    
    this.selectedValue.set(option.value);
    this.optionSelected.emit({ command: this.command(), option });
    this.closeDropdown();
  }
  
  isSelected(option: DropdownOption): boolean {
    return this.selectedValue() === option.value;
  }
  
  private positionDropdown(): void {
    if (!this.dropdownMenu || !this.triggerButton) return;
    
    const menu = this.dropdownMenu.nativeElement;
    const trigger = this.triggerButton.nativeElement;
    const rect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    
    // Check if dropdown would go off-screen
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
      // Position above trigger
      menu.style.top = 'auto';
      menu.style.bottom = '100%';
      menu.style.marginTop = '0';
      menu.style.marginBottom = '2px';
    } else {
      // Position below trigger (default)
      menu.style.top = '100%';
      menu.style.bottom = 'auto';
      menu.style.marginTop = '2px';
      menu.style.marginBottom = '0';
    }
    
    // Check horizontal positioning
    const viewportWidth = window.innerWidth;
    const spaceRight = viewportWidth - rect.left;
    
    if (spaceRight < menuRect.width) {
      // Align to right edge of trigger
      menu.style.left = 'auto';
      menu.style.right = '0';
    } else {
      // Align to left edge of trigger (default)
      menu.style.left = '0';
      menu.style.right = 'auto';
    }
  }
}