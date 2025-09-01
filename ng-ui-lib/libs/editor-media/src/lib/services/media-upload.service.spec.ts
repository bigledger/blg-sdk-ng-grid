import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MediaUploadService } from './media-upload.service';

describe('MediaUploadService', () => {
  let service: MediaUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MediaUploadService]
    });
    service = TestBed.inject(MediaUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate file size', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 * 5 }); // 5MB

    service.configure({
      upload: { maxFileSize: 1024 * 1024 * 10 } // 10MB limit
    });

    const result = service.validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject files that are too large', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 * 15 }); // 15MB

    service.configure({
      upload: { maxFileSize: 1024 * 1024 * 10 } // 10MB limit
    });

    const result = service.validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum allowed size');
  });

  it('should track upload progress', () => {
    expect(service.uploads()).toEqual([]);
    expect(service.activeUploadsCount()).toBe(0);
    expect(service.overallProgress()).toBe(0);
  });
});