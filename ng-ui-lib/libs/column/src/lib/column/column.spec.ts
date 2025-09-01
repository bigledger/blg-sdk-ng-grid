import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Column } from './column';
import { ColumnDefinition } from '@ng-ui/core';

describe('Column', () => {
  let component: Column;
  let fixture: ComponentFixture<Column>;

  const mockColumn: ColumnDefinition = {
    id: 'test',
    field: 'test',
    header: 'Test Column',
    width: 150,
    type: 'string',
    sortable: true,
    filterable: true,
    resizable: true,
    visible: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Column],
    }).compileComponents();

    fixture = TestBed.createComponent(Column);
    component = fixture.componentInstance;
    component.column = mockColumn;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display column header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Column');
  });
});
