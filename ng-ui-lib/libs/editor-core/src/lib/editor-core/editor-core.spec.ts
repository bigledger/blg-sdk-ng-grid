import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorCore } from './editor-core';

describe('EditorCore', () => {
  let component: EditorCore;
  let fixture: ComponentFixture<EditorCore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorCore],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorCore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
