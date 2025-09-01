import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarTts } from './avatar-tts';

describe('AvatarTts', () => {
  let component: AvatarTts;
  let fixture: ComponentFixture<AvatarTts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarTts],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarTts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
