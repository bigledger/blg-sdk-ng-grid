import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorPlugins } from './editor-plugins';

describe('EditorPlugins', () => {
  let component: EditorPlugins;
  let fixture: ComponentFixture<EditorPlugins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorPlugins],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorPlugins);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
