import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Charts3d } from './charts-3d';

describe('Charts3d', () => {
  let component: Charts3d;
  let fixture: ComponentFixture<Charts3d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Charts3d],
    }).compileComponents();

    fixture = TestBed.createComponent(Charts3d);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
