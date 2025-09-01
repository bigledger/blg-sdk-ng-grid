import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ToolbarButtonComponent } from './toolbar-button.component';
import { ToolbarButton } from '../../interfaces/toolbar-config.interface';

@Component({
  template: `
    <ng-ui-toolbar-button
      [button]="button"
      [active]="active"
      [disabled]="disabled"
      [value]="value"
      (click)="onClick($event)"
      (toggle)="onToggle($event)"
    />
  `,
  standalone: true,
  imports: [ToolbarButtonComponent]
})
class TestHostComponent {
  button: ToolbarButton = {
    id: 'test-button',
    type: 'button',
    icon: 'format_bold',
    label: 'Bold',
    tooltip: 'Make text bold'
  };
  active = false;
  disabled = false;
  value: any = null;
  clickEvent: any = null;
  toggleEvent: any = null;

  onClick(event: any) {
    this.clickEvent = event;
  }

  onToggle(active: boolean) {
    this.toggleEvent = active;
    this.active = active;
  }
}

describe('ToolbarButtonComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display button with icon and label', () => {
    const buttonElement = fixture.nativeElement.querySelector('.blg-toolbar-button');
    expect(buttonElement).toBeTruthy();
    
    const iconElement = fixture.nativeElement.querySelector('.blg-toolbar-button__icon');
    expect(iconElement).toBeTruthy();
  });

  it('should handle button clicks', () => {
    const buttonElement = fixture.nativeElement.querySelector('.blg-toolbar-button');
    buttonElement.click();
    
    expect(component.clickEvent).toBeTruthy();
  });

  it('should handle toggle button behavior', () => {
    component.button = { ...component.button, type: 'toggle' };
    fixture.detectChanges();
    
    const buttonElement = fixture.nativeElement.querySelector('.blg-toolbar-button');
    buttonElement.click();
    
    expect(component.toggleEvent).toBe(true);
    expect(component.active).toBe(true);
  });

  it('should display active state for toggle buttons', () => {
    component.button = { ...component.button, type: 'toggle' };
    component.active = true;
    fixture.detectChanges();
    
    const buttonElement = fixture.nativeElement.querySelector('.blg-toolbar-button');
    expect(buttonElement.classList.contains('blg-toolbar-button--active')).toBeTruthy();
  });

  it('should display disabled state', () => {
    component.disabled = true;
    fixture.detectChanges();
    
    const buttonElement = fixture.nativeElement.querySelector('.blg-toolbar-button');
    expect(buttonElement.disabled).toBeTruthy();
    expect(buttonElement.classList.contains('blg-toolbar-button--disabled')).toBeTruthy();
  });

  it('should handle keyboard navigation', () => {
    const buttonElement = fixture.nativeElement.querySelector('.blg-toolbar-button');
    
    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    buttonElement.dispatchEvent(enterEvent);
    
    expect(component.clickEvent).toBeTruthy();
  });

  it('should display tooltip', () => {
    const buttonElement = fixture.nativeElement.querySelector('.blg-toolbar-button');
    expect(buttonElement.title).toBe('Make text bold');
  });

  it('should handle different button types', () => {
    // Test separator type
    component.button = { ...component.button, type: 'separator' };
    fixture.detectChanges();
    
    const separatorElement = fixture.nativeElement.querySelector('.blg-toolbar-button__separator');
    expect(separatorElement).toBeTruthy();
  });
});