import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorThemes } from './editor-themes';

describe('EditorThemes', () => {
  let component: EditorThemes;
  let fixture: ComponentFixture<EditorThemes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorThemes],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorThemes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
