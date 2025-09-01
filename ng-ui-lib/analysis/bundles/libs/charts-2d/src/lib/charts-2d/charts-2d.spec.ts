import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Charts2d } from './charts-2d';

describe('Charts2d', () => {
  let component: Charts2d;
  let fixture: ComponentFixture<Charts2d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Charts2d],
    }).compileComponents();

    fixture = TestBed.createComponent(Charts2d);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
