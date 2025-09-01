import { TestBed } from '@angular/core/testing';
import { ToolbarStateService } from './toolbar-state.service';
import { TOOLBAR_CONFIGS } from '../types/toolbar.types';

describe('ToolbarStateService', () => {
  let service: ToolbarStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolbarStateService]
    });
    service = TestBed.inject(ToolbarStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default configuration', () => {
    expect(service.config()).toBeDefined();
    expect(service.config().mode).toBe('fixed');
  });

  it('should update configuration', () => {
    const newConfig = TOOLBAR_CONFIGS.MINIMAL;
    service.updateConfig(newConfig);
    expect(service.config().mode).toBe('inline');
  });

  it('should toggle button active state', () => {
    const config = TOOLBAR_CONFIGS.FULL;
    service.updateConfig(config);
    
    const buttonId = 'bold';
    expect(service.activeButtons().has(buttonId)).toBeFalse();
    
    service.toggleButton(buttonId);
    expect(service.activeButtons().has(buttonId)).toBeTrue();
    
    service.toggleButton(buttonId);
    expect(service.activeButtons().has(buttonId)).toBeFalse();
  });

  it('should set button enabled/disabled state', () => {
    const buttonId = 'bold';
    
    expect(service.disabledButtons().has(buttonId)).toBeFalse();
    
    service.setButtonEnabled(buttonId, false);
    expect(service.disabledButtons().has(buttonId)).toBeTrue();
    
    service.setButtonEnabled(buttonId, true);
    expect(service.disabledButtons().has(buttonId)).toBeFalse();
  });

  it('should store and retrieve button values', () => {
    const buttonId = 'font-size';
    const value = '16px';
    
    service.setButtonValue(buttonId, value);
    expect(service.getButtonValue(buttonId)).toBe(value);
  });

  it('should change toolbar mode', () => {
    service.setMode('floating');
    expect(service.currentMode()).toBe('floating');
    
    service.setMode('sticky');
    expect(service.currentMode()).toBe('sticky');
  });

  it('should emit events when state changes', () => {
    let buttonClickEvent: any = null;
    let modeChangeEvent: any = null;
    
    service.addEventListener('buttonClick', (event) => {
      buttonClickEvent = event;
    });
    
    service.addEventListener('modeChange', (event) => {
      modeChangeEvent = event;
    });
    
    // Setup a button first
    service.updateConfig(TOOLBAR_CONFIGS.FULL);
    
    // Execute button and check event
    service.executeButton('bold');
    expect(buttonClickEvent).toBeTruthy();
    expect(buttonClickEvent.button.id).toBe('bold');
    
    // Change mode and check event
    service.setMode('floating');
    expect(modeChangeEvent).toBeTruthy();
    expect(modeChangeEvent.mode).toBe('floating');
  });

  it('should compute visible and enabled buttons', () => {
    service.updateConfig(TOOLBAR_CONFIGS.FULL);
    
    const visibleButtons = service.visibleButtons();
    expect(visibleButtons.length).toBeGreaterThan(0);
    
    const enabledButtons = service.enabledButtons();
    expect(enabledButtons.length).toBe(visibleButtons.length);
    
    // Disable a button
    service.setButtonEnabled('bold', false);
    const enabledAfterDisable = service.enabledButtons();
    expect(enabledAfterDisable.length).toBe(visibleButtons.length - 1);
  });

  it('should handle floating toolbar visibility', () => {
    service.setMode('floating');
    expect(service.isFloatingMode()).toBeTrue();
    
    // Initially should not show floating toolbar (no selection)
    expect(service.shouldShowFloatingToolbar()).toBeFalse();
  });
});