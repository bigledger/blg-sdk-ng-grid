import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Avatar3d } from './avatar-3d';

describe('Avatar3d', () => {
  let component: Avatar3d;
  let fixture: ComponentFixture<Avatar3d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avatar3d],
    }).compileComponents();

    fixture = TestBed.createComponent(Avatar3d);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
