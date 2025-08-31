import { TestBed } from '@angular/core/testing';
import { DataService } from './data';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty data', () => {
    expect(service.data()).toEqual([]);
    expect(service.totalCount()).toBe(0);
    expect(service.loading()).toBe(false);
  });

  it('should set data correctly', () => {
    const testData = [{ id: 1, name: 'Test' }];
    service.setData(testData);
    
    expect(service.data()).toEqual(testData);
    expect(service.totalCount()).toBe(1);
    expect(service.loading()).toBe(false);
  });
});
