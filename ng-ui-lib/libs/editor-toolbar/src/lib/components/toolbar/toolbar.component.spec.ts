import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ToolbarComponent } from './toolbar.component';
import { ToolbarStateService } from '../../services/toolbar-state.service';
import { TOOLBAR_CONFIGS } from '../../types/toolbar.types';

@Component({
  template: `
    <ng-ui-toolbar
      [config]="config"
      [visible]="visible"
      (buttonClick)="onButtonClick($event)"
    />
  `,
  standalone: true,
  imports: [ToolbarComponent]
})
class TestHostComponent {
  config = TOOLBAR_CONFIGS.MINIMAL;
  visible = true;
  buttonClickEvent: any = null;

  onButtonClick(event: any) {
    this.buttonClickEvent = event;
  }
}

describe('ToolbarComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let toolbarStateService: ToolbarStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [ToolbarStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    toolbarStateService = TestBed.inject(ToolbarStateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display toolbar', () => {
    const toolbarElement = fixture.nativeElement.querySelector('.blg-toolbar');
    expect(toolbarElement).toBeTruthy();
    expect(toolbarElement.hidden).toBeFalsy();
  });

  it('should hide toolbar when visible is false', () => {
    component.visible = false;
    fixture.detectChanges();
    
    const toolbarElement = fixture.nativeElement.querySelector('.blg-toolbar');
    expect(toolbarElement.hidden).toBeTruthy();
  });

  it('should display buttons from configuration', () => {
    const buttons = fixture.nativeElement.querySelectorAll('blg-toolbar-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should apply correct CSS classes based on mode', () => {
    component.config = { ...TOOLBAR_CONFIGS.MINIMAL, mode: 'fixed' };
    fixture.detectChanges();
    
    const toolbarElement = fixture.nativeElement.querySelector('.blg-toolbar');
    expect(toolbarElement.classList.contains('blg-toolbar--fixed')).toBeTruthy();
  });

  it('should handle button clicks', () => {
    // Find a button and simulate click
    const buttonElement = fixture.nativeElement.querySelector('blg-toolbar-button button');
    if (buttonElement) {
      buttonElement.click();
      expect(component.buttonClickEvent).toBeTruthy();
    }
  });

  it('should update when configuration changes', () => {
    const originalMode = component.config.mode;
    component.config = { ...component.config, mode: 'sticky' };
    fixture.detectChanges();
    
    const toolbarElement = fixture.nativeElement.querySelector('.blg-toolbar');
    expect(toolbarElement.classList.contains('blg-toolbar--sticky')).toBeTruthy();
    expect(toolbarElement.classList.contains(`blg-toolbar--${originalMode}`)).toBeFalsy();
  });
});