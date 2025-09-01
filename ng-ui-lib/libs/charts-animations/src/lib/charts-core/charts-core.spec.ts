import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartsCore } from './charts-core';

describe('ChartsCore', () => {
  let component: ChartsCore;
  let fixture: ComponentFixture<ChartsCore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartsCore],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartsCore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
