import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarCore } from './avatar-core';

describe('AvatarCore', () => {
  let component: AvatarCore;
  let fixture: ComponentFixture<AvatarCore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarCore],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarCore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
