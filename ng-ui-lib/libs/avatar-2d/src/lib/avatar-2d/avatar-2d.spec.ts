import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Avatar2d } from './avatar-2d';

describe('Avatar2d', () => {
  let component: Avatar2d;
  let fixture: ComponentFixture<Avatar2d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avatar2d],
    }).compileComponents();

    fixture = TestBed.createComponent(Avatar2d);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
