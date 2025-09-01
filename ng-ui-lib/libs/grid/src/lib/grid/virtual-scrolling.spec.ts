import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { Grid } from './grid';
import { GridStateService } from '@ng-ui/core';
import { TestGridWrapperComponent } from '../../test-utilities/test-grid-wrapper.component';
import {
  MockDataFactory,
  MockColumnFactory,
  MockConfigFactory,
  TestDOMHelpers,
  TestEventHelpers,
  TestAsyncHelpers,
  TestPerformanceHelpers
} from '../../test-utilities/test-utils';

describe('Grid Component - Virtual Scrolling', () => {
  let wrapperComponent: TestGridWrapperComponent;
  let wrapperFixture: ComponentFixture<TestGridWrapperComponent>;
  let gridStateService: GridStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Grid,
        TestGridWrapperComponent,
        NoopAnimationsModule,
        ScrollingModule,
        DragDropModule
      ],
      providers: [GridStateService]
    }).compileComponents();

    wrapperFixture = TestBed.createComponent(TestGridWrapperComponent);
    wrapperComponent = wrapperFixture.componentInstance;
    gridStateService = TestBed.inject(GridStateService);
  });

  afterEach(() => {
    wrapperFixture?.destroy();
    gridStateService?.reset();
  });

  describe('Virtual Scrolling Configuration', () => {
    it('should enable virtual scrolling by default', () => {
      const config = MockConfigFactory.getDefaultConfig();
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      expect(wrapperComponent.grid.gridConfig().virtualScrolling).toBe(true);
    });

    it('should disable virtual scrolling when configured', () => {
      const config = { ...MockConfigFactory.getDefaultConfig(), virtualScrolling: false };
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      expect(wrapperComponent.grid.gridConfig().virtualScrolling).toBe(false);
    });

    it('should create virtual scroll viewport when enabled', () => {
      const testData = MockDataFactory.generateRows(100);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = MockConfigFactory.getVirtualScrollingConfig();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      const viewport = TestDOMHelpers.getVirtualScrollViewport(wrapperFixture);
      expect(viewport).toBeTruthy();
    });

    it('should set correct item size for virtual scrolling', () => {
      const customRowHeight = 60;
      const config = { ...MockConfigFactory.getVirtualScrollingConfig(), rowHeight: customRowHeight };
      
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      expect(wrapperComponent.grid.itemSize()).toBe(customRowHeight);
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle 10,000 rows efficiently', async () => {
      const largeData = MockDataFactory.generateRows(10000);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = MockConfigFactory.getVirtualScrollingConfig();

      const { time } = await TestPerformanceHelpers.measureTime(async () => {
        wrapperComponent.data = largeData;
        wrapperComponent.columns = testColumns;
        wrapperComponent.config = config;
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      });

      // Should handle large dataset in reasonable time
      expect(time).toBeLessThan(200);
      expect(wrapperComponent.gridData.length).toBe(10000);
    });

    it('should handle 100,000 rows efficiently', async () => {
      const veryLargeData = MockDataFactory.generateLargeDataset(100000);
      const testColumns = MockColumnFactory.getStandardColumns().slice(0, 5); // Fewer columns for performance
      const config = MockConfigFactory.getVirtualScrollingConfig();

      const { time } = await TestPerformanceHelpers.measureTime(async () => {
        wrapperComponent.data = veryLargeData;
        wrapperComponent.columns = testColumns;
        wrapperComponent.config = config;
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      });

      // Should handle very large dataset in reasonable time
      expect(time).toBeLessThan(500);
      expect(wrapperComponent.gridData.length).toBe(100000);
    });

    it('should only render visible rows in DOM', async () => {
      const largeData = MockDataFactory.generateRows(1000);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = MockConfigFactory.getVirtualScrollingConfig();

      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const renderedRows = TestDOMHelpers.getRowElements(wrapperFixture);
      
      // Should only render a subset of rows (virtual scrolling benefit)
      expect(renderedRows.length).toBeLessThan(largeData.length);
      expect(renderedRows.length).toBeGreaterThan(0);
      expect(renderedRows.length).toBeLessThan(50); // Reasonable viewport size
    });
  });

  describe('Scrolling Behavior', () => {
    let largeData: any[];
    let testColumns: any[];

    beforeEach(() => {
      largeData = MockDataFactory.generateRows(1000);
      testColumns = MockColumnFactory.getStandardColumns();
    });

    it('should scroll to specific index', async () => {
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const viewport = TestDOMHelpers.getVirtualScrollViewport(wrapperFixture);
      expect(viewport).toBeTruthy();

      // Test scrolling to index
      const targetIndex = 500;
      wrapperComponent.grid.viewport.scrollToIndex(targetIndex);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Verify the scroll position changed
      expect(viewport!.measureScrollOffset()).toBeGreaterThan(0);
    });

    it('should maintain scroll position during data updates', async () => {
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Scroll to middle
      const viewport = TestDOMHelpers.getVirtualScrollViewport(wrapperFixture);
      wrapperComponent.grid.viewport.scrollToIndex(200);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const scrollOffset = viewport!.measureScrollOffset();

      // Update data
      const updatedData = [...largeData, ...MockDataFactory.generateRows(100)];
      wrapperComponent.data = updatedData;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Scroll position should be maintained or close to original
      const newScrollOffset = viewport!.measureScrollOffset();
      expect(Math.abs(newScrollOffset - scrollOffset)).toBeLessThan(100);
    });

    it('should handle rapid scrolling without performance degradation', async () => {
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const scrollTimes = await TestPerformanceHelpers.measureScrollPerformance(wrapperFixture, 10);
      const averageTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      const maxTime = Math.max(...scrollTimes);

      // Should maintain consistent performance during rapid scrolling
      expect(averageTime).toBeLessThan(16); // 60fps threshold
      expect(maxTime).toBeLessThan(50); // No major spikes
    });

    it('should update visible range correctly during scrolling', async () => {
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const viewport = wrapperComponent.grid.viewport;
      
      // Initial state
      const initialRange = viewport.getRenderedRange();
      expect(initialRange.start).toBe(0);

      // Scroll to middle
      viewport.scrollToIndex(300);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const middleRange = viewport.getRenderedRange();
      expect(middleRange.start).toBeGreaterThan(initialRange.start);

      // Scroll to end
      viewport.scrollToIndex(900);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endRange = viewport.getRenderedRange();
      expect(endRange.start).toBeGreaterThan(middleRange.start);
    });
  });

  describe('Performance Metrics', () => {
    it('should have minimal memory footprint with large datasets', async () => {
      const veryLargeData = MockDataFactory.generateRows(50000);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = MockConfigFactory.getVirtualScrollingConfig();

      // Measure initial memory (approximate)
      const initialHeap = (performance as any).memory?.usedJSHeapSize || 0;

      wrapperComponent.data = veryLargeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const afterRenderHeap = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = afterRenderHeap - initialHeap;

      // Should not consume excessive memory (less than 50MB increase)
      if (initialHeap > 0) {
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }

      // Should only render a small subset of DOM elements
      const renderedRows = TestDOMHelpers.getRowElements(wrapperFixture);
      expect(renderedRows.length).toBeLessThan(100);
    });

    it('should maintain 60fps during continuous scrolling', async () => {
      const largeData = MockDataFactory.generateRows(5000);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = MockConfigFactory.getVirtualScrollingConfig();

      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Simulate continuous scrolling
      const frameTimestamps: number[] = [];
      let frameCount = 0;
      const maxFrames = 60; // Test for 1 second at 60fps

      const measureFrame = () => {
        frameTimestamps.push(performance.now());
        frameCount++;

        if (frameCount < maxFrames) {
          // Continue scrolling
          const scrollPosition = frameCount * 100;
          const viewport = TestDOMHelpers.getVirtualScrollViewport(wrapperFixture);
          viewport!.scrollTop = scrollPosition;
          viewport!.dispatchEvent(new Event('scroll'));
          
          requestAnimationFrame(measureFrame);
        }
      };

      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          measureFrame();
          
          setTimeout(() => {
            // Calculate frame times
            const frameTimes = frameTimestamps.slice(1).map((timestamp, index) => 
              timestamp - frameTimestamps[index]
            );
            
            const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const maxFrameTime = Math.max(...frameTimes);
            
            // Should maintain 60fps (16.67ms per frame)
            expect(averageFrameTime).toBeLessThan(18);
            expect(maxFrameTime).toBeLessThan(50); // Allow some variance
            
            resolve();
          }, 1100);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty dataset with virtual scrolling', () => {
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = [];
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = config;
      
      expect(() => {
        wrapperFixture.detectChanges();
      }).not.toThrow();

      expect(wrapperComponent.gridData).toEqual([]);
    });

    it('should handle single row with virtual scrolling', () => {
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = MockDataFactory.generateRows(1);
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      expect(wrapperComponent.gridData.length).toBe(1);
      
      const renderedRows = TestDOMHelpers.getRowElements(wrapperFixture);
      expect(renderedRows.length).toBe(1);
    });

    it('should handle dynamic row height changes', async () => {
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = MockDataFactory.generateRows(100);
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      expect(wrapperComponent.grid.itemSize()).toBe(40);

      // Change row height
      wrapperComponent.config = { ...config, rowHeight: 80 };
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.grid.itemSize()).toBe(80);
    });

    it('should handle viewport resize correctly', async () => {
      const largeData = MockDataFactory.generateRows(1000);
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const viewport = TestDOMHelpers.getVirtualScrollViewport(wrapperFixture);
      const initialRange = wrapperComponent.grid.viewport.getRenderedRange();

      // Simulate viewport resize
      Object.defineProperty(viewport, 'clientHeight', { value: 800, configurable: true });
      viewport!.dispatchEvent(new Event('resize'));
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const newRange = wrapperComponent.grid.viewport.getRenderedRange();
      
      // Range should be updated to accommodate new viewport size
      expect(newRange.end - newRange.start).toBeGreaterThan(initialRange.end - initialRange.start);
    });
  });
});