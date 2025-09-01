import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartsBi } from './charts-bi';

describe('ChartsBi', () => {
  let component: ChartsBi;
  let fixture: ComponentFixture<ChartsBi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartsBi],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartsBi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
